package com.dealflow360.config;

import com.dealflow360.entity.User;
import com.dealflow360.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String defaultPassword = "Password123!";
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (!passwordEncoder.matches(defaultPassword, user.getPasswordHash())) {
                log.info("Updating BCrypt password hash for user: {}", user.getEmail());
                user.setPasswordHash(passwordEncoder.encode(defaultPassword));
                userRepository.save(user);
            }
        }
        log.info("Verified password hashes for {} demo users with 'Password123!'", users.size());
    }
}
