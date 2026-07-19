package com.agromall.backend.model;

import java.util.List;

public record Shipment(
        String orderId,
        String trackingNumber,
        String carrier,
        ShipmentStatus status,
        List<ShipmentEvent> events
) {
}
