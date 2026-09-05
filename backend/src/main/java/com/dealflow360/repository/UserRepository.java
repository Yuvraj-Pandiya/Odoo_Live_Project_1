package com.dealflow360.repository;

import com.dealflow360.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRole(User.UserRole role);
    long countByRoleAndIsActiveTrue(User.UserRole role);
    List<User> findByRoleNotOrderByCreatedAtDesc(User.UserRole role);
    List<User> findByRoleInOrderByCreatedAtDesc(List<User.UserRole> roles);
}

