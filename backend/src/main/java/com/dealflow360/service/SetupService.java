package com.dealflow360.service;

import com.dealflow360.entity.User;
import com.dealflow360.entity.UserAuditLog;
import com.dealflow360.exception.BadRequestException;
import com.dealflow360.exception.DuplicateResourceException;
import com.dealflow360.repository.UserAuditLogRepository;
import com.dealflow360.repository.UserRepository;
import com.dealflow360.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SetupService {

    private final UserRepository userRepository;
    private final UserAuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public record FirstAdminRequest(
        String firstName,
        String lastName,
        String email,
        String password,
        String department
    ) {}

    public boolean isSetupAllowed() {
        return userRepository.countByRole(User.UserRole.ADMIN) == 0;
    }

    @Transactional
    public synchronized AuthService.LoginResponse createFirstAdmin(FirstAdminRequest req) {
        if (!isSetupAllowed()) {
            log.warn("Setup attempt rejected: Administrator already exists.");
            throw new AccessDeniedException("Initial admin setup has already been completed. This endpoint is disabled.");
        }

        if (req.email() == null || req.email().isBlank()) {
            throw new BadRequestException("Email address is required.");
        }
        if (req.password() == null || req.password().length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters long.");
        }
        if (req.firstName() == null || req.firstName().isBlank()) {
            throw new BadRequestException("First name is required.");
        }
        if (req.lastName() == null || req.lastName().isBlank()) {
            throw new BadRequestException("Last name is required.");
        }

        String normalizedEmail = req.email().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("Email already registered: " + normalizedEmail);
        }

        User admin = User.builder()
            .firstName(req.firstName().trim())
            .lastName(req.lastName().trim())
            .email(normalizedEmail)
            .passwordHash(passwordEncoder.encode(req.password()))
            .role(User.UserRole.ADMIN)
            .department(req.department() != null && !req.department().isBlank() ? req.department().trim() : "Executive Operations")
            .isActive(true)
            .mustChangePassword(false)
            .build();

        User saved = userRepository.save(admin);
        log.info("First administrator account successfully bootstrapped: {} (ID: {})", saved.getEmail(), saved.getId());

        auditLogRepository.save(UserAuditLog.builder()
            .actorUserId(saved.getId())
            .actorEmail(saved.getEmail())
            .targetUserId(saved.getId())
            .targetEmail(saved.getEmail())
            .action("INITIAL_ADMIN_SETUP")
            .newValue("ROLE: ADMIN")
            .notes("One-time first admin bootstrap execution")
            .build());

        String token = jwtTokenProvider.generateAccessToken(saved);
        return new AuthService.LoginResponse(
            token,
            saved.getRole().name(),
            saved.getEmail(),
            saved.getFullName(),
            saved.getId(),
            saved.getDepartment(),
            false
        );
    }
}
