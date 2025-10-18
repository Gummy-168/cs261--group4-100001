package com.example.project_CS261.controller;

import com.example.project_CS261.dto.LoginRequest;
import com.example.project_CS261.dto.LoginResponse;
import com.example.project_CS261.dto.TuVerifyResponse;
import com.example.project_CS261.model.User;
import com.example.project_CS261.service.JwtService; // <-- เพิ่ม import
import com.example.project_CS261.service.TuAuthService;
import com.example.project_CS261.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final TuAuthService tuAuthService;
    private final UserService userService;
    private final JwtService jwtService; // <-- จุดที่ 1: ประกาศ jwtService

    // จุดที่ 2: แก้ไข Constructor ให้รับ jwtService
    public AuthController(TuAuthService tuAuthService, UserService userService, JwtService jwtService) {
        this.tuAuthService = tuAuthService;
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            TuVerifyResponse tuResponse = tuAuthService.verify(request.getUsername(), request.getPassword());

            if (tuResponse != null && tuResponse.isStatus()) {
                // ส่วนนี้ของคุณถูกต้องอยู่แล้ว
                String ipAddress = getClientIP(httpRequest);
                User user = userService.findOrCreateUser(tuResponse);
                userService.saveLoginHistory(user, ipAddress);

                final String token = jwtService.generateToken(user.getUsername());

                LoginResponse success = new LoginResponse(
                        true,
                        "Login Success",
                        user.getUsername(),
                        user.getDisplaynameTh(),
                        user.getEmail(),
                        token
                );
                return ResponseEntity.ok(success);

            } else {
                // ---- จุดที่ต้องแก้ไข 1 ----
                // เพิ่ม null เข้าไปเป็นค่าที่ 6 สำหรับ token
                return ResponseEntity.status(401).body(new LoginResponse(false, "Invalid credentials", null, null, null, null));
            }
        } catch (Exception e) {
            // ---- จุดที่ต้องแก้ไข 2 ----
            // เพิ่ม null เข้าไปเป็นค่าที่ 6 สำหรับ token
            return ResponseEntity.status(500).body(new LoginResponse(false, "Login Failed: " + e.getMessage(), null, null, null, null));        }
    }
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // ดึง username ของ user ที่ login อยู่ปัจจุบันจาก Token
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        // เรียก service ให้ไปบันทึกเวลา logout
        userService.logUserLogout(currentUsername);

        return ResponseEntity.ok("Logged out successfully.");
    }

    /**
     * ฟังก์ชันดึง IP Address ของ Client
     */
    private String getClientIP(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}