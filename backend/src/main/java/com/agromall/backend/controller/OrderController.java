package com.agromall.backend.controller;

import com.agromall.backend.dto.CheckoutRequest;
import com.agromall.backend.model.Order;
import com.agromall.backend.service.StoreService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final StoreService storeService;

    public OrderController(StoreService storeService) {
        this.storeService = storeService;
    }

    @GetMapping("/{orderId}")
    public Order getOrder(@PathVariable String orderId) {
        return storeService.getOrder(orderId);
    }

    @PostMapping
    public Order checkout(@Valid @RequestBody CheckoutRequest request) {
        return storeService.createOrder(request);
    }

    @DeleteMapping("/{orderId}")
    public void cancelOrder(@PathVariable String orderId) {
        storeService.cancelOrder(orderId);
    }

    @PostMapping("/{orderId}/sign")
    public Order signOrder(@PathVariable String orderId) {
        return storeService.signOrder(orderId);
    }
}
