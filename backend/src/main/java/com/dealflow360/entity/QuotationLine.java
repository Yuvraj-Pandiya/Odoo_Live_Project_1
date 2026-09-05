package com.dealflow360.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "quotation_lines", schema = "dealflow")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuotationLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quotation_id", nullable = false)
    private Quotation quotation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"category", "variants", "hibernateLazyInitializer", "handler"})
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    private String description;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "line_type", columnDefinition = "line_type")
    private LineType lineType = LineType.ONE_TIME;

    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "cost_price")
    private BigDecimal costPrice;

    @Builder.Default
    @Column(name = "discount_pct")
    private BigDecimal discountPct = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "discount_allowed")
    private BigDecimal discountAllowed = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "tax_pct")
    private BigDecimal taxPct = BigDecimal.ZERO;

    @Column(name = "line_total")
    private BigDecimal lineTotal;

    @Column(name = "margin_amount")
    private BigDecimal marginAmount;

    @Column(name = "margin_pct")
    private BigDecimal marginPct;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", columnDefinition = "billing_cycle")
    private Product.BillingCycle billingCycle;

    @Builder.Default
    @Column(name = "is_upsell")
    private Boolean isUpsell = false;

    @Builder.Default
    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    public enum LineType { ONE_TIME, RECURRING }
}
