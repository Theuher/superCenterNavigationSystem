package com.tuguldur.user_service.profile;

import com.tuguldur.user_service.profile.dto.UserProfileRequest;
import com.tuguldur.user_service.profile.dto.UserProfileResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER','STAFF','MANAGER','ADMIN')")
    public UserProfileResponse me(Authentication authentication) {
        return userProfileService.getMyProfile(authentication.getName());
    }

    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('USER','STAFF','MANAGER','ADMIN')")
    public UserProfileResponse updateMe(@Valid @RequestBody UserProfileRequest request, Authentication authentication) {
        return userProfileService.updateMyProfile(authentication.getName(), request);
    }
}

