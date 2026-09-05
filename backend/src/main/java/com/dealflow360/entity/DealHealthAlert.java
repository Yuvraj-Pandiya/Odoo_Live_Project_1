package com.dealflow360.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "deal_health_alerts", schema = "dealflow")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DealHealthAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quotation_id", nullable = false)
    private Quotation quotation;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", columnDefinition = "alert_type")
    private AlertType alertType;

    @Column(nullable = false)
    private String description;

    @Column(name = "is_resolved")
    private Boolean isResolved = false;

    @Column(name = "action_taken")
    private String actionTaken;

    @Column(name = "flagged_at")
    private OffsetDateTime flaggedAt;

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    public enum AlertType {
        STALLED_DEAL, DISCOUNT_ANOMALY, DELIVERY_SLIPPAGE, BACKORDER_RESOLVED
    }
}
