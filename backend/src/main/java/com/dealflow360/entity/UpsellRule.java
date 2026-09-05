package com.dealflow360.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "upsell_rules", schema = "dealflow")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpsellRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trigger_product_id", nullable = false)
    private Product triggerProduct;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suggest_product_id", nullable = false)
    private Product suggestProduct;

    @Column(name = "co_purchase_count")
    private Integer coPurchaseCount = 0;

    @Column(name = "is_promoted")
    private Boolean isPromoted = false;

    @Column(name = "min_margin_pct")
    private BigDecimal minMarginPct;

    private Integer priority = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
