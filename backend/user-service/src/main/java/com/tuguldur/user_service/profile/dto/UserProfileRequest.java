package com.tuguldur.user_service.profile.dto;

import jakarta.validation.constraints.Size;

public record UserProfileRequest(
        @Size(max = 40) String phoneNumber,
        @Size(max = 1000) String bio,
        @Size(max = 400) String avatarUrl
) {
}

