package com.dealflow360.service;

import com.dealflow360.entity.User;
import com.dealflow360.exception.DuplicateResourceException;
import com.dealflow360.exception.ResourceNotFoundException;
import com.dealflow360.repository.UserRepository;
import com.dealflow360.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public record LoginResponse(String accessToken, String role, String email, String fullName, Long userId) {}
    public record RegisterResponse(Long userId, String email, String role) {}

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
            .isActive(true)
            .build();
        User saved = userRepository.save(user);
        return new RegisterResponse(saved.getId(), saved.getEmail(), saved.getRole().name());
    }

    public LoginResponse login(String email, String password) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, password)
        );
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        String token = jwtTokenProvider.generateAccessToken(user);
        return new LoginResponse(token, user.getRole().name(), user.getEmail(), user.getFullName(), user.getId());
    }
}
