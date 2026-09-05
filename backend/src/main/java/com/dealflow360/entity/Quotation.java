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
@Table(name = "quotations", schema = "dealflow")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Quotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quote_number", nullable = false, unique = true)
    private String quoteNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"assignedRep", "hibernateLazyInitializer", "handler"})
    private Customer customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sales_rep_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"passwordHash", "hibernateLazyInitializer", "handler"})
    private User salesRep;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "quotation_status")
    @Builder.Default
    private QuotationStatus status = QuotationStatus.DRAFT;

    @Builder.Default
    private String currency = "USD";

    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "tax_total")
    @Builder.Default
    private BigDecimal taxTotal = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "discount_total")
    @Builder.Default
    private BigDecimal discountTotal = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "grand_total")
    @Builder.Default
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Column(name = "blended_risk_score")
    private BigDecimal blendedRiskScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", columnDefinition = "risk_level")
    private RiskLevel riskLevel;

    private String notes;

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Column(name = "portal_token", unique = true)
    private String portalToken;

    @Column(name = "last_activity_at")
    private OffsetDateTime lastActivityAt;

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;

    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;

    @Column(name = "confirmed_at")
    private OffsetDateTime confirmedAt;

    @OneToMany(mappedBy = "quotation", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @OneToMany(mappedBy = "quotation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("quotation")
    private List<QuotationLine> lines;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "quotation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("quotation")
    private List<Approval> approvals;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public enum QuotationStatus {
        DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, NEGOTIATION, CONFIRMED, FULFILLED, CANCELLED
    }

    public enum RiskLevel { LOW, MEDIUM, HIGH }
}
