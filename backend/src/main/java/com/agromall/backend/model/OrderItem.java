package com.agromall.backend.model;

import java.math.BigDecimal;

public record OrderItem(
        String productId,
        String productName,
        BigDecimal price,
        int quantity,
        BigDecimal subtotal
) {
}
