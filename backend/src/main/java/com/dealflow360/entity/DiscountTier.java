package com.dealflow360.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * ARCHITECTURE NOTE:
 * DiscountTier represents a bounded, fixed configuration dataset (~3 to 50 rows max).
 * Used for client-side sorting, searching, and pagination.
 */
@Entity
@Table(name = "discount_tiers", schema = "dealflow")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DiscountTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "customer_tier", nullable = false, unique = true)
    private Customer.CustomerTier tier;

    @Column(name = "max_discount", nullable = false)
    private BigDecimal maxDiscount;

    private String description;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
