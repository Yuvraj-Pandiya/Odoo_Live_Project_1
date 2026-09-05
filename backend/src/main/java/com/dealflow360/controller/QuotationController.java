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

    record CreateQuotationRequest(@NotNull Long customerId) {}
    record AddLineRequest(@NotNull Long productId, int quantity, BigDecimal discountPct) {}
    record ApprovalRequest(@NotNull Approval.ApprovalStatus decision, String notes) {}

    @GetMapping
    public ResponseEntity<List<Quotation>> listAll(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        if (user.getRole() == User.UserRole.SALES_REP) {
            return ResponseEntity.ok(quotationRepository.findBySalesRepIdOrderByCreatedAtDesc(user.getId()));
        }
        return ResponseEntity.ok(quotationRepository.findAllOrderByCreatedAtDesc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quotation> getById(@PathVariable Long id) {
        return quotationRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SALES_REP','MANAGER','ADMIN')")
    public ResponseEntity<Quotation> create(
        @Valid @RequestBody CreateQuotationRequest req,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(quotationService.createQuotation(req.customerId(), user.getId()));
    }

    @PostMapping("/{id}/lines")
    public ResponseEntity<Quotation> addLine(@PathVariable Long id, @Valid @RequestBody AddLineRequest req) {
        return ResponseEntity.ok(quotationService.addLine(id, req.productId(), req.quantity(), req.discountPct()));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<Quotation> submit(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(quotationService.submitForApproval(id, user.getId()));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('MANAGER','FINANCE','ADMIN')")
    public ResponseEntity<Quotation> approve(
        @PathVariable Long id,
        @RequestParam Approval.ApprovalLevel level,
        @Valid @RequestBody ApprovalRequest req,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(quotationService.processApproval(id, user.getId(), level, req.decision(), req.notes()));
    }

    @GetMapping("/stats")
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
