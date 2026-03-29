package com.tuguldur.auth_service.auth.dto;

import java.util.Set;

public record UserRoleResponse(
        Long id,
        String fullName,
        String email,
        Set<String> roles
) {
}

