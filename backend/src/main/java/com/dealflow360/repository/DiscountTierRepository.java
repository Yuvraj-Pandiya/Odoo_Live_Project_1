package com.dealflow360.repository;

import com.dealflow360.entity.DiscountTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiscountTierRepository extends JpaRepository<DiscountTier, Long> {
}
