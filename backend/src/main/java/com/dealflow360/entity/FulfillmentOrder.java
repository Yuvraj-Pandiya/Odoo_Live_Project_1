package com.dealflow360.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "fulfillment_orders", schema = "dealflow")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FulfillmentOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "quotation_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"approvals", "hibernateLazyInitializer", "handler"})
    private Quotation quotation;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "fulfillment_status")
    @Builder.Default
    private FulfillmentStatus status = FulfillmentStatus.PENDING;

    @Builder.Default
    @Column(name = "is_manual_override")
    @Builder.Default
    private Boolean isManualOverride = false;

    @Builder.Default
    @Column(name = "total_shipments")
    @Builder.Default
    private Integer totalShipments = 0;

    @Builder.Default
    @Column(name = "total_shipping_cost")
    @Builder.Default
    private BigDecimal totalShippingCost = BigDecimal.ZERO;

    private String notes;

    @OneToMany(mappedBy = "fulfillmentOrder", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<FulfillmentLine> lines;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public enum FulfillmentStatus {
        PENDING, SPLIT_PENDING, PARTIALLY_FULFILLED, FULFILLED, BACKORDER
    }
}
