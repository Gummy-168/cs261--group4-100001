package com.example.project_CS261.dto;

public class LoginResponse {
    private String message;
    private String email;
    private String name;

    public LoginResponse(String message, String email, String name) {
        this.message = message;
        this.email = email;
        this.name = name;
    }

    // Getters and Setters
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}