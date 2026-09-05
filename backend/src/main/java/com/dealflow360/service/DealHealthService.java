package com.dealflow360.service;

import com.dealflow360.entity.*;
import com.dealflow360.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DealHealthService {

    private final QuotationRepository quotationRepository;
    private final DealHealthAlertRepository alertRepository;

    @Value("${deal-health.stall-days:7}")
    private int stallDays;

    /**
     * Scheduled check: runs every hour.
     * Detects stalled quotes (idle > stallDays).
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void detectStalledDeals() {
        OffsetDateTime threshold = OffsetDateTime.now().minusDays(stallDays);
        List<Quotation> stalled  = quotationRepository.findStalledQuotations(threshold);

        for (Quotation q : stalled) {
            boolean alreadyFlagged = alertRepository
                .existsByQuotationIdAndAlertTypeAndIsResolvedFalse(q.getId(), DealHealthAlert.AlertType.STALLED_DEAL);
            if (!alreadyFlagged) {
                DealHealthAlert alert = DealHealthAlert.builder()
                    .quotation(q)
                    .alertType(DealHealthAlert.AlertType.STALLED_DEAL)
                    .description("Quote " + q.getQuoteNumber() + " has been idle for " + stallDays + "+ days")
                    .flaggedAt(OffsetDateTime.now())
                    .build();
                alertRepository.save(alert);
                log.info("Stall alert created for quotation {}", q.getQuoteNumber());
            }
        }
    }

    public List<DealHealthAlert> getActiveAlerts() {
        return alertRepository.findByIsResolvedFalseOrderByFlaggedAtDesc();
    }

    @Transactional
    public DealHealthAlert resolveAlert(Long alertId, String actionTaken) {
        DealHealthAlert alert = alertRepository.findById(alertId)
            .orElseThrow(() -> new com.dealflow360.exception.ResourceNotFoundException("Alert not found: " + alertId));
        alert.setIsResolved(true);
        alert.setActionTaken(actionTaken);
        alert.setResolvedAt(OffsetDateTime.now());
        return alertRepository.save(alert);
    }
}
