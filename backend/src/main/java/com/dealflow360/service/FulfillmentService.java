package com.dealflow360.service;

import com.dealflow360.entity.*;
import com.dealflow360.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class FulfillmentService {

    private final WarehouseStockRepository stockRepository;
    private final FulfillmentOrderRepository fulfillmentOrderRepository;

    /**
     * Auto-split fulfillment across warehouses.
     * Strategy: Greedy allocation from warehouse with highest available stock,
     * weighted by shipping_cost_weight to minimize shipments.
     */
    @Transactional
    public FulfillmentOrder createFulfillmentSplit(Quotation quotation) {
        List<QuotationLine> physicalLines = quotation.getLines().stream()
            .filter(l -> l.getProduct().getProductType() == Product.ProductType.PHYSICAL)
            .toList();

        FulfillmentOrder order = FulfillmentOrder.builder()
            .quotation(quotation)
            .status(FulfillmentOrder.FulfillmentStatus.SPLIT_PENDING)
            .lines(new ArrayList<>())
            .build();

        List<FulfillmentLine> fulfillmentLines = new ArrayList<>();
        boolean hasBackorder = false;

        for (QuotationLine line : physicalLines) {
            int needed = line.getQuantity();
            List<WarehouseStock> availableStocks = stockRepository
                .findAvailableStockForProduct(line.getProduct().getId());

            for (WarehouseStock stock : availableStocks) {
                if (needed <= 0) break;
                int canTake = Math.min(needed, stock.getAvailable());
                if (canTake <= 0) continue;

                BigDecimal shipCost = stock.getWarehouse().getShippingCostWeight()
                    .multiply(BigDecimal.valueOf(canTake * 3.5))
                    .setScale(2, RoundingMode.HALF_UP);

                FulfillmentLine fl = FulfillmentLine.builder()
                    .fulfillmentOrder(order)
                    .quotationLine(line)
                    .warehouse(stock.getWarehouse())
                    .product(line.getProduct())
                    .quantityAllocated(canTake)
                    .quantityFulfilled(0)
                    .isBackorder(false)
                    .shippingCost(shipCost)
                    .estimatedShipDate(java.time.LocalDate.now().plusDays(2))
                    .build();

                fulfillmentLines.add(fl);
                needed -= canTake;
            }

            if (needed > 0) {
                // Backorder remainder
                hasBackorder = true;
                FulfillmentLine backorder = FulfillmentLine.builder()
                    .fulfillmentOrder(order)
                    .quotationLine(line)
                    .warehouse(availableStocks.isEmpty() ? null : availableStocks.get(0).getWarehouse())
                    .product(line.getProduct())
                    .quantityAllocated(needed)
                    .quantityFulfilled(0)
                    .isBackorder(true)
                    .shippingCost(BigDecimal.ZERO)
                    .estimatedShipDate(java.time.LocalDate.now().plusDays(7))
                    .build();
                fulfillmentLines.add(backorder);
            }
        }

        BigDecimal totalCost = fulfillmentLines.stream()
            .map(FulfillmentLine::getShippingCost)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Set<Long> warehouseSet = new HashSet<>();
        fulfillmentLines.forEach(fl -> {
            if (fl.getWarehouse() != null) warehouseSet.add(fl.getWarehouse().getId());
        });

        order.setLines(fulfillmentLines);
        order.setTotalShipments(warehouseSet.size());
        order.setTotalShippingCost(totalCost);
        order.setStatus(hasBackorder
            ? FulfillmentOrder.FulfillmentStatus.PARTIALLY_FULFILLED
            : FulfillmentOrder.FulfillmentStatus.SPLIT_PENDING);

        return fulfillmentOrderRepository.save(order);
    }
}
