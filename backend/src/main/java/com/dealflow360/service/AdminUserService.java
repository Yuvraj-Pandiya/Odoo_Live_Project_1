package com.dealflow360.service;

import com.dealflow360.entity.User;
import com.dealflow360.entity.UserAuditLog;
import com.dealflow360.exception.BadRequestException;
import com.dealflow360.exception.DuplicateResourceException;
import com.dealflow360.exception.ResourceNotFoundException;
import com.dealflow360.repository.UserAuditLogRepository;
import com.dealflow360.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminUserService {

    private final UserRepository userRepository;
    private final UserAuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public record UserResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        String fullName,
        String role,
        String department,
        Boolean isActive,
        Boolean mustChangePassword,
        String createdAt,
        String updatedAt
    ) {
        public static UserResponse fromEntity(User u) {
            return new UserResponse(
                u.getId(),
                u.getEmail(),
                u.getFirstName(),
                u.getLastName(),
                u.getFullName(),
                u.getRole().name(),
                u.getDepartment() != null ? u.getDepartment() : "General",
                u.getIsActive(),
                Boolean.TRUE.equals(u.getMustChangePassword()),
                u.getCreatedAt() != null ? u.getCreatedAt().toString() : null,
                u.getUpdatedAt() != null ? u.getUpdatedAt().toString() : null
            );
        }
    }

    public record CreateUserRequest(
        String firstName,
        String lastName,
        String email,
        String role,
        String department
    ) {}

    public record CreateUserResponse(
        UserResponse user,
        String temporaryPassword
    ) {}

    public record UpdateUserRequest(
        String firstName,
        String lastName,
        String role,
        String department,
        Boolean isActive
    ) {}

    public List<UserResponse> getInternalUsers() {
        return userRepository.findByRoleNotOrderByCreatedAtDesc(User.UserRole.CUSTOMER)
            .stream()
            .map(UserResponse::fromEntity)
            .toList();
    }

    public UserResponse getUserById(Long id) {
        User u = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return UserResponse.fromEntity(u);
    }

    @Transactional
    public CreateUserResponse createUser(CreateUserRequest req, String actorEmail) {
        if (req.email() == null || req.email().isBlank()) {
            throw new BadRequestException("Email address is required.");
        }
        if (req.firstName() == null || req.firstName().isBlank()) {
            throw new BadRequestException("First name is required.");
        }
        if (req.lastName() == null || req.lastName().isBlank()) {
            throw new BadRequestException("Last name is required.");
        }
        if (req.role() == null || req.role().isBlank()) {
            throw new BadRequestException("Role is required.");
        }

        String email = req.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("User already exists with email: " + email);
        }

        User.UserRole targetRole;
        try {
            targetRole = User.UserRole.valueOf(req.role().trim().toUpperCase());
            if (targetRole == User.UserRole.CUSTOMER) {
                throw new BadRequestException("Customer roles cannot be provisioned through internal user management.");
            }
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + req.role() + ". Must be ADMIN, MANAGER, FINANCE, or SALES_REP.");
        }

        String tempPassword = generateTemporaryPassword();

        User user = User.builder()
            .firstName(req.firstName().trim())
            .lastName(req.lastName().trim())
            .email(email)
            .passwordHash(passwordEncoder.encode(tempPassword))
            .role(targetRole)
            .department(req.department() != null && !req.department().isBlank() ? req.department().trim() : "Sales Operations")
            .isActive(true)
            .mustChangePassword(true)
            .build();

        User saved = userRepository.save(user);

        User actor = userRepository.findByEmail(actorEmail).orElse(null);
        auditLogRepository.save(UserAuditLog.builder()
            .actorUserId(actor != null ? actor.getId() : null)
            .actorEmail(actorEmail)
            .targetUserId(saved.getId())
            .targetEmail(saved.getEmail())
            .action("USER_CREATED")
            .newValue(String.format("Role: %s, Dept: %s, TempPassIssued: true", saved.getRole(), saved.getDepartment()))
            .notes("Created via Admin User Management")
            .build());

        log.info("Admin {} created new internal user: {} with role {}", actorEmail, saved.getEmail(), saved.getRole());

        return new CreateUserResponse(UserResponse.fromEntity(saved), tempPassword);
    }

    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest req, String actorEmail) {
        User target = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        User actor = userRepository.findByEmail(actorEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Actor not found: " + actorEmail));

        StringBuilder oldVal = new StringBuilder();
        StringBuilder newVal = new StringBuilder();

        // Check 1: Prevent changing own role
        if (req.role() != null && !req.role().isBlank()) {
            User.UserRole newRole;
            try {
                newRole = User.UserRole.valueOf(req.role().trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role: " + req.role());
            }

            if (newRole != target.getRole()) {
                if (Objects.equals(actor.getId(), target.getId())) {
                    throw new BadRequestException("Security Constraint: You cannot change your own role.");
                }

                // Check 2: Prevent demoting last remaining admin
                if (target.getRole() == User.UserRole.ADMIN && newRole != User.UserRole.ADMIN) {
                    long activeAdmins = userRepository.countByRoleAndIsActiveTrue(User.UserRole.ADMIN);
                    if (activeAdmins <= 1) {
                        throw new BadRequestException("Security Constraint: Cannot demote the last remaining active Administrator.");
                    }
                }

                oldVal.append("Role: ").append(target.getRole()).append("; ");
                newVal.append("Role: ").append(newRole).append("; ");
                target.setRole(newRole);
            }
        }

        // Check 3: Prevent deactivating last active admin or self
        if (req.isActive() != null && !req.isActive().equals(target.getIsActive())) {
            if (!req.isActive()) {
                if (Objects.equals(actor.getId(), target.getId())) {
                    throw new BadRequestException("Security Constraint: You cannot deactivate your own account.");
                }
                if (target.getRole() == User.UserRole.ADMIN) {
                    long activeAdmins = userRepository.countByRoleAndIsActiveTrue(User.UserRole.ADMIN);
                    if (activeAdmins <= 1) {
                        throw new BadRequestException("Security Constraint: Cannot deactivate the last remaining active Administrator.");
                    }
                }
            }
            oldVal.append("isActive: ").append(target.getIsActive()).append("; ");
            newVal.append("isActive: ").append(req.isActive()).append("; ");
            target.setIsActive(req.isActive());
        }

        if (req.firstName() != null && !req.firstName().isBlank()) {
            target.setFirstName(req.firstName().trim());
        }
        if (req.lastName() != null && !req.lastName().isBlank()) {
            target.setLastName(req.lastName().trim());
        }
        if (req.department() != null) {
            target.setDepartment(req.department().trim());
        }

        User updated = userRepository.save(target);

        auditLogRepository.save(UserAuditLog.builder()
            .actorUserId(actor.getId())
            .actorEmail(actorEmail)
            .targetUserId(updated.getId())
            .targetEmail(updated.getEmail())
            .action("USER_UPDATED")
            .oldValue(oldVal.length() > 0 ? oldVal.toString() : "Details updated")
            .newValue(newVal.length() > 0 ? newVal.toString() : "Details saved")
            .notes("Updated via Admin User Management")
            .build());

        log.info("Admin {} updated user {}: {}", actorEmail, updated.getEmail(), newVal);

        return UserResponse.fromEntity(updated);
    }

    @Transactional
    public UserResponse deactivateUser(Long id, String actorEmail) {
        User target = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        User actor = userRepository.findByEmail(actorEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Actor not found: " + actorEmail));

        if (Objects.equals(actor.getId(), target.getId())) {
            throw new BadRequestException("Security Constraint: You cannot deactivate your own account.");
        }

        if (target.getRole() == User.UserRole.ADMIN && Boolean.TRUE.equals(target.getIsActive())) {
            long activeAdmins = userRepository.countByRoleAndIsActiveTrue(User.UserRole.ADMIN);
            if (activeAdmins <= 1) {
                throw new BadRequestException("Security Constraint: Cannot deactivate the last remaining active Administrator.");
            }
        }

        target.setIsActive(false);
        User saved = userRepository.save(target);

        auditLogRepository.save(UserAuditLog.builder()
            .actorUserId(actor.getId())
            .actorEmail(actorEmail)
            .targetUserId(saved.getId())
            .targetEmail(saved.getEmail())
            .action("USER_DEACTIVATED")
            .oldValue("isActive: true")
            .newValue("isActive: false")
            .notes("Deactivated by Admin")
            .build());

        log.info("Admin {} deactivated user {}", actorEmail, saved.getEmail());
        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public UserResponse reactivateUser(Long id, String actorEmail) {
        User target = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        User actor = userRepository.findByEmail(actorEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Actor not found: " + actorEmail));

        target.setIsActive(true);
        User saved = userRepository.save(target);

        auditLogRepository.save(UserAuditLog.builder()
            .actorUserId(actor.getId())
            .actorEmail(actorEmail)
            .targetUserId(saved.getId())
            .targetEmail(saved.getEmail())
            .action("USER_REACTIVATED")
            .oldValue("isActive: false")
            .newValue("isActive: true")
            .notes("Reactivated by Admin")
            .build());

        log.info("Admin {} reactivated user {}", actorEmail, saved.getEmail());
        return UserResponse.fromEntity(saved);
    }

    public List<UserAuditLog> getAuditLogs() {
        return auditLogRepository.findTop100ByOrderByCreatedAtDesc();
    }

    private String generateTemporaryPassword() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder("DF360#");
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
