package com.dealflow360.repository;

import com.dealflow360.entity.ApprovalAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalAuditLogRepository extends JpaRepository<ApprovalAuditLog, Long> {
    List<ApprovalAuditLog> findByQuotationIdOrderByCreatedAtAsc(Long quotationId);
}
