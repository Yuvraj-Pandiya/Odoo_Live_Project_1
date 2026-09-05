package com.dealflow360.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "products", schema = "dealflow")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String sku;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ProductCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", columnDefinition = "product_type")
    private ProductType productType = ProductType.PHYSICAL;

    @Column(name = "base_price", nullable = false)
    private BigDecimal basePrice;

    @Column(name = "cost_price")
    private BigDecimal costPrice;

    private String unit = "Each";

    @Column(name = "tax_percentage")
    private BigDecimal taxPercentage = BigDecimal.ZERO;

    private String description;

    @Column(name = "is_subscription")
    private Boolean isSubscription = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", columnDefinition = "billing_cycle")
    private BillingCycle billingCycle;

    @Column(name = "is_promoted")
    private Boolean isPromoted = false;

    @Column(name = "min_margin_pct")
    private BigDecimal minMarginPct;

    @Column(name = "quantity_on_hand")
    private Integer quantityOnHand = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProductVariant> variants;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PriceList> priceLists;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public enum ProductType { PHYSICAL, SERVICE, SUBSCRIPTION }
    public enum BillingCycle { MONTHLY, QUARTERLY, YEARLY }
}
