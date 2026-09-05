package com.dealflow360.controller;

import com.dealflow360.entity.User;
import com.dealflow360.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    public record LoginRequest(
            @NotBlank(message = "Email address is required") @Email(message = "Please enter a valid email address (e.g. user@company.com)") String email,
            @NotBlank(message = "Password is required") String password) {
    }

    public record RegisterRequest(
            @NotBlank(message = "Email address is required") @Email(message = "Please enter a valid email address (e.g. user@company.com)") String email,
            @NotBlank(message = "Password is required") @Size(min = 8, message = "Password must be at least 8 characters long") String password,
            @NotBlank(message = "First name is required") String firstName,
            @NotBlank(message = "Last name is required") String lastName,
            String role) {
    }

    @PostMapping("/login")
    public ResponseEntity<AuthService.LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req.email(), req.password()));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthService.RegisterResponse> register(@Valid @RequestBody RegisterRequest req) {
        User.UserRole userRole = null;
        if (req.role() != null && !req.role().isBlank()) {
            try {
                userRole = User.UserRole.valueOf(req.role().trim().toUpperCase());
            } catch (Exception ignored) {
            }
        }
        return ResponseEntity.ok(authService.register(
                req.email(), req.password(), req.firstName(), req.lastName(), userRole));
    }

    @GetMapping({"/session", "/me"})
    public ResponseEntity<AuthService.UserSessionResponse> getSession(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(authService.getSession(userDetails.getUsername()));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody AuthService.ChangePasswordRequest req) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        authService.changePassword(userDetails.getUsername(), req);
        return ResponseEntity.ok().body(java.util.Map.of("success", true, "message", "Password changed successfully."));
    }
}
