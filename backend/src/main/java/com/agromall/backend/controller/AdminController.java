package com.agromall.backend.controller;

import com.agromall.backend.dto.ShipmentUpdateRequest;
import com.agromall.backend.model.Order;
import com.agromall.backend.model.Product;
import com.agromall.backend.service.StoreService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final StoreService storeService;
    private final String adminPassword;

    public AdminController(StoreService storeService,
                           @Value("${app.admin.password:admin123}") String adminPassword) {
        this.storeService = storeService;
        this.adminPassword = adminPassword;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(@RequestHeader(value = "X-Admin-Password", required = false) String password) {
        validatePassword(password);
        return storeService.getDashboard();
    }

    @GetMapping("/orders")
    public List<Order> listOrders(@RequestHeader(value = "X-Admin-Password", required = false) String password) {
        validatePassword(password);
        return storeService.getAllOrders();
    }

    @PostMapping("/products")
    public Product createProduct(@RequestHeader(value = "X-Admin-Password", required = false) String password,
                                 @RequestBody Product product) {
        validatePassword(password);
        return storeService.saveProduct(product);
    }

    @PutMapping("/products/{productId}")
    public Product updateProduct(@RequestHeader(value = "X-Admin-Password", required = false) String password,
                                 @PathVariable String productId,
                                 @RequestBody Product product) {
        validatePassword(password);
        return storeService.saveProduct(new Product(
                productId,
                product.name(),
                product.category(),
                product.unit(),
                product.price(),
                product.imageUrl(),
                product.description(),
                product.stock(),
                product.featured()
        ));
    }

    @DeleteMapping("/products/{productId}")
    public void deleteProduct(@RequestHeader(value = "X-Admin-Password", required = false) String password,
                              @PathVariable String productId) {
        validatePassword(password);
        storeService.deleteProduct(productId);
    }

    @PostMapping("/orders/{orderId}/ship")
    public Order updateShipment(@RequestHeader(value = "X-Admin-Password", required = false) String password,
                                @PathVariable String orderId,
                                @Valid @RequestBody ShipmentUpdateRequest request) {
        validatePassword(password);
        return storeService.updateShipment(orderId, request);
    }

    @PostMapping("/orders/{orderId}/deliver")
    public Order markDelivered(@RequestHeader(value = "X-Admin-Password", required = false) String password,
                               @PathVariable String orderId) {
        validatePassword(password);
        return storeService.markDelivered(orderId);
    }

    private void validatePassword(String password) {
        if (password == null || !adminPassword.equals(password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "后台密码错误");
        }
    }
}
