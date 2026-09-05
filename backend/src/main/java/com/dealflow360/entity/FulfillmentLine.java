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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fulfillment_order_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private FulfillmentOrder fulfillmentOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quotation_line_id", nullable = false)
    private QuotationLine quotationLine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "quantity_allocated")
    @Builder.Default
    private Integer quantityAllocated = 0;

    @Column(name = "quantity_fulfilled")
    @Builder.Default
    private Integer quantityFulfilled = 0;

    @Column(name = "is_backorder")
    @Builder.Default
    private Boolean isBackorder = false;

    @Column(name = "estimated_ship_date")
    private LocalDate estimatedShipDate;

    @Column(name = "shipping_cost")
    @Builder.Default
    private BigDecimal shippingCost = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
