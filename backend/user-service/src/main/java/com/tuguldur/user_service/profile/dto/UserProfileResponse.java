package com.tuguldur.user_service.profile.dto;

public record UserProfileResponse(
        String email,
        String phoneNumber,
        String bio,
        String avatarUrl
) {
}

