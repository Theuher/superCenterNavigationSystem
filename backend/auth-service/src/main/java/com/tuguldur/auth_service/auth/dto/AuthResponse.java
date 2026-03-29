package com.tuguldur.auth_service.auth.dto;

import java.util.Set;

public record AuthResponse(
        String accessToken,
        String tokenType,
        ProfileResponse user,
        Set<String> roles
) {
}

