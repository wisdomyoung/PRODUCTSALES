package com.agromall.backend.service;

import com.agromall.backend.dto.CheckoutRequest;
import com.agromall.backend.dto.ShipmentUpdateRequest;
import com.agromall.backend.entity.CustomerInfoEmbeddable;
import com.agromall.backend.entity.OrderEntity;
import com.agromall.backend.entity.OrderItemEmbeddable;
import com.agromall.backend.entity.ProductEntity;
import com.agromall.backend.entity.ShipmentEventEmbeddable;
import com.agromall.backend.model.CustomerInfo;
import com.agromall.backend.model.Order;
import com.agromall.backend.model.OrderItem;
import com.agromall.backend.model.OrderStatus;
import com.agromall.backend.model.Product;
import com.agromall.backend.model.Shipment;
import com.agromall.backend.model.ShipmentEvent;
import com.agromall.backend.model.ShipmentStatus;
import com.agromall.backend.repository.OrderRepository;
import com.agromall.backend.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class StoreService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public StoreService(ProductRepository productRepository, OrderRepository orderRepository) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        return productRepository.findAll().stream()
                .sorted(Comparator.comparing(ProductEntity::isFeatured).reversed().thenComparing(ProductEntity::getName))
                .map(this::toProduct)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAll().stream()
                .sorted(Comparator.comparing(OrderEntity::getCreatedAt).reversed())
                .map(this::toOrder)
                .toList();
    }

    @Transactional(readOnly = true)
    public Order getOrder(String orderId) {
        return toOrder(getOrderEntity(orderId));
    }

    @Transactional
    public Product saveProduct(Product incoming) {
        String id = incoming.id() == null || incoming.id().isBlank() ? UUID.randomUUID().toString() : incoming.id();
        ProductEntity entity = productRepository.findById(id).orElseGet(ProductEntity::new);
        entity.setId(id);
        entity.setName(incoming.name());
        entity.setCategory(incoming.category());
        entity.setUnit(incoming.unit());
        entity.setPrice(incoming.price());
        entity.setImageUrl(incoming.imageUrl());
        entity.setDescription(incoming.description());
        entity.setStock(incoming.stock());
        entity.setFeatured(incoming.featured());
        return toProduct(productRepository.save(entity));
    }

    @Transactional
    public void deleteProduct(String productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "产品不存在");
        }
        productRepository.deleteById(productId);
    }

    @Transactional
    public Order createOrder(CheckoutRequest request) {
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (CheckoutRequest.CartItemRequest item : request.items()) {
            ProductEntity product = productRepository.findById(item.productId()).orElse(null);
            if (product == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "产品不存在: " + item.productId());
            }
            if (product.getStock() < item.quantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "库存不足: " + product.getName());
            }

            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(item.quantity()));
            orderItems.add(new OrderItem(product.getId(), product.getName(), product.getPrice(), item.quantity(), subtotal));
            total = total.add(subtotal);

            product.setStock(product.getStock() - item.quantity());
            productRepository.save(product);
        }

        String orderId = UUID.randomUUID().toString();
        OrderEntity order = new OrderEntity();
        order.setId(orderId);
        order.setItems(orderItems.stream().map(this::toEmbeddable).toList());
        order.setCustomer(new CustomerInfoEmbeddable(
                request.customer().name(),
                request.customer().phone(),
                request.customer().address(),
                request.customer().note()
        ));
        order.setStatus(OrderStatus.CREATED);
        order.setTotalAmount(total);
        order.setCreatedAt(LocalDateTime.now());
        order.setShipmentTrackingNumber("待分配");
        order.setShipmentCarrier("待揽收");
        order.setShipmentStatus(ShipmentStatus.PENDING);
        order.setShipmentEvents(List.of(new ShipmentEventEmbeddable(LocalDateTime.now(), "订单已创建，等待商家发货")));
        return toOrder(orderRepository.save(order));
    }

    @Transactional
    public void cancelOrder(String orderId) {
        OrderEntity order = getOrderEntity(orderId);
        if (order.getStatus() == OrderStatus.SIGNED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "已签收订单不能删除");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "订单已删除");
        }

        restoreStock(order);
        order.setStatus(OrderStatus.CANCELLED);
        order.setShipmentStatus(ShipmentStatus.PENDING);
        order.setShipmentEvents(appendEvents(order.getShipmentEvents(), new ShipmentEventEmbeddable(LocalDateTime.now(), "订单已删除")));
        orderRepository.save(order);
    }

    @Transactional
    public Order updateShipment(String orderId, ShipmentUpdateRequest request) {
        OrderEntity order = getOrderEntity(orderId);
        order.setShipmentTrackingNumber(request.trackingNumber());
        order.setShipmentCarrier(request.carrier());
        order.setShipmentStatus(ShipmentStatus.IN_TRANSIT);
        order.setStatus(OrderStatus.SHIPPED);
        order.setShipmentEvents(appendEvents(order.getShipmentEvents(), new ShipmentEventEmbeddable(LocalDateTime.now(), request.message())));
        return toOrder(orderRepository.save(order));
    }

    @Transactional
    public Order markDelivered(String orderId) {
        OrderEntity order = getOrderEntity(orderId);
        order.setShipmentStatus(ShipmentStatus.DELIVERED);
        order.setStatus(OrderStatus.SHIPPED);
        order.setShipmentEvents(appendEvents(order.getShipmentEvents(), new ShipmentEventEmbeddable(LocalDateTime.now(), "包裹已送达，等待签收")));
        return toOrder(orderRepository.save(order));
    }

    @Transactional
    public Order signOrder(String orderId) {
        OrderEntity order = getOrderEntity(orderId);
        order.setShipmentStatus(ShipmentStatus.SIGNED);
        order.setStatus(OrderStatus.SIGNED);
        order.setShipmentEvents(appendEvents(order.getShipmentEvents(), new ShipmentEventEmbeddable(LocalDateTime.now(), "客户已签收")));
        return toOrder(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboard() {
        List<OrderEntity> orders = orderRepository.findAll();
        BigDecimal revenue = orders.stream()
                .filter(order -> order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.SIGNED)
                .map(OrderEntity::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingShipments = orders.stream()
                .filter(order -> order.getStatus() == OrderStatus.CREATED)
                .count();

        Map<String, Object> dashboard = new LinkedHashMap<>();
        dashboard.put("productCount", productRepository.count());
        dashboard.put("orderCount", orders.size());
        dashboard.put("pendingShipments", pendingShipments);
        dashboard.put("revenue", revenue);
        return dashboard;
    }

    private OrderEntity getOrderEntity(String orderId) {
        OrderEntity order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "订单不存在");
        }
        return order;
    }

    private List<ShipmentEventEmbeddable> appendEvents(List<ShipmentEventEmbeddable> current, ShipmentEventEmbeddable event) {
        List<ShipmentEventEmbeddable> events = new ArrayList<>(current == null ? List.of() : current);
        events.add(0, event);
        return events;
    }

    private void restoreStock(OrderEntity order) {
        for (OrderItemEmbeddable item : order.getItems()) {
            ProductEntity product = productRepository.findById(item.getProductId()).orElse(null);
            if (product != null) {
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        }
    }

    private Product toProduct(ProductEntity entity) {
        return new Product(
                entity.getId(),
                entity.getName(),
                entity.getCategory(),
                entity.getUnit(),
                entity.getPrice(),
                entity.getImageUrl(),
                entity.getDescription(),
                entity.getStock(),
                entity.isFeatured()
        );
    }

    private Order toOrder(OrderEntity entity) {
        return new Order(
                entity.getId(),
                entity.getItems().stream().map(this::toOrderItem).toList(),
                new CustomerInfo(
                        entity.getCustomer().getName(),
                        entity.getCustomer().getPhone(),
                        entity.getCustomer().getAddress(),
                        entity.getCustomer().getNote()
                ),
                entity.getStatus(),
                entity.getTotalAmount(),
                entity.getCreatedAt(),
                new Shipment(
                        entity.getId(),
                        entity.getShipmentTrackingNumber(),
                        entity.getShipmentCarrier(),
                        entity.getShipmentStatus(),
                        entity.getShipmentEvents().stream().map(this::toShipmentEvent).toList()
                )
        );
    }

    private OrderItem toOrderItem(OrderItemEmbeddable item) {
        return new OrderItem(item.getProductId(), item.getProductName(), item.getPrice(), item.getQuantity(), item.getSubtotal());
    }

    private ShipmentEvent toShipmentEvent(ShipmentEventEmbeddable event) {
        return new ShipmentEvent(event.getTime(), event.getMessage());
    }

    private OrderItemEmbeddable toEmbeddable(OrderItem item) {
        return new OrderItemEmbeddable(item.productId(), item.productName(), item.price(), item.quantity(), item.subtotal());
    }
}
