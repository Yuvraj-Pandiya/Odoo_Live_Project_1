package com.dealflow360.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "warehouse_stock", schema = "dealflow")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WarehouseStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"stocks", "hibernateLazyInitializer", "handler"})
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"category", "variants", "hibernateLazyInitializer", "handler"})
    private Product product;

    @Builder.Default
    private Integer quantity = 0;

    @Builder.Default
    private Integer reserved = 0;

    @Builder.Default
    @Column(name = "reorder_point")
    private Integer reorderPoint = 10;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public int getAvailable() {
        return Math.max(0, quantity - reserved);
    }
}
