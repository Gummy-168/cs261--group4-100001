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

    // Manual getters/setters เผื่อ Lombok ไม่ทำงาน
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
