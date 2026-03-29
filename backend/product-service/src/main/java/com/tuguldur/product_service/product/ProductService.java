package com.tuguldur.product_service.product;

import com.tuguldur.product_service.product.dto.ProductRequest;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> findAll(String search, String categoryId) {
        if (search != null && !search.isBlank()) {
            return productRepository.findByNameContainingIgnoreCase(search.trim()).stream()
                    .sorted(Comparator.comparing(Product::getName, String.CASE_INSENSITIVE_ORDER))
                    .toList();
        }
        if (categoryId != null && !categoryId.isBlank()) {
            return productRepository.findByCategoryId(categoryId.trim());
        }
        return productRepository.findAll().stream()
                .sorted(Comparator.comparing(Product::getName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    public Product findById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found."));
    }

    public Product create(ProductRequest request) {
        productRepository.findBySku(request.sku().trim())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Product with this SKU already exists.");
                });

        Product product = new Product();
        applyRequest(product, request);
        return productRepository.save(product);
    }

    public Product update(String id, ProductRequest request) {
        Product product = findById(id);

        productRepository.findBySku(request.sku().trim())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Product with this SKU already exists.");
                });

        applyRequest(product, request);
        return productRepository.save(product);
    }

    public void delete(String id) {
        Product product = findById(id);
        productRepository.delete(product);
    }

    private void applyRequest(Product product, ProductRequest request) {
        product.setName(request.name().trim());
        product.setSku(request.sku().trim().toUpperCase());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setCategoryId(request.categoryId().trim());
        product.setLocationId(request.locationId().trim());
        product.setImageUrl(request.imageUrl());
    }
}

