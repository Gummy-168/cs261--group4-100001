package com.example.project_CS261.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LoginResponse {
    private boolean status;
    private String message;
    private String token;  // JWT Token (keep this if you use it)
    private Long userId;   // Keep this
    private String username;
    private String displaynameTh;
    private String email;
    private String faculty;
    private String department;
    private boolean isAdmin; // ✅ ADD THIS - to tell frontend if user is admin

    // Constructor for Success (with all data)
    public LoginResponse(boolean status, String message, String token, Long userId,
                         String username, String displaynameTh, String email,
                         String faculty, String department, boolean isAdmin) {
        this.status = status;
        this.message = message;
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.displaynameTh = displaynameTh;
        this.email = email;
        this.faculty = faculty;
        this.department = department;
        this.isAdmin = isAdmin;
    }

    // Constructor for Error (no user data)
    public LoginResponse(boolean status, String message) {
        this.status = status;
        this.message = message;
        this.token = null;
        this.userId = null;
        this.username = null;
        this.displaynameTh = null;
        this.email = null;
        this.faculty = null;
        this.department = null;
        this.isAdmin = false;
    }
}