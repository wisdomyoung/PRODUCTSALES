package com.agromall.backend.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record Order(
        String id,
        List<OrderItem> items,
        CustomerInfo customer,
        OrderStatus status,
        BigDecimal totalAmount,
        LocalDateTime createdAt,
        Shipment shipment
) {
}
