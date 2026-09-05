package com.dealflow360.controller;

import com.dealflow360.entity.DiscountTier;
import com.dealflow360.repository.DiscountTierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * ARCHITECTURE NOTE:
 * Discount tiers are a small, fixed, config-like dataset (typically 3 to 10 rows).
 * This endpoint returns the entire list in a single payload (no server-side pagination),
 * allowing the frontend to perform debounced filtering, client-side sorting, and client-side pagination.
 */
@RestController
@RequestMapping({"/api/admin/discount-tiers", "/api/discount-tiers"})
@RequiredArgsConstructor
public class DiscountTierController {

    private final DiscountTierRepository discountTierRepository;

    public record UpdateDiscountTierRequest(BigDecimal maxDiscount, String description) {}

    @GetMapping
    public ResponseEntity<List<DiscountTier>> getAllDiscountTiers() {
        return ResponseEntity.ok(discountTierRepository.findAll());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DiscountTier> updateDiscountTier(
            @PathVariable Long id,
            @RequestBody UpdateDiscountTierRequest req) {
        return discountTierRepository.findById(id).map(tier -> {
            if (req.maxDiscount() != null) {
                tier.setMaxDiscount(req.maxDiscount());
            }
            if (req.description() != null) {
                tier.setDescription(req.description());
            }
            return ResponseEntity.ok(discountTierRepository.save(tier));
        }).orElse(ResponseEntity.notFound().build());
    }
}
