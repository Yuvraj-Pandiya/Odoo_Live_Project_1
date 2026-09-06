package com.dealflow360.controller;

import com.dealflow360.entity.*;
import com.dealflow360.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;
    private final QuotationRepository quotationRepository;
    private final CustomerRepository customerRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<List<Invoice>> listAll() {
        return ResponseEntity.ok(invoiceRepository.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<Invoice> getById(@PathVariable Long id) {
        return invoiceRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<List<Invoice>> byCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(invoiceRepository.findByCustomerIdOrderByCreatedAtDesc(customerId));
    }

    @GetMapping("/quotation/{quotationId}")
    @PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<List<Invoice>> byQuotation(@PathVariable Long quotationId) {
        return ResponseEntity.ok(invoiceRepository.findByQuotationId(quotationId));
    }

    @RequestMapping(value = "/{id}/pay", method = {RequestMethod.POST, RequestMethod.PUT})
    @PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<Invoice> markAsPaid(@PathVariable Long id) {
        Invoice invoice = invoiceRepository.findById(id).orElse(null);
        if (invoice == null) {
            return ResponseEntity.notFound().build();
        }

        invoice.setStatus(Invoice.InvoiceStatus.PAID);
        invoice.setAmountPaid(invoice.getTotalAmount());
        invoice.setAmountDue(BigDecimal.ZERO);

        Invoice saved = invoiceRepository.save(invoice);
        return ResponseEntity.ok(saved);
    }
}
