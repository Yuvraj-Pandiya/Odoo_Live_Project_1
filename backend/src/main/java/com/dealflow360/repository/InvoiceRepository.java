package com.dealflow360.repository;

import com.dealflow360.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Invoice> findByQuotationId(Long quotationId);
    List<Invoice> findByStatusOrderByCreatedAtDesc(Invoice.InvoiceStatus status);
}
