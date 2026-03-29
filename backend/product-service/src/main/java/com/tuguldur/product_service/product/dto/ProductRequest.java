package com.tuguldur.product_service.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank @Size(min = 2, max = 160) String name,
        @NotBlank @Size(min = 3, max = 60) String sku,
        @Size(max = 1000) String description,
        @NotNull @DecimalMin(value = "0.0", inclusive = true) BigDecimal price,
        @NotBlank String categoryId,
        @NotBlank String locationId,
        @Size(max = 400) String imageUrl
) {
}

