package com.dealflow360.controller;

import com.dealflow360.entity.*;
import com.dealflow360.repository.*;
import com.dealflow360.service.FulfillmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fulfillment")
@RequiredArgsConstructor
public class FulfillmentController {

    private final FulfillmentOrderRepository fulfillmentRepo;
    private final WarehouseRepository warehouseRepository;
    private final WarehouseStockRepository stockRepository;
    private final QuotationRepository quotationRepository;
    private final FulfillmentService fulfillmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<List<FulfillmentOrder>> listAll() {
        return ResponseEntity.ok(fulfillmentRepo.findAll());
    }

    @GetMapping("/quotation/{quotationId}")
    @PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<FulfillmentOrder> byQuotation(@PathVariable Long quotationId) {
        return fulfillmentRepo.findByQuotationId(quotationId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/warehouses")
    @PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<List<Warehouse>> listWarehouses() {
        return ResponseEntity.ok(warehouseRepository.findAll());
    }

    @GetMapping("/stock/{warehouseId}")
    @PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<List<WarehouseStock>> stockByWarehouse(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(stockRepository.findByWarehouseId(warehouseId));
    }

    @RequestMapping(value = "/{id}/accept", method = {RequestMethod.PUT, RequestMethod.POST})
    @PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<FulfillmentOrder> acceptSplit(@PathVariable Long id) {
        FulfillmentOrder order = fulfillmentRepo.findById(id)
            .orElseGet(() -> fulfillmentRepo.findByQuotationId(id).orElse(null));

        if (order == null) {
            Quotation quotation = quotationRepository.findById(id).orElse(null);
            if (quotation != null) {
                order = fulfillmentService.createFulfillmentSplit(quotation);
            }
        }

        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        boolean hasBackorder = order.getLines() != null && order.getLines().stream()
            .anyMatch(fl -> Boolean.TRUE.equals(fl.getIsBackorder()));

        order.setStatus(hasBackorder 
            ? FulfillmentOrder.FulfillmentStatus.PARTIALLY_FULFILLED 
            : FulfillmentOrder.FulfillmentStatus.FULFILLED);

        FulfillmentOrder saved = fulfillmentRepo.save(order);
        return ResponseEntity.ok(saved);
    }
}
