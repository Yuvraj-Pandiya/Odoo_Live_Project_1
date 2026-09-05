package com.dealflow360.controller;

import com.dealflow360.entity.*;
import com.dealflow360.repository.*;
import com.dealflow360.service.DealHealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final QuotationRepository quotationRepository;
    private final ApprovalRepository approvalRepository;
    private final InvoiceRepository invoiceRepository;
    private final DealHealthAlertRepository alertRepository;
    private final DealHealthService dealHealthService;

    @GetMapping("/stats")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> stats() {
        long totalQuotes   = quotationRepository.count();
        long pendingApprovals = approvalRepository.countByStatus(Approval.ApprovalStatus.PENDING);
        long activeAlerts  = alertRepository.findByIsResolvedFalseOrderByFlaggedAtDesc().size();

        return ResponseEntity.ok(Map.of(
            "openQuotations",    quotationRepository.countByStatus(Quotation.QuotationStatus.DRAFT),
            "pendingApprovals",  pendingApprovals,
            "activeQuotes",      totalQuotes,
            "activeAlerts",      activeAlerts,
            "confirmedThisMonth", quotationRepository.countByStatus(Quotation.QuotationStatus.CONFIRMED)
        ));
    }

    @GetMapping("/alerts")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<List<DealHealthAlert>> activeAlerts() {
        return ResponseEntity.ok(dealHealthService.getActiveAlerts());
    }

    @PostMapping("/alerts/{id}/resolve")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<DealHealthAlert> resolve(@PathVariable Long id, @RequestParam String action) {
        return ResponseEntity.ok(dealHealthService.resolveAlert(id, action));
    }

    @GetMapping("/approvals/pending")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<List<Approval>> pendingApprovals() {
        return ResponseEntity.ok(approvalRepository.findByStatusAndLevel(
            Approval.ApprovalStatus.PENDING, Approval.ApprovalLevel.MANAGER
        ));
    }

    @GetMapping("/invoices")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('FINANCE', 'ADMIN')")
    public ResponseEntity<List<Invoice>> recentInvoices() {
        return ResponseEntity.ok(invoiceRepository.findByStatusOrderByCreatedAtDesc(Invoice.InvoiceStatus.UNPAID));
    }
}
