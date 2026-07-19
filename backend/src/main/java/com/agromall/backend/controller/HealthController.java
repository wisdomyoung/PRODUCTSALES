package com.agromall.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public Map<String, Object> root() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("name", "agro-sale-backend");
        payload.put("status", "UP");
        payload.put("products", "/api/products");
        payload.put("orders", "/api/orders");
        payload.put("admin", "/api/admin");
        return payload;
    }
}