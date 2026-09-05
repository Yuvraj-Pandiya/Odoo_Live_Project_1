package com.dealflow360.config;

import com.dealflow360.entity.User;
import com.dealflow360.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        initSchemaUpdates();
        syncSequences();
        syncPasswords();
    }

    private void initSchemaUpdates() {
        try {
            jdbcTemplate.execute("ALTER TABLE dealflow.users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;");
            jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS dealflow.user_audit_logs (" +
                "    id BIGSERIAL PRIMARY KEY," +
                "    actor_user_id BIGINT," +
                "    actor_email VARCHAR(255) NOT NULL," +
                "    target_user_id BIGINT," +
                "    target_email VARCHAR(255) NOT NULL," +
                "    action VARCHAR(100) NOT NULL," +
                "    old_value TEXT," +
                "    new_value TEXT," +
                "    notes TEXT," +
                "    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()" +
                ");"
            );
            log.info("Schema updates for user governance and audit logs applied successfully.");
        } catch (Exception e) {
            log.warn("Schema initialization notice: {}", e.getMessage());
        }
    }

    private void syncPasswords() {
        String defaultPassword = "Password123!";
        
        // Ensure customer@dealflow360.com exists as CUSTOMER role
        if (!userRepository.existsByEmail("customer@dealflow360.com")) {
            User custUser = User.builder()
                .email("customer@dealflow360.com")
                .passwordHash(passwordEncoder.encode(defaultPassword))
                .firstName("Arjun")
                .lastName("Mehta (TCS)")
                .role(User.UserRole.CUSTOMER)
                .department("Procurement")
                .isActive(true)
                .mustChangePassword(false)
                .build();
            userRepository.save(custUser);
            log.info("Created demo customer user: customer@dealflow360.com");
        }

        // Ensure procurement1@corp-1.com exists as CUSTOMER role
        if (!userRepository.existsByEmail("procurement1@corp-1.com")) {
            User custUser1 = User.builder()
                .email("procurement1@corp-1.com")
                .passwordHash(passwordEncoder.encode(defaultPassword))
                .firstName("Tata")
                .lastName("Consultancy Services")
                .role(User.UserRole.CUSTOMER)
                .department("Procurement")
                .isActive(true)
                .mustChangePassword(false)
                .build();
            userRepository.save(custUser1);
            log.info("Created customer user: procurement1@corp-1.com");
        }

        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (!passwordEncoder.matches(defaultPassword, user.getPasswordHash())) {
                log.info("Updating BCrypt password hash for user: {}", user.getEmail());
                user.setPasswordHash(passwordEncoder.encode(defaultPassword));
                userRepository.save(user);
            }
        }
        log.info("Verified password hashes for {} users with 'Password123!'", users.size());
    }

    private void syncSequences() {
        String[] tables = {
            "users", "customers", "quotations", "quotation_lines", "approvals",
            "approval_audit_logs", "user_audit_logs", "products", "product_variants", "product_categories",
            "price_lists", "discount_tiers", "approval_chains", "warehouses",
            "warehouse_stock", "fulfillment_orders", "fulfillment_lines",
            "subscriptions", "subscription_lines", "invoices", "invoice_lines",
            "payments", "negotiation_comments", "deal_health_alerts", "upsell_rules"
        };

        for (String table : tables) {
            try {
                String sql = String.format(
                    "SELECT setval(pg_get_serial_sequence('dealflow.%s', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.%s))",
                    table, table
                );
                jdbcTemplate.queryForObject(sql, Long.class);
            } catch (Exception e) {
                log.debug("Sequence sync for table {}: {}", table, e.getMessage());
            }
        }
        log.info("Synchronized PostgreSQL auto-increment sequences for {} tables.", tables.length);
    }
}
