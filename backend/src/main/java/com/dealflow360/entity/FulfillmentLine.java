package com.dealflow360.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "fulfillment_lines", schema = "dealflow")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FulfillmentLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fulfillment_order_id", nullable = false)
    private FulfillmentOrder fulfillmentOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quotation_line_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"quotation", "hibernateLazyInitializer", "handler"})
    private QuotationLine quotationLine;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"stocks", "hibernateLazyInitializer", "handler"})
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"category", "variants", "hibernateLazyInitializer", "handler"})
    private Product product;

    @Builder.Default
    @Column(name = "quantity_allocated")
    private Integer quantityAllocated = 0;

    @Builder.Default
    @Column(name = "quantity_fulfilled")
    private Integer quantityFulfilled = 0;

    @Builder.Default
    @Column(name = "is_backorder")
    private Boolean isBackorder = false;

    @Column(name = "estimated_ship_date")
    private LocalDate estimatedShipDate;

    @Builder.Default
    @Column(name = "shipping_cost")
    private BigDecimal shippingCost = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
