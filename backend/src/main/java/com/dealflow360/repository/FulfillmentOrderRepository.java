package com.dealflow360.repository;

import com.dealflow360.entity.FulfillmentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FulfillmentOrderRepository extends JpaRepository<FulfillmentOrder, Long> {
    Optional<FulfillmentOrder> findByQuotationId(Long quotationId);
    List<FulfillmentOrder> findByStatusOrderByCreatedAtDesc(FulfillmentOrder.FulfillmentStatus status);
}
