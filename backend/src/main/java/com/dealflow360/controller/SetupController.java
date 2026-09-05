package com.dealflow360.controller;

import com.dealflow360.service.AuthService;
import com.dealflow360.service.SetupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/setup")
@RequiredArgsConstructor
public class SetupController {

    private final SetupService setupService;

    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> checkAdminSetupStatus() {
        if (!setupService.isSetupAllowed()) {
            throw new AccessDeniedException("Initial admin setup has already been completed.");
        }
        return ResponseEntity.ok(Map.of(
            "setupAllowed", true,
            "message", "Zero administrators detected. First-admin bootstrap is ready."
        ));
    }

    @PostMapping("/admin")
    public ResponseEntity<AuthService.LoginResponse> bootstrapFirstAdmin(@RequestBody SetupService.FirstAdminRequest req) {
        if (!setupService.isSetupAllowed()) {
            throw new AccessDeniedException("Initial admin setup has already been completed.");
        }
        AuthService.LoginResponse res = setupService.createFirstAdmin(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }
}
