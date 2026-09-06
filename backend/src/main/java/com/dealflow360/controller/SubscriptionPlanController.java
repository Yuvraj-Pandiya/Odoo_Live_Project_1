package com.dealflow360.controller;

import lombok.Builder;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

/**
 * ARCHITECTURE NOTE:
 * Subscription plans are a small, bounded, config-like catalog dataset (< 20 plans).
 * This endpoint delivers the full catalog in a single response, enabling the frontend
 * to perform client-side debounced search, sorting, and pagination.
 */
@RestController
@RequestMapping("/api/subscriptions/plans")
public class SubscriptionPlanController {

    @Data
    @Builder
    public static class SubscriptionPlanInfo {
        private String code;
        private String name;
        private String tier;
        private String description;
        private BigDecimal monthlyRate;
        private BigDecimal annualRate;
        private String billingCadence;
        private Integer includedSeats;
        private String slaGuarantee;
        private Boolean isActive;
    }

    private static final List<SubscriptionPlanInfo> FIXED_PLANS = List.of(
        SubscriptionPlanInfo.builder()
            .code("PLAN-STARTER")
            .name("Starter Cloud & CPQ Core")
            .tier("BRONZE")
            .description("Essential quotation engine, CRM sync, and up to 10 sales reps")
            .monthlyRate(new BigDecimal("499.00"))
            .annualRate(new BigDecimal("5388.00"))
            .billingCadence("Monthly")
            .includedSeats(10)
            .slaGuarantee("99.5% Uptime")
            .isActive(true)
            .build(),
        SubscriptionPlanInfo.builder()
            .code("PLAN-PRO")
            .name("Professional Deal Flow & Approvals")
            .tier("SILVER")
            .description("Multi-level governance engine, discount anomaly detector, 50 seats")
            .monthlyRate(new BigDecimal("1299.00"))
            .annualRate(new BigDecimal("14028.00"))
            .billingCadence("Monthly")
            .includedSeats(50)
            .slaGuarantee("99.9% Uptime")
            .isActive(true)
            .build(),
        SubscriptionPlanInfo.builder()
            .code("PLAN-ENTERPRISE")
            .name("Enterprise Cloud Platform & AI Deal Desk")
            .tier("GOLD")
            .description("Unlimited seats, automated warehouse split fulfillment, dedicated CSM & 24/7 SLA")
            .monthlyRate(new BigDecimal("2499.00"))
            .annualRate(new BigDecimal("26988.00"))
            .billingCadence("Annual")
            .includedSeats(200)
            .slaGuarantee("99.99% Uptime")
            .isActive(true)
            .build(),
        SubscriptionPlanInfo.builder()
            .code("PLAN-LOGISTICS-AI")
            .name("Logistics AI & Warehouse Optimizer Suite")
            .tier("GOLD")
            .description("Autonomous split routing, backorder prediction, and multi-depot synchronization")
            .monthlyRate(new BigDecimal("3499.00"))
            .annualRate(new BigDecimal("37788.00"))
            .billingCadence("Annual")
            .includedSeats(100)
            .slaGuarantee("99.99% Uptime")
            .isActive(true)
            .build(),
        SubscriptionPlanInfo.builder()
            .code("PLAN-CUSTOM-GOV")
            .name("Commercial Governance & Custom Audit")
            .tier("SILVER")
            .description("Immutable regulatory audit trails, CFO sign-off matrices, and custom discount rules")
            .monthlyRate(new BigDecimal("1899.00"))
            .annualRate(new BigDecimal("20508.00"))
            .billingCadence("Annual")
            .includedSeats(75)
            .slaGuarantee("99.9% Uptime")
            .isActive(true)
            .build()
    );

    @GetMapping
    public ResponseEntity<List<SubscriptionPlanInfo>> getPlans() {
        return ResponseEntity.ok(FIXED_PLANS);
    }
}
