package com.agromall.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CheckoutRequest(
        @Valid @NotEmpty List<CartItemRequest> items,
        @Valid CustomerRequest customer
) {
    public record CartItemRequest(
            @NotBlank String productId,
            @Min(1) int quantity
    ) {
    }

    public record CustomerRequest(
            @NotBlank String name,
            @NotBlank String phone,
            @NotBlank String address,
            String note
    ) {
    }
}
