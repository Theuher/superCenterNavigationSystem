package com.tuguldur.auth_service.auth.dto;

import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @Size(min = 2, max = 120) String fullName,
        @Size(min = 6, max = 120) String password
) {
}

