package com.dealflow360.service;

import com.dealflow360.entity.User;
import com.dealflow360.entity.UserAuditLog;
import com.dealflow360.exception.BadRequestException;
import com.dealflow360.exception.DuplicateResourceException;
import com.dealflow360.exception.ResourceNotFoundException;
import com.dealflow360.repository.UserAuditLogRepository;
import com.dealflow360.repository.UserRepository;
import com.dealflow360.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final UserAuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public record LoginResponse(
        String accessToken,
        String role,
        String email,
        String fullName,
        Long userId,
        String department,
        Boolean mustChangePassword
    ) {}

    public record RegisterResponse(Long userId, String email, String role) {}

    public record UserSessionResponse(
        Long userId,
        String email,
        String role,
        String fullName,
        String department,
        String avatarUrl,
        Boolean mustChangePassword
    ) {}

    public record ChangePasswordRequest(
        String currentPassword,
        String newPassword
    ) {}

    @Transactional
    public RegisterResponse register(String email, String password, String firstName, String lastName, User.UserRole role) {
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email already registered: " + email);
        }
        User user = User.builder()
            .email(email)
            .passwordHash(passwordEncoder.encode(password))
            .firstName(firstName)
            .lastName(lastName)
            .role(role != null ? role : User.UserRole.SALES_REP)
            .isActive(false) // Pending Administrator Approval
            .mustChangePassword(false)
            .department("Sales Operations")
            .build();
        User saved = userRepository.save(user);

        auditLogRepository.save(UserAuditLog.builder()
            .actorEmail(email)
            .targetUserId(saved.getId())
            .targetEmail(saved.getEmail())
            .action("USER_REGISTERED_PENDING_APPROVAL")
            .newValue("Status: INACTIVE (Pending Admin Approval), Role: " + saved.getRole())
            .notes("Self-registered on portal — requires admin activation")
            .build());

        log.info("New user registered and queued for admin approval: {} (ID: {})", saved.getEmail(), saved.getId());
        return new RegisterResponse(saved.getId(), saved.getEmail(), saved.getRole().name());
    }

    public LoginResponse login(String email, String password) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, password)
        );
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        String token = jwtTokenProvider.generateAccessToken(user);
        return new LoginResponse(
            token,
            user.getRole().name(),
            user.getEmail(),
            user.getFullName(),
            user.getId(),
            user.getDepartment() != null ? user.getDepartment() : "Sales Operations",
            Boolean.TRUE.equals(user.getMustChangePassword())
        );
    }

    public UserSessionResponse getSession(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return new UserSessionResponse(
            user.getId(),
            user.getEmail(),
            user.getRole().name(),
            user.getFullName(),
            user.getDepartment() != null ? user.getDepartment() : "Sales Operations",
            user.getAvatarUrl(),
            Boolean.TRUE.equals(user.getMustChangePassword())
        );
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest req) {
        if (req.newPassword() == null || req.newPassword().length() < 8) {
            throw new BadRequestException("New password must be at least 8 characters long.");
        }
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        if (req.currentPassword() != null && !req.currentPassword().isBlank()) {
            if (!passwordEncoder.matches(req.currentPassword(), user.getPasswordHash())) {
                throw new BadCredentialsException("Current password does not match.");
            }
        }

        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        auditLogRepository.save(UserAuditLog.builder()
            .actorUserId(user.getId())
            .actorEmail(user.getEmail())
            .targetUserId(user.getId())
            .targetEmail(user.getEmail())
            .action("PASSWORD_CHANGED")
            .notes("Password successfully changed by user")
            .build());

        log.info("Password changed for user: {}", email);
    }
}

