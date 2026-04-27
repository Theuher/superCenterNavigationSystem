package com.tuguldur.map_service.location.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LocationRequest(
        @NotBlank @Size(min = 2, max = 40) String code,
        @NotBlank @Size(max = 80) String zone,
        @NotBlank @Size(max = 80) String aisle,
        @NotBlank @Size(max = 80) String shelf,
        @NotNull @Min(0) @Max(20) Integer floor,
        @NotBlank String floorPlanId,
        @NotNull Double mapX,
        @NotNull Double mapY,
        @Size(max = 500) String note
) {
}

