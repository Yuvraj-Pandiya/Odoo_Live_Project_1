package com.dealflow360.repository;

import com.dealflow360.entity.WarehouseStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseStockRepository extends JpaRepository<WarehouseStock, Long> {
    Optional<WarehouseStock> findByWarehouseIdAndProductId(Long warehouseId, Long productId);

    @Query("SELECT ws FROM WarehouseStock ws WHERE ws.product.id = :productId AND (ws.quantity - ws.reserved) > 0 ORDER BY (ws.quantity - ws.reserved) DESC")
    List<WarehouseStock> findAvailableStockForProduct(@Param("productId") Long productId);

    List<WarehouseStock> findByWarehouseId(Long warehouseId);
}
