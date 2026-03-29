package com.tuguldur.product_service.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank @Size(min = 2, max = 120) String name,
        @Size(max = 300) String description
) {
}

