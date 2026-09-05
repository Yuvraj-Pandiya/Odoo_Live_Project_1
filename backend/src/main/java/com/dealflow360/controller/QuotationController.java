package com.dealflow360.controller;

import com.dealflow360.entity.*;
import com.dealflow360.repository.*;
import com.dealflow360.service.QuotationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quotations")
@RequiredArgsConstructor
public class QuotationController {

    private final QuotationService quotationService;
    private final QuotationRepository quotationRepository;
    private final UserRepository userRepository;

    public static class CreateQuotationRequest {
        public Long customerId;
        public Long customer_id;
        public Long salesRepId;
        public Long sales_rep_id;
        public String notes;

        public Long getEffectiveCustomerId() {
            return customerId != null ? customerId : (customer_id != null ? customer_id : 1L);
        }

        public Long getEffectiveSalesRepId() {
            return salesRepId != null ? salesRepId : sales_rep_id;
        }
    }

    public static class AddLineRequest {
        public Long productId;
        public Long product_id;
        public Integer quantity;
        public BigDecimal discountPct;
        public BigDecimal discount_pct;
        public BigDecimal discount;

        public Long getEffectiveProductId() {
            return productId != null ? productId : (product_id != null ? product_id : 1L);
        }

        public int getEffectiveQuantity() {
            return (quantity != null && quantity > 0) ? quantity : 1;
        }

        public BigDecimal getEffectiveDiscountPct() {
            if (discountPct != null) return discountPct;
            if (discount_pct != null) return discount_pct;
            if (discount != null) return discount;
            return BigDecimal.ZERO;
        }
    }

    public static class ApprovalRequest {
        public String decision;
        public String status;
        public String action;
        public String level;
        public String notes;

        public Approval.ApprovalStatus getEffectiveDecision(Approval.ApprovalStatus defaultStatus) {
            String val = decision != null ? decision : (status != null ? status : action);
            if (val == null) return defaultStatus;
            val = val.trim().toUpperCase();
            if (val.contains("APPROV")) return Approval.ApprovalStatus.APPROVED;
            if (val.contains("REJECT")) return Approval.ApprovalStatus.REJECTED;
            if (val.contains("RETURN")) return Approval.ApprovalStatus.RETURNED;
            return defaultStatus;
        }

        public Approval.ApprovalLevel getEffectiveLevel(Approval.ApprovalLevel defaultLevel) {
            if (level == null) return defaultLevel;
            String val = level.trim().toUpperCase();
            if (val.contains("FINANCE")) return Approval.ApprovalLevel.FINANCE;
            return Approval.ApprovalLevel.MANAGER;
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<List<Quotation>> listAll(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        if (user.getRole() == User.UserRole.SALES_REP) {
            return ResponseEntity.ok(quotationRepository.findBySalesRepIdOrderByCreatedAtDesc(user.getId()));
        }
        return ResponseEntity.ok(quotationRepository.findAllOrderByCreatedAtDesc());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<Quotation> getById(@PathVariable Long id) {
        return quotationRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'ADMIN')")
    public ResponseEntity<Quotation> create(
        @RequestBody(required = false) CreateQuotationRequest req,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Long customerId = req != null ? req.getEffectiveCustomerId() : 1L;
        Long repId = user.getId();
        if ((user.getRole() == User.UserRole.MANAGER || user.getRole() == User.UserRole.ADMIN) 
                && req != null && req.getEffectiveSalesRepId() != null) {
            repId = req.getEffectiveSalesRepId();
        }
        return ResponseEntity.ok(quotationService.createQuotation(customerId, repId));
    }

    @PostMapping({"/{id}/lines", "/{id}/line"})
    @PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'ADMIN')")
    public ResponseEntity<Quotation> addLine(
        @PathVariable Long id,
        @RequestBody(required = false) AddLineRequest req
    ) {
        Long prodId = req != null ? req.getEffectiveProductId() : 1L;
        int qty = req != null ? req.getEffectiveQuantity() : 1;
        BigDecimal disc = req != null ? req.getEffectiveDiscountPct() : BigDecimal.ZERO;
        return ResponseEntity.ok(quotationService.addLine(id, prodId, qty, disc));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'ADMIN')")
    public ResponseEntity<Quotation> submit(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(quotationService.submitForApproval(id, user.getId()));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<Quotation> approve(
        @PathVariable Long id,
        @RequestParam(name = "level", required = false) String levelParam,
        @RequestBody(required = false) ApprovalRequest req,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        Approval.ApprovalLevel level = Approval.ApprovalLevel.MANAGER;
        if (levelParam != null && !levelParam.isBlank()) {
            if (levelParam.trim().equalsIgnoreCase("FINANCE")) level = Approval.ApprovalLevel.FINANCE;
        } else if (req != null) {
            level = req.getEffectiveLevel(Approval.ApprovalLevel.MANAGER);
        }

        // Validate role matches required level
        if (level == Approval.ApprovalLevel.FINANCE && user.getRole() == User.UserRole.MANAGER) {
            throw new org.springframework.security.access.AccessDeniedException("Manager role cannot execute Finance level approval");
        }
        if (level == Approval.ApprovalLevel.MANAGER && user.getRole() == User.UserRole.FINANCE) {
            throw new org.springframework.security.access.AccessDeniedException("Finance role cannot execute Manager level approval");
        }

        Approval.ApprovalStatus decision = req != null
            ? req.getEffectiveDecision(Approval.ApprovalStatus.APPROVED)
            : Approval.ApprovalStatus.APPROVED;

        String notes = req != null && req.notes != null ? req.notes : "Approved via API";
        return ResponseEntity.ok(quotationService.processApproval(id, user.getId(), level, decision, notes));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<Quotation> reject(
        @PathVariable Long id,
        @RequestParam(name = "level", required = false) String levelParam,
        @RequestBody(required = false) ApprovalRequest req,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        Approval.ApprovalLevel level = Approval.ApprovalLevel.MANAGER;
        if (levelParam != null && !levelParam.isBlank()) {
            if (levelParam.trim().equalsIgnoreCase("FINANCE")) level = Approval.ApprovalLevel.FINANCE;
        } else if (req != null) {
            level = req.getEffectiveLevel(Approval.ApprovalLevel.MANAGER);
        }

        if (level == Approval.ApprovalLevel.FINANCE && user.getRole() == User.UserRole.MANAGER) {
            throw new org.springframework.security.access.AccessDeniedException("Manager role cannot execute Finance level rejection");
        }
        if (level == Approval.ApprovalLevel.MANAGER && user.getRole() == User.UserRole.FINANCE) {
            throw new org.springframework.security.access.AccessDeniedException("Finance role cannot execute Manager level rejection");
        }

        Approval.ApprovalStatus decision = req != null
            ? req.getEffectiveDecision(Approval.ApprovalStatus.REJECTED)
            : Approval.ApprovalStatus.REJECTED;

        String notes = req != null && req.notes != null ? req.notes : "Rejected via API";
        return ResponseEntity.ok(quotationService.processApproval(id, user.getId(), level, decision, notes));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> stats() {
        return ResponseEntity.ok(Map.of(
            "total",       quotationRepository.count(),
            "draft",       quotationRepository.countByStatus(Quotation.QuotationStatus.DRAFT),
            "pending",     quotationRepository.countByStatus(Quotation.QuotationStatus.PENDING_APPROVAL),
            "approved",    quotationRepository.countByStatus(Quotation.QuotationStatus.APPROVED),
            "confirmed",   quotationRepository.countByStatus(Quotation.QuotationStatus.CONFIRMED)
        ));
    }
}
