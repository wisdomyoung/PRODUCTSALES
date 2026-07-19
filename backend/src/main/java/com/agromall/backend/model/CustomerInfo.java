package com.agromall.backend.model;

public record CustomerInfo(
        String name,
        String phone,
        String address,
        String note
) {
}
