package com.tuguldur.user_service.profile;

import com.tuguldur.user_service.profile.dto.UserProfileRequest;
import com.tuguldur.user_service.profile.dto.UserProfileResponse;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;

    public UserProfileService(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    public UserProfileResponse getMyProfile(String email) {
        UserProfile profile = userProfileRepository.findByEmail(email.toLowerCase())
                .orElseGet(() -> createEmptyProfile(email.toLowerCase()));
        return toResponse(profile);
    }

    public UserProfileResponse updateMyProfile(String email, UserProfileRequest request) {
        UserProfile profile = userProfileRepository.findByEmail(email.toLowerCase())
                .orElseGet(() -> createEmptyProfile(email.toLowerCase()));

        profile.setPhoneNumber(trimToNull(request.phoneNumber()));
        profile.setBio(trimToNull(request.bio()));
        profile.setAvatarUrl(trimToNull(request.avatarUrl()));

        UserProfile saved = userProfileRepository.save(profile);
        return toResponse(saved);
    }

    private UserProfile createEmptyProfile(String email) {
        UserProfile profile = new UserProfile();
        profile.setEmail(email);
        return userProfileRepository.save(profile);
    }

    private UserProfileResponse toResponse(UserProfile profile) {
        return new UserProfileResponse(
                profile.getEmail(),
                profile.getPhoneNumber(),
                profile.getBio(),
                profile.getAvatarUrl()
        );
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}


