package com.dealflow360.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "user_audit_logs", schema = "dealflow")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actor_user_id")
    private Long actorUserId;

    @Column(name = "actor_email", nullable = false)
    private String actorEmail;

    @Column(name = "target_user_id")
    private Long targetUserId;

    @Column(name = "target_email", nullable = false)
    private String targetEmail;

    @Column(nullable = false)
    private String action; // USER_CREATED, USER_UPDATED, ROLE_CHANGED, USER_DEACTIVATED, USER_REACTIVATED, PASSWORD_CHANGED

    @Column(name = "old_value")
    private String oldValue;

    @Column(name = "new_value")
    private String newValue;

    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
