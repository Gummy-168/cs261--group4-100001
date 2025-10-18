package com.example.project_CS261.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private boolean status;
    private String message;
    private Long userId;  // เพิ่ม userId
    private String username;
    private String displaynameTh;
    private String email;
    
    // Constructor สำหรับกรณี Error (ไม่มี user data)
    public LoginResponse(boolean status, String message) {
        this.status = status;
        this.message = message;
        this.userId = null;
        this.username = null;
        this.displaynameTh = null;
        this.email = null;
    }
}
