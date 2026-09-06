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
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<List<Product>> listAll() {
        return ResponseEntity.ok(productRepository.findByIsActiveTrue());
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<Product> getById(@PathVariable Long id) {
        return productRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categories")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<List<ProductCategory>> listCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Product> create(@RequestBody Product product) {
        product.setIsActive(true);
        Product saved = productRepository.save(product);

        try {
            List<Product> relatedProducts;
            if (saved.getCategory() != null && saved.getCategory().getId() != null) {
                relatedProducts = productRepository.findByCategoryIdAndIsActiveTrue(saved.getCategory().getId());
            } else {
                relatedProducts = productRepository.findByIsActiveTrue();
            }
            for (Product p : relatedProducts) {
                if (!p.getId().equals(saved.getId())) {
                    UpsellRule rule1 = UpsellRule.builder()
                        .triggerProduct(p)
                        .suggestProduct(saved)
                        .coPurchaseCount(15)
                        .priority(10)
                        .isPromoted(saved.getIsPromoted() != null ? saved.getIsPromoted() : true)
                        .isActive(true)
                        .build();
                    upsellRuleRepository.save(rule1);

                    UpsellRule rule2 = UpsellRule.builder()
                        .triggerProduct(saved)
                        .suggestProduct(p)
                        .coPurchaseCount(15)
                        .priority(10)
                        .isPromoted(p.getIsPromoted() != null ? p.getIsPromoted() : false)
                        .isActive(true)
                        .build();
                    upsellRuleRepository.save(rule2);
                }
            }
        } catch (Exception ignored) {
        }

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
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

    @GetMapping({"/upsell", "/upsell-recommendations", "/recommendations", "/upsell/recommendations"})
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('SALES_REP', 'MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<List<UpsellRule>> upsellRules(
        @RequestParam(name = "productIds", required = false) List<Long> productIds,
        @RequestParam(name = "product_ids", required = false) List<Long> productIdsSnake,
        @RequestParam(name = "ids", required = false) List<Long> ids,
        @RequestParam(name = "productId", required = false) Long singleProductId
    ) {
        java.util.Set<Long> idSet = new java.util.HashSet<>();
        if (productIds != null) idSet.addAll(productIds);
        if (productIdsSnake != null) idSet.addAll(productIdsSnake);
        if (ids != null) idSet.addAll(ids);
        if (singleProductId != null) idSet.add(singleProductId);

        if (idSet.isEmpty()) {
            return ResponseEntity.ok(upsellRuleRepository.findAllActiveRules());
        }

        List<Long> targetIds = new java.util.ArrayList<>(idSet);
        List<UpsellRule> rules = upsellRuleRepository.findActiveRulesForProducts(targetIds);
        if (rules.isEmpty()) {
            return ResponseEntity.ok(upsellRuleRepository.findAllActiveRules());
        }
        return ResponseEntity.ok(rules);
    }
}
