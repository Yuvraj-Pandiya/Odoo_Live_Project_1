package com.dealflow360.repository;

import com.dealflow360.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByIsActiveTrue();
    List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.isSubscription = false")
    List<Product> findOneTimeProducts();

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.isSubscription = true")
    List<Product> findSubscriptionProducts();
}
