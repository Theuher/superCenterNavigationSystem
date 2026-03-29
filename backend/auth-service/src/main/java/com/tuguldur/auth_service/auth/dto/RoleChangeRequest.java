package com.tuguldur.auth_service.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record RoleChangeRequest(
        @NotBlank String role
) {
}

