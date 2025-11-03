package com.example.project_CS261.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO สำหรับ Admin Login
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminLoginResponse {
    private boolean status;
    private String message;
    private String email;
    private String displayName;
    private String role;
    private LocalDateTime lastLogin;

    // Constructor สำหรับ error
    public AdminLoginResponse(boolean status, String message) {
        this.status = status;
        this.message = message;
    }
}
