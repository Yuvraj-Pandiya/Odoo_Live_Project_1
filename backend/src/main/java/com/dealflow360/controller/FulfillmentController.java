package com.dealflow360.controller;

import com.dealflow360.entity.*;
import com.dealflow360.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fulfillment")
@RequiredArgsConstructor
public class FulfillmentController {

    private final FulfillmentOrderRepository fulfillmentRepo;
    private final WarehouseRepository warehouseRepository;
    private final WarehouseStockRepository stockRepository;

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<FulfillmentOrder>> listAll() {
        return ResponseEntity.ok(fulfillmentRepo.findAll());
    }

    @GetMapping("/quotation/{quotationId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<FulfillmentOrder> byQuotation(@PathVariable Long quotationId) {
        return fulfillmentRepo.findByQuotationId(quotationId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/warehouses")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<Warehouse>> listWarehouses() {
        return ResponseEntity.ok(warehouseRepository.findAll());
    }

    @GetMapping("/stock/{warehouseId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<WarehouseStock>> stockByWarehouse(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(stockRepository.findByWarehouseId(warehouseId));
    }

    @PutMapping("/{id}/accept")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<FulfillmentOrder> acceptSplit(@PathVariable Long id) {
        return fulfillmentRepo.findById(id).map(order -> {
            order.setStatus(FulfillmentOrder.FulfillmentStatus.PARTIALLY_FULFILLED);
            return ResponseEntity.ok(fulfillmentRepo.save(order));
        }).orElse(ResponseEntity.notFound().build());
    }
}
