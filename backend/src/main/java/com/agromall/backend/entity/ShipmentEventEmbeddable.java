package com.agromall.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.time.LocalDateTime;

@Embeddable
public class ShipmentEventEmbeddable {

    @Column(name = "event_time", nullable = false)
    private LocalDateTime time;

    @Column(name = "message", nullable = false, length = 1000)
    private String message;

    public ShipmentEventEmbeddable() {
    }

    public ShipmentEventEmbeddable(LocalDateTime time, String message) {
        this.time = time;
        this.message = message;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
