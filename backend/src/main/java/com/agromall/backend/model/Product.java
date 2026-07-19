package com.agromall.backend.model;

import java.math.BigDecimal;

public record Product(
        String id,
        String name,
        String category,
        String unit,
        BigDecimal price,
        String imageUrl,
        String description,
        int stock,
        boolean featured
) {
}
