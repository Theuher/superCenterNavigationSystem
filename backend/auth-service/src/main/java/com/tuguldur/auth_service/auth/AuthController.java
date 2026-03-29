package com.tuguldur.auth_service.auth;

import com.tuguldur.auth_service.auth.dto.AuthResponse;
import com.tuguldur.auth_service.auth.dto.LoginRequest;
import com.tuguldur.auth_service.auth.dto.ProfileResponse;
import com.tuguldur.auth_service.auth.dto.ProfileUpdateRequest;
import com.tuguldur.auth_service.auth.dto.RoleChangeRequest;
import com.tuguldur.auth_service.auth.dto.RegisterRequest;
import com.tuguldur.auth_service.auth.dto.UserRoleResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER','STAFF','MANAGER','ADMIN')")
    public ProfileResponse me(Authentication authentication) {
        return authService.me(authentication.getName());
    }

    @PatchMapping("/me")
    @PreAuthorize("hasAnyRole('USER','STAFF','MANAGER','ADMIN')")
    public ProfileResponse updateMe(@Valid @RequestBody ProfileUpdateRequest request, Authentication authentication) {
        return authService.updateProfile(authentication.getName(), request);
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public List<UserRoleResponse> listUsers(Authentication authentication) {
        Set<String> requesterRoles = authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .collect(Collectors.toSet());
        return authService.listUsers(requesterRoles);
    }

    @PatchMapping("/users/{id}/role")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public UserRoleResponse changeRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleChangeRequest request,
            Authentication authentication
    ) {
        Set<String> requesterRoles = authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .collect(Collectors.toSet());
        return authService.changeRole(id, request, requesterRoles);
    }
}



