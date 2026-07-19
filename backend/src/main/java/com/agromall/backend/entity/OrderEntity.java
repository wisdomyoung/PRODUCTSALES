package com.agromall.backend.entity;

import com.agromall.backend.model.OrderStatus;
import com.agromall.backend.model.ShipmentStatus;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customer_orders")
public class OrderEntity {

    @Id
    private String id;

    @ElementCollection
    @CollectionTable(name = "customer_order_items", joinColumns = @JoinColumn(name = "order_id"))
    @OrderColumn(name = "item_index")
    private List<OrderItemEmbeddable> items = new ArrayList<>();

    @Embedded
    private CustomerInfoEmbeddable customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private String shipmentTrackingNumber;

    @Column(nullable = false)
    private String shipmentCarrier;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus shipmentStatus;

    @ElementCollection
    @CollectionTable(name = "order_shipment_events", joinColumns = @JoinColumn(name = "order_id"))
    @OrderColumn(name = "event_index")
    private List<ShipmentEventEmbeddable> shipmentEvents = new ArrayList<>();

    public OrderEntity() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<OrderItemEmbeddable> getItems() {
        return items;
    }

    public void setItems(List<OrderItemEmbeddable> items) {
        this.items = items;
    }

    public CustomerInfoEmbeddable getCustomer() {
        return customer;
    }

    public void setCustomer(CustomerInfoEmbeddable customer) {
        this.customer = customer;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getShipmentTrackingNumber() {
        return shipmentTrackingNumber;
    }

    public void setShipmentTrackingNumber(String shipmentTrackingNumber) {
        this.shipmentTrackingNumber = shipmentTrackingNumber;
    }

    public String getShipmentCarrier() {
        return shipmentCarrier;
    }

    public void setShipmentCarrier(String shipmentCarrier) {
        this.shipmentCarrier = shipmentCarrier;
    }

    public ShipmentStatus getShipmentStatus() {
        return shipmentStatus;
    }

    public void setShipmentStatus(ShipmentStatus shipmentStatus) {
        this.shipmentStatus = shipmentStatus;
    }

    public List<ShipmentEventEmbeddable> getShipmentEvents() {
        return shipmentEvents;
    }

    public void setShipmentEvents(List<ShipmentEventEmbeddable> shipmentEvents) {
        this.shipmentEvents = shipmentEvents;
    }
}
