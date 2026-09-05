package com.dealflow360.controller;

import com.dealflow360.entity.*;
import com.dealflow360.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final UpsellRuleRepository upsellRuleRepository;

    @GetMapping
    public ResponseEntity<List<Product>> listAll() {
        return ResponseEntity.ok(productRepository.findByIsActiveTrue());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable Long id) {
        return productRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<ProductCategory>> listCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Product> create(@RequestBody Product product) {
        product.setIsActive(true);
        return ResponseEntity.ok(productRepository.save(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody Product updated) {
        return productRepository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setBasePrice(updated.getBasePrice());
            existing.setCostPrice(updated.getCostPrice());
            existing.setTaxPercentage(updated.getTaxPercentage());
            existing.setDescription(updated.getDescription());
            existing.setIsSubscription(updated.getIsSubscription());
            existing.setBillingCycle(updated.getBillingCycle());
            existing.setIsPromoted(updated.getIsPromoted());
            existing.setQuantityOnHand(updated.getQuantityOnHand());
            return ResponseEntity.ok(productRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/upsell")
    public ResponseEntity<List<UpsellRule>> upsellRules(
        @RequestParam List<Long> productIds
    ) {
        return ResponseEntity.ok(upsellRuleRepository.findActiveRulesForProducts(productIds));
    }
}
