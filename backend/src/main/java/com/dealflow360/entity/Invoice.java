package com.dealflow360.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "invoices", schema = "dealflow")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_number", nullable = false, unique = true)
    private String invoiceNumber;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quotation_id")
    private Quotation quotation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "invoice_status")
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    @Builder.Default
    private String currency = "USD";

    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "tax_total")
    private BigDecimal taxTotal = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_amount")
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "amount_paid")
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "amount_due")
    private BigDecimal amountDue = BigDecimal.ZERO;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Builder.Default
    @Column(name = "is_recurring")
    private Boolean isRecurring = false;

    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public enum InvoiceStatus { DRAFT, SENT, UNPAID, PAID, PARTIAL, OVERDUE, CANCELLED }
}
