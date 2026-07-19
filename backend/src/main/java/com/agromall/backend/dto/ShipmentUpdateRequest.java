package com.agromall.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record ShipmentUpdateRequest(
        @NotBlank String carrier,
        @NotBlank String trackingNumber,
        @NotBlank String message
) {
}
