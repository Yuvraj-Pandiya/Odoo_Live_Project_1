package com.dealflow360.repository;

import com.dealflow360.entity.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    List<Quotation> findBySalesRepIdOrderByCreatedAtDesc(Long salesRepId);
    List<Quotation> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Quotation> findByStatusOrderByCreatedAtDesc(Quotation.QuotationStatus status);
    Optional<Quotation> findByPortalToken(String portalToken);
    Optional<Quotation> findByQuoteNumber(String quoteNumber);

    @Query("SELECT q FROM Quotation q WHERE q.status IN ('DRAFT','PENDING_APPROVAL','NEGOTIATION') AND q.lastActivityAt < :threshold")
    List<Quotation> findStalledQuotations(@Param("threshold") OffsetDateTime threshold);

    @Query("SELECT q FROM Quotation q ORDER BY q.createdAt DESC")
    List<Quotation> findAllOrderByCreatedAtDesc();

    @Query("SELECT COUNT(q) FROM Quotation q WHERE q.status = :status")
    long countByStatus(@Param("status") Quotation.QuotationStatus status);
}
