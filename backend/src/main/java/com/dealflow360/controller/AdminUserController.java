package com.dealflow360.controller;

import com.dealflow360.entity.UserAuditLog;
import com.dealflow360.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<List<AdminUserService.UserResponse>> listUsers() {
        return ResponseEntity.ok(adminUserService.getInternalUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserService.UserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminUserService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<AdminUserService.CreateUserResponse> createUser(
            @RequestBody AdminUserService.CreateUserRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminUserService.createUser(req, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminUserService.UserResponse> updateUser(
            @PathVariable Long id,
            @RequestBody AdminUserService.UpdateUserRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(adminUserService.updateUser(id, req, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<AdminUserService.UserResponse> deactivateUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(adminUserService.deactivateUser(id, userDetails.getUsername()));
    }

    @PostMapping("/{id}/reactivate")
    public ResponseEntity<AdminUserService.UserResponse> reactivateUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(adminUserService.reactivateUser(id, userDetails.getUsername()));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<UserAuditLog>> getAuditLogs() {
        return ResponseEntity.ok(adminUserService.getAuditLogs());
    }
}
