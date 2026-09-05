package com.dealflow360.service;

import com.dealflow360.entity.*;
import com.dealflow360.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Core business logic for computing blended discount risk scores.
 * 
 * Algorithm:
 * 1. For each line, compute "over-limit" = max(0, discount_given - discount_allowed)
 * 2. Worst single line over-limit (severity peak)
 * 3. Weighted sum across all lines (pattern detection)
 * 4. blendedScore = worstLinePeak + (totalOverLimit * 0.5)
 * 5. Route: score > 8 → MANAGER + FINANCE, score > 0 → MANAGER ONLY, 0 → AUTO-APPROVE
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BlendedRiskScoringService {

    private static final BigDecimal MANAGER_THRESHOLD = new BigDecimal("5");
    private static final BigDecimal FINANCE_THRESHOLD  = new BigDecimal("8");
    private static final BigDecimal PATTERN_WEIGHT     = new BigDecimal("0.5");

    public record RiskResult(
        BigDecimal blendedScore,
        Quotation.RiskLevel riskLevel,
        boolean requiresManagerApproval,
        boolean requiresFinanceApproval
    ) {}

    public RiskResult computeRisk(List<QuotationLine> lines) {
        if (lines == null || lines.isEmpty()) {
            return new RiskResult(BigDecimal.ZERO, Quotation.RiskLevel.LOW, false, false);
        }

        BigDecimal worstPeak = BigDecimal.ZERO;
        BigDecimal totalOver = BigDecimal.ZERO;

        for (QuotationLine line : lines) {
            BigDecimal given   = line.getDiscountPct() != null ? line.getDiscountPct() : BigDecimal.ZERO;
            BigDecimal allowed = getEffectiveLimit(line);
            BigDecimal over    = given.subtract(allowed).max(BigDecimal.ZERO);

            if (over.compareTo(worstPeak) > 0) {
                worstPeak = over;
            }
            totalOver = totalOver.add(over);
        }

        // Blended = worst peak + weighted pattern across all lines
        BigDecimal blended = worstPeak.add(totalOver.multiply(PATTERN_WEIGHT))
                                      .setScale(2, RoundingMode.HALF_UP);

        Quotation.RiskLevel level;
        boolean needsManager = false;
        boolean needsFinance = false;

        if (blended.compareTo(FINANCE_THRESHOLD) >= 0) {
            level        = Quotation.RiskLevel.HIGH;
            needsManager = true;
            needsFinance = true;
        } else if (blended.compareTo(MANAGER_THRESHOLD) >= 0 || worstPeak.compareTo(BigDecimal.ONE) > 0) {
            level        = Quotation.RiskLevel.MEDIUM;
            needsManager = true;
        } else if (blended.compareTo(BigDecimal.ZERO) > 0) {
            level        = Quotation.RiskLevel.LOW;
            needsManager = true;
        } else {
            level = Quotation.RiskLevel.LOW;
        }

        log.debug("Risk computed: worst={}, total={}, blended={}, level={}", worstPeak, totalOver, blended, level);
        return new RiskResult(blended, level, needsManager, needsFinance);
    }

    private BigDecimal getEffectiveLimit(QuotationLine line) {
        // Category-level limit takes precedence over tier limit
        if (line.getProduct() != null && line.getProduct().getCategory() != null) {
            BigDecimal catLimit = line.getProduct().getCategory().getMaxDiscount();
            if (catLimit != null) return catLimit;
        }
        // Fall back to line's stored allowed amount
        return line.getDiscountAllowed() != null ? line.getDiscountAllowed() : new BigDecimal("15");
    }
}
