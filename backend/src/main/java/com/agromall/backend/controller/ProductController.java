package com.agromall.backend.controller;

import com.agromall.backend.model.Product;
import com.agromall.backend.service.StoreService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final StoreService storeService;

    public ProductController(StoreService storeService) {
        this.storeService = storeService;
    }

    @GetMapping
    public List<Product> listProducts() {
        return storeService.getAllProducts();
    }
}
