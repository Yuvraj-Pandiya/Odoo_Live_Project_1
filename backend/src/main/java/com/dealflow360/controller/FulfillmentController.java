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
    public ResponseEntity<List<FulfillmentOrder>> listAll() {
        return ResponseEntity.ok(fulfillmentRepo.findAll());
    }

    @GetMapping("/quotation/{quotationId}")
    public ResponseEntity<FulfillmentOrder> byQuotation(@PathVariable Long quotationId) {
        return fulfillmentRepo.findByQuotationId(quotationId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/warehouses")
    public ResponseEntity<List<Warehouse>> listWarehouses() {
        return ResponseEntity.ok(warehouseRepository.findAll());
    }

    @GetMapping("/stock/{warehouseId}")
    public ResponseEntity<List<WarehouseStock>> stockByWarehouse(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(stockRepository.findByWarehouseId(warehouseId));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<FulfillmentOrder> acceptSplit(@PathVariable Long id) {
        return fulfillmentRepo.findById(id).map(order -> {
            order.setStatus(FulfillmentOrder.FulfillmentStatus.PARTIALLY_FULFILLED);
            return ResponseEntity.ok(fulfillmentRepo.save(order));
        }).orElse(ResponseEntity.notFound().build());
    }
}
