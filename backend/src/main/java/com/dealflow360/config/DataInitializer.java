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
    private final com.dealflow360.repository.QuotationRepository quotationRepository;
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

        List<com.dealflow360.entity.Quotation> quotations = quotationRepository.findAll();
        for (com.dealflow360.entity.Quotation q : quotations) {
            if (q.getPortalToken() == null || q.getPortalToken().isBlank()) {
                if ("Q-1042".equals(q.getQuoteNumber())) {
                    q.setPortalToken("d8e3b2a1c4f50967");
                } else if ("Q-1039".equals(q.getQuoteNumber())) {
                    q.setPortalToken("b1c2d3e4f5a60718");
                } else if ("Q-1035".equals(q.getQuoteNumber())) {
                    q.setPortalToken("c2d3e4f5a6b70829");
                } else if ("Q-1030".equals(q.getQuoteNumber())) {
                    q.setPortalToken("e5f6a7b8c9d01930");
                } else {
                    q.setPortalToken(java.util.UUID.randomUUID().toString());
                }
                quotationRepository.save(q);
                log.info("Assigned portalToken '{}' for quotation {}", q.getPortalToken(), q.getQuoteNumber());
            }
        }
    }
}
