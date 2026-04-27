package com.tuguldur.map_service.floorplan.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record FloorPlanRequest(
        @NotBlank @Size(min = 2, max = 120) String name,
        @NotNull @Min(0) @Max(20) Integer floor,
        @NotBlank @Size(max = 600) String imageUrl,
        @Size(max = 500) String note
) {
}

