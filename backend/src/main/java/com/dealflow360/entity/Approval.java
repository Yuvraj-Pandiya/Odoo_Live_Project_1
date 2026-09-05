package com.dealflow360.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "approvals", schema = "dealflow")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Approval {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quotation_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Quotation quotation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id")
    private User approver;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "approval_level")
    private ApprovalLevel level;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "approval_status")
    @Builder.Default
    private ApprovalStatus status = ApprovalStatus.PENDING;

    private String notes;

    @Column(name = "decided_at")
    private OffsetDateTime decidedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    public enum ApprovalLevel { MANAGER, FINANCE }
    public enum ApprovalStatus { PENDING, APPROVED, REJECTED, RETURNED }
}
