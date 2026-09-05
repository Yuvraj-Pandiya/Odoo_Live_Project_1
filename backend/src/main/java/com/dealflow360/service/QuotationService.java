package com.dealflow360.service;

import com.dealflow360.entity.*;
import com.dealflow360.exception.ResourceNotFoundException;
import com.dealflow360.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ApprovalRepository approvalRepository;
    private final ApprovalAuditLogRepository auditLogRepository;
    private final BlendedRiskScoringService riskService;
    private final FulfillmentService fulfillmentService;

    private static final String QUOTE_PREFIX = "Q-";

    /** Create a new draft quotation */
    public Quotation createQuotation(Long customerId, Long salesRepId) {
        Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerId));
        User rep = userRepository.findById(salesRepId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + salesRepId));

        String quoteNumber = generateQuoteNumber();
        String portalToken = UUID.randomUUID().toString();

        Quotation q = Quotation.builder()
            .quoteNumber(quoteNumber)
            .customer(customer)
            .salesRep(rep)
            .status(Quotation.QuotationStatus.DRAFT)
            .currency(customer.getCurrency())
            .lines(new ArrayList<>())
            .portalToken(portalToken)
            .lastActivityAt(OffsetDateTime.now())
            .build();

        return quotationRepository.save(q);
    }

    /** Add a product line to a quotation with live margin + risk recalculation */
    public Quotation addLine(Long quotationId, Long productId, int quantity, BigDecimal discountPct) {
        Quotation q = getQuotation(quotationId);
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        BigDecimal unitPrice = product.getBasePrice();
        BigDecimal discountAllowed = product.getCategory() != null
            ? product.getCategory().getMaxDiscount()
            : new BigDecimal("15");

        BigDecimal effectiveDiscount = discountPct != null ? discountPct : BigDecimal.ZERO;
        BigDecimal discountedPrice   = unitPrice.multiply(BigDecimal.ONE.subtract(effectiveDiscount.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)));
        BigDecimal taxMult           = BigDecimal.ONE.add(product.getTaxPercentage().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
        BigDecimal lineTotal         = discountedPrice.multiply(BigDecimal.valueOf(quantity)).multiply(taxMult).setScale(2, RoundingMode.HALF_UP);

        BigDecimal marginAmt = BigDecimal.ZERO;
        BigDecimal marginPct = BigDecimal.ZERO;
        if (product.getCostPrice() != null) {
            BigDecimal revenue = discountedPrice.multiply(BigDecimal.valueOf(quantity));
            BigDecimal cost    = product.getCostPrice().multiply(BigDecimal.valueOf(quantity));
            marginAmt = revenue.subtract(cost).setScale(2, RoundingMode.HALF_UP);
            marginPct = revenue.compareTo(BigDecimal.ZERO) > 0
                ? marginAmt.divide(revenue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        }

        QuotationLine.LineType lineType = product.getIsSubscription() ? QuotationLine.LineType.RECURRING : QuotationLine.LineType.ONE_TIME;

        QuotationLine line = QuotationLine.builder()
            .quotation(q)
            .product(product)
            .lineType(lineType)
            .quantity(quantity)
            .unitPrice(unitPrice)
            .costPrice(product.getCostPrice())
            .discountPct(effectiveDiscount)
            .discountAllowed(discountAllowed)
            .taxPct(product.getTaxPercentage())
            .lineTotal(lineTotal)
            .marginAmount(marginAmt)
            .marginPct(marginPct)
            .billingCycle(product.getBillingCycle())
            .sortOrder(q.getLines() != null ? q.getLines().size() : 0)
            .build();

        if (q.getLines() == null) q.setLines(new ArrayList<>());
        q.getLines().add(line);

        recalculateTotals(q);
        q.setLastActivityAt(OffsetDateTime.now());
        return quotationRepository.save(q);
    }

    /** Submit quotation for approval — triggers risk computation and approval routing */
    public Quotation submitForApproval(Long quotationId, Long userId) {
        Quotation q = getQuotation(quotationId);

        // Compute blended risk score
        BlendedRiskScoringService.RiskResult risk = riskService.computeRisk(q.getLines());
        q.setBlendedRiskScore(risk.blendedScore());
        q.setRiskLevel(risk.riskLevel());

        if (!risk.requiresManagerApproval()) {
            // Auto-approve
            q.setStatus(Quotation.QuotationStatus.APPROVED);
            q.setApprovedAt(OffsetDateTime.now());
            logAudit(q, userId, "AUTO_APPROVED", "No approval threshold exceeded", "DRAFT", "APPROVED");
            // Trigger fulfillment split
            fulfillmentService.createFulfillmentSplit(q);
        } else {
            q.setStatus(Quotation.QuotationStatus.PENDING_APPROVAL);
            q.setSubmittedAt(OffsetDateTime.now());

            // Create MANAGER approval step
            Approval managerApproval = Approval.builder()
                .quotation(q).level(Approval.ApprovalLevel.MANAGER).status(Approval.ApprovalStatus.PENDING).build();
            approvalRepository.save(managerApproval);

            if (risk.requiresFinanceApproval()) {
                // Create FINANCE approval step (starts as pending, activated after manager approves)
                Approval financeApproval = Approval.builder()
                    .quotation(q).level(Approval.ApprovalLevel.FINANCE).status(Approval.ApprovalStatus.PENDING).build();
                approvalRepository.save(financeApproval);
            }

            logAudit(q, userId, "SUBMITTED", "Submitted for approval. Risk: " + risk.riskLevel(), "DRAFT", "PENDING_APPROVAL");
        }

        q.setLastActivityAt(OffsetDateTime.now());
        return quotationRepository.save(q);
    }

    /** Approve or reject a quotation at a given level */
    public Quotation processApproval(Long quotationId, Long approverId, Approval.ApprovalLevel level,
                                     Approval.ApprovalStatus decision, String notes) {
        Quotation q = getQuotation(quotationId);
        Approval approval = approvalRepository
            .findByQuotationIdAndLevelAndStatus(quotationId, level, Approval.ApprovalStatus.PENDING)
            .orElseThrow(() -> new ResourceNotFoundException("No pending approval at level " + level));

        User approver = userRepository.findById(approverId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + approverId));

        approval.setApprover(approver);
        approval.setStatus(decision);
        approval.setNotes(notes);
        approval.setDecidedAt(OffsetDateTime.now());
        approvalRepository.save(approval);

        logAudit(q, approverId, decision.name(), notes, "PENDING_APPROVAL", null);

        if (decision == Approval.ApprovalStatus.REJECTED) {
            q.setStatus(Quotation.QuotationStatus.REJECTED);
        } else if (decision == Approval.ApprovalStatus.RETURNED) {
            q.setStatus(Quotation.QuotationStatus.DRAFT);
        } else if (decision == Approval.ApprovalStatus.APPROVED) {
            // Check if there's a next pending level
            List<Approval> allApprovals = approvalRepository.findByQuotationIdOrderByCreatedAtAsc(quotationId);
            boolean hasNextPending = allApprovals.stream()
                .anyMatch(a -> a.getStatus() == Approval.ApprovalStatus.PENDING && a.getLevel() != level);

            if (hasNextPending) {
                logAudit(q, approverId, "PARTIAL_APPROVAL", "Manager approved — awaiting Finance", null, null);
            } else {
                q.setStatus(Quotation.QuotationStatus.APPROVED);
                q.setApprovedAt(OffsetDateTime.now());
                fulfillmentService.createFulfillmentSplit(q);
                logAudit(q, approverId, "FULLY_APPROVED", "All approval levels cleared", null, "APPROVED");
            }
        }

        q.setLastActivityAt(OffsetDateTime.now());
        return quotationRepository.save(q);
    }

    /** Customer confirms quotation from the portal */
    public Quotation confirmByCustomer(String portalToken) {
        Quotation q = quotationRepository.findByPortalToken(portalToken)
            .orElseThrow(() -> new ResourceNotFoundException("Quotation not found"));

        // Re-check risk on confirmed terms
        BlendedRiskScoringService.RiskResult risk = riskService.computeRisk(q.getLines());
        q.setBlendedRiskScore(risk.blendedScore());

        if (risk.requiresManagerApproval()) {
            // Re-enter approval flow
            q.setStatus(Quotation.QuotationStatus.PENDING_APPROVAL);
            q.setSubmittedAt(OffsetDateTime.now());
            Approval approval = Approval.builder()
                .quotation(q).level(Approval.ApprovalLevel.MANAGER).status(Approval.ApprovalStatus.PENDING).build();
            approvalRepository.save(approval);
            logAudit(q, null, "CUSTOMER_RESUBMITTED", "Counter-offer re-entered approval flow", null, "PENDING_APPROVAL");
        } else {
            q.setStatus(Quotation.QuotationStatus.CONFIRMED);
            q.setConfirmedAt(OffsetDateTime.now());
            logAudit(q, null, "CUSTOMER_CONFIRMED", "Customer confirmed quotation", null, "CONFIRMED");
        }

        q.setLastActivityAt(OffsetDateTime.now());
        return quotationRepository.save(q);
    }

    private void recalculateTotals(Quotation q) {
        BigDecimal subtotal  = BigDecimal.ZERO;
        BigDecimal taxTotal  = BigDecimal.ZERO;
        BigDecimal discTotal = BigDecimal.ZERO;

        for (QuotationLine line : q.getLines()) {
            BigDecimal base     = line.getUnitPrice().multiply(BigDecimal.valueOf(line.getQuantity()));
            BigDecimal discAmt  = base.multiply(line.getDiscountPct().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
            BigDecimal taxAmt   = base.subtract(discAmt).multiply(line.getTaxPct().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
            subtotal  = subtotal.add(base.subtract(discAmt));
            taxTotal  = taxTotal.add(taxAmt);
            discTotal = discTotal.add(discAmt);
        }

        q.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
        q.setTaxTotal(taxTotal.setScale(2, RoundingMode.HALF_UP));
        q.setDiscountTotal(discTotal.setScale(2, RoundingMode.HALF_UP));
        q.setGrandTotal(subtotal.add(taxTotal).setScale(2, RoundingMode.HALF_UP));
    }

    private Quotation getQuotation(Long id) {
        return quotationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Quotation not found: " + id));
    }

    private String generateQuoteNumber() {
        long count = quotationRepository.count() + 1000;
        return QUOTE_PREFIX + count;
    }

    private void logAudit(Quotation q, Long userId, String action, String notes, String oldStatus, String newStatus) {
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;
        ApprovalAuditLog log = ApprovalAuditLog.builder()
            .quotation(q).user(user).action(action).notes(notes)
            .oldStatus(oldStatus).newStatus(newStatus).build();
        auditLogRepository.save(log);
    }
}
