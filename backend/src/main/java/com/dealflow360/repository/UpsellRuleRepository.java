package com.dealflow360.repository;

import com.dealflow360.entity.UpsellRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UpsellRuleRepository extends JpaRepository<UpsellRule, Long> {
    @Query("SELECT ur FROM UpsellRule ur JOIN FETCH ur.triggerProduct JOIN FETCH ur.suggestProduct WHERE ur.triggerProduct.id IN :productIds AND ur.isActive = true ORDER BY ur.isPromoted DESC, ur.priority DESC, ur.coPurchaseCount DESC")
    List<UpsellRule> findActiveRulesForProducts(@Param("productIds") List<Long> productIds);

    @Query("SELECT ur FROM UpsellRule ur JOIN FETCH ur.triggerProduct JOIN FETCH ur.suggestProduct WHERE ur.isActive = true ORDER BY ur.isPromoted DESC, ur.priority DESC, ur.coPurchaseCount DESC")
    List<UpsellRule> findAllActiveRules();
}
