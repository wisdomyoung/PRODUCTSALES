package com.agromall.backend.config;

import com.agromall.backend.entity.ProductEntity;
import com.agromall.backend.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedProducts(ProductRepository productRepository) {
        return args -> {
            if (productRepository.count() > 0) {
                return;
            }

            productRepository.saveAll(List.of(
                    new ProductEntity(UUID.randomUUID().toString(), "有机番茄", "蔬菜", "箱", new BigDecimal("39.90"),
                            "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=1200&q=80",
                            "自然成熟，适合凉拌和炒菜。", 120, true),
                    new ProductEntity(UUID.randomUUID().toString(), "高山土豆", "蔬菜", "袋", new BigDecimal("25.80"),
                            "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1200&q=80",
                            "绵密口感，适合炖煮和烘烤。", 200, false),
                    new ProductEntity(UUID.randomUUID().toString(), "现摘草莓", "水果", "盒", new BigDecimal("49.90"),
                            "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=1200&q=80",
                            "新鲜采摘，酸甜均衡。", 80, true),
                    new ProductEntity(UUID.randomUUID().toString(), "富硒大米", "粮油", "袋", new BigDecimal("89.00"),
                            "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80",
                            "5kg 家庭装，米香浓郁。", 60, true)
            ));
        };
    }
}
