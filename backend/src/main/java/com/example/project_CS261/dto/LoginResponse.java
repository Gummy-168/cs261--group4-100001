package com.example.project_CS261.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LoginResponse {
    private boolean status;
    private String message;
    private String token;  // JWT Token
    private Long userId;
    private String username;
    private String displaynameTh;
    private String email;
    private String faculty;  // เพิ่ม faculty
    private String department;  // เพิ่ม department
    
    // Constructor สำหรับกรณี Success (มีข้อมูลครบ)
    public LoginResponse(boolean status, String message, String token, Long userId, 
                        String username, String displaynameTh, String email, 
                        String faculty, String department) {
        this.status = status;
        this.message = message;
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.displaynameTh = displaynameTh;
        this.email = email;
        this.faculty = faculty;
        this.department = department;
    }
    
    // Constructor สำหรับกรณี Error (ไม่มี user data)
    public LoginResponse(boolean status, String message) {
        this.status = status;
        this.message = message;
        this.token = null;
        this.userId = null;
        this.username = null;
        this.displaynameTh = null;
        this.email = null;
    }
}
