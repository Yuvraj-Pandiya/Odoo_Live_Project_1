package com.dealflow360.repository;

import com.dealflow360.entity.Approval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApprovalRepository extends JpaRepository<Approval, Long> {
    List<Approval> findByQuotationIdOrderByCreatedAtAsc(Long quotationId);
    List<Approval> findByStatusAndLevel(Approval.ApprovalStatus status, Approval.ApprovalLevel level);
    Optional<Approval> findByQuotationIdAndLevelAndStatus(Long quotationId, Approval.ApprovalLevel level, Approval.ApprovalStatus status);
    long countByStatus(Approval.ApprovalStatus status);
}
