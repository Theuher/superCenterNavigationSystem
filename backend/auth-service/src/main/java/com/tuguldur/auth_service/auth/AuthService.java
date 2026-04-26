package com.tuguldur.auth_service.auth;

import com.tuguldur.auth_service.auth.dto.AuthResponse;
import com.tuguldur.auth_service.auth.dto.LoginRequest;
import com.tuguldur.auth_service.auth.dto.ProfileResponse;
import com.tuguldur.auth_service.auth.dto.ProfileUpdateRequest;
import com.tuguldur.auth_service.auth.dto.RoleChangeRequest;
import com.tuguldur.auth_service.auth.dto.RegisterRequest;
import com.tuguldur.auth_service.auth.dto.UserRoleResponse;
import com.tuguldur.auth_service.role.Role;
import com.tuguldur.auth_service.role.RoleName;
import com.tuguldur.auth_service.role.RoleRepository;
import com.tuguldur.auth_service.security.JwtService;
import com.tuguldur.auth_service.user.UserAccount;
import com.tuguldur.auth_service.user.UserRepository;
import java.util.Set;
import java.util.List;
import java.util.Comparator;
import java.util.stream.Collectors;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email().toLowerCase())) {
            throw new IllegalArgumentException("Email already registered.");
        }

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new IllegalStateException("Default role not configured."));

        UserAccount user = new UserAccount();
        user.setFullName(request.fullName());
        user.setEmail(request.email().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRoles(Set.of(userRole));

        UserAccount saved = userRepository.save(user);
        return buildAuthResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().toLowerCase();
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(normalizedEmail, request.password()));
        UserAccount user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials."));
        return buildAuthResponse(user);
    }

    public ProfileResponse me(String email) {
        UserAccount user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        return mapProfile(user);
    }

    public ProfileResponse updateProfile(String email, ProfileUpdateRequest request) {
        UserAccount user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
        }
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        UserAccount saved = userRepository.save(user);
        return mapProfile(saved);
    }

    private AuthResponse buildAuthResponse(UserAccount user) {
        Set<String> roles = user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet());
        String token = jwtService.generateToken(user.getEmail(), roles);
        return new AuthResponse(token, "Bearer", mapProfile(user), roles);
    }

    private ProfileResponse mapProfile(UserAccount user) {
        Set<String> roles = user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet());
        return new ProfileResponse(user.getId(), user.getFullName(), user.getEmail(), roles);
    }

    public List<UserRoleResponse> listUsers(Set<String> requesterRoles) {
        boolean isAdmin = requesterRoles.contains(RoleName.ROLE_ADMIN.name());
        return userRepository.findAll().stream()
                .filter(user -> isAdmin || user.getRoles().stream()
                        .noneMatch(role -> role.getName() == RoleName.ROLE_ADMIN || role.getName() == RoleName.ROLE_MANAGER))
                .sorted(Comparator.comparing(UserAccount::getEmail, String.CASE_INSENSITIVE_ORDER))
                .map(this::mapUserRoleResponse)
                .toList();
    }

    public UserRoleResponse changeRole(Long userId, RoleChangeRequest request, Set<String> requesterRoles) {
        UserAccount target = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        RoleName desiredRole;
        try {
            desiredRole = RoleName.valueOf(request.role().trim().toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid role.");
        }

        boolean isAdmin = requesterRoles.contains(RoleName.ROLE_ADMIN.name());
        boolean isManager = requesterRoles.contains(RoleName.ROLE_MANAGER.name());

        if (!isAdmin && !isManager) {
            throw new IllegalArgumentException("You are not allowed to change roles.");
        }

        if (isManager && !isAdmin) {
            boolean targetIsPrivileged = target.getRoles().stream()
                    .anyMatch(role -> role.getName() == RoleName.ROLE_ADMIN || role.getName() == RoleName.ROLE_MANAGER);
            if (targetIsPrivileged) {
                throw new IllegalArgumentException("Manager cannot modify admin or manager roles.");
            }
            if (!(desiredRole == RoleName.ROLE_USER || desiredRole == RoleName.ROLE_STAFF)) {
                throw new IllegalArgumentException("Manager can assign only USER or STAFF roles.");
            }
        }

        Set<RoleName> hierarchyRoles = switch (desiredRole) {
            case ROLE_USER -> Set.of(RoleName.ROLE_USER);
            case ROLE_STAFF -> Set.of(RoleName.ROLE_USER, RoleName.ROLE_STAFF);
            case ROLE_MANAGER -> Set.of(RoleName.ROLE_USER, RoleName.ROLE_STAFF, RoleName.ROLE_MANAGER);
            case ROLE_ADMIN -> Set.of(RoleName.ROLE_USER, RoleName.ROLE_STAFF, RoleName.ROLE_MANAGER, RoleName.ROLE_ADMIN);
        };

        Set<Role> mappedRoles = hierarchyRoles.stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new IllegalStateException("Role not configured: " + roleName.name())))
                .collect(Collectors.toSet());

        target.setRoles(mappedRoles);
        UserAccount saved = userRepository.save(target);
        return mapUserRoleResponse(saved);
    }

    private UserRoleResponse mapUserRoleResponse(UserAccount user) {
        Set<String> roles = user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet());
        return new UserRoleResponse(user.getId(), user.getFullName(), user.getEmail(), roles);
    }
}


