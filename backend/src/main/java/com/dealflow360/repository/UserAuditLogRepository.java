package com.dealflow360.repository;

import com.dealflow360.entity.UserAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserAuditLogRepository extends JpaRepository<UserAuditLog, Long> {
    List<UserAuditLog> findTop100ByOrderByCreatedAtDesc();
    List<UserAuditLog> findByTargetUserIdOrderByCreatedAtDesc(Long targetUserId);
}
