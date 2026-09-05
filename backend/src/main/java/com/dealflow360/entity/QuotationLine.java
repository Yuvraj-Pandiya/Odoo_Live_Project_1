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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quotation_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Quotation quotation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "line_type", columnDefinition = "line_type")
    @Builder.Default
    private LineType lineType = LineType.ONE_TIME;

    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "cost_price")
    private BigDecimal costPrice;

    @Column(name = "discount_pct")
    @Builder.Default
    private BigDecimal discountPct = BigDecimal.ZERO;

    @Column(name = "discount_allowed")
    @Builder.Default
    private BigDecimal discountAllowed = BigDecimal.ZERO;

    @Column(name = "tax_pct")
    @Builder.Default
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

    @Column(name = "is_upsell")
    @Builder.Default
    private Boolean isUpsell = false;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    public enum LineType { ONE_TIME, RECURRING }
}
