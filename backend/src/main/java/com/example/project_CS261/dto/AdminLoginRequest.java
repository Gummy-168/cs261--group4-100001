package com.example.project_CS261.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO สำหรับ Admin Login
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminLoginRequest {
    private String email;
    private String password;
}
