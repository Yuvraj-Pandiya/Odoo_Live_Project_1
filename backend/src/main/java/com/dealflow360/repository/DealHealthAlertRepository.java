package com.dealflow360.repository;

import com.dealflow360.entity.DealHealthAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DealHealthAlertRepository extends JpaRepository<DealHealthAlert, Long> {
    List<DealHealthAlert> findByIsResolvedFalseOrderByFlaggedAtDesc();
    List<DealHealthAlert> findByQuotationId(Long quotationId);
    boolean existsByQuotationIdAndAlertTypeAndIsResolvedFalse(Long quotationId, DealHealthAlert.AlertType alertType);
}
