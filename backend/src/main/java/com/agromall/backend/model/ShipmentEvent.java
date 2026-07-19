package com.agromall.backend.model;

import java.time.LocalDateTime;

public record ShipmentEvent(
        LocalDateTime time,
        String message
) {
}
