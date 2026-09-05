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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "trigger_product_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"category", "variants", "hibernateLazyInitializer", "handler"})
    private Product triggerProduct;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "suggest_product_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"category", "variants", "hibernateLazyInitializer", "handler"})
    private Product suggestProduct;

    @Builder.Default
    @Column(name = "co_purchase_count")
    private Integer coPurchaseCount = 0;

    @Builder.Default
    @Column(name = "is_promoted")
    private Boolean isPromoted = false;

    @Column(name = "min_margin_pct")
    private BigDecimal minMarginPct;

    @Builder.Default
    private Integer priority = 0;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
