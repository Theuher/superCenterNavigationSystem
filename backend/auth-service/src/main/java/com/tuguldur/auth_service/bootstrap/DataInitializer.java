package com.tuguldur.auth_service.bootstrap;

import com.tuguldur.auth_service.role.Role;
import com.tuguldur.auth_service.role.RoleName;
import com.tuguldur.auth_service.role.RoleRepository;
import com.tuguldur.auth_service.user.UserAccount;
import com.tuguldur.auth_service.user.UserRepository;
import java.util.EnumSet;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL:admin@supercenter.mn}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:Admin123!}")
    private String adminPassword;

    public DataInitializer(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        EnumSet.allOf(RoleName.class).forEach(roleName ->
                roleRepository.findByName(roleName).orElseGet(() -> roleRepository.save(new Role(roleName))));

        Set<Role> allAdminHierarchyRoles = Set.of(
                roleRepository.findByName(RoleName.ROLE_ADMIN).orElseThrow(),
                roleRepository.findByName(RoleName.ROLE_MANAGER).orElseThrow(),
                roleRepository.findByName(RoleName.ROLE_STAFF).orElseThrow(),
                roleRepository.findByName(RoleName.ROLE_USER).orElseThrow()
        );

        UserAccount admin = userRepository.findByEmail(adminEmail.toLowerCase()).orElseGet(() -> {
            UserAccount newAdmin = new UserAccount();
            newAdmin.setFullName("System Admin");
            newAdmin.setEmail(adminEmail.toLowerCase());
            newAdmin.setPassword(passwordEncoder.encode(adminPassword));
            return newAdmin;
        });

        admin.setRoles(allAdminHierarchyRoles);
        userRepository.save(admin);
    }
}



