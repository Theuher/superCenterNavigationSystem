package com.tuguldur.map_service.location.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LocationRequest(
        @NotBlank @Size(min = 2, max = 40) String code,
        @NotBlank String floorPlanId,
        @NotNull Double mapX,
        @NotNull Double mapY,
        @Size(max = 500) String note
) {
}

