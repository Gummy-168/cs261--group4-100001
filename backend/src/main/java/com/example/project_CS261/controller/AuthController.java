package com.example.project_CS261.controller;

import com.example.project_CS261.dto.LoginRequest;
import com.example.project_CS261.dto.LoginResponse;
import com.example.project_CS261.dto.TuVerifyResponse;
import com.example.project_CS261.service.TuAuthService;
import com.example.project_CS261.service.UserService;
import com.example.project_CS261.service.AdminService;
import com.example.project_CS261.security.JwtService;
import com.example.project_CS261.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(originPatterns = "http://localhost:5173")
public class AuthController {

    private final TuAuthService tuAuthService;
    private final UserService userService;
    private final AdminService adminService;
    private final JwtService jwtService;

    public AuthController(TuAuthService tuAuthService, UserService userService, AdminService adminService, JwtService jwtService) {
        this.tuAuthService = tuAuthService;
        this.userService = userService;
        this.adminService = adminService;
        this.jwtService = jwtService;
    }

    /**
     * Login ผ่าน TU API และตรวจสอบว่าเป็น Admin หรือไม่
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request,
                                               HttpServletRequest httpRequest) {
        try {
            // 1. ตรวจสอบ username/password กับ TU API
            TuVerifyResponse tuResponse = tuAuthService.verify(request.getUsername(), request.getPassword());

            if (tuResponse != null && tuResponse.isStatus()) {
                // 2. ดึง IP Address
                String ipAddress = getClientIP(httpRequest);

                // 3. บันทึก Login History และรับ User object กลับมา
                User user = userService.saveLoginHistory(tuResponse, ipAddress);

                // 4. เช็คว่าเป็น Admin หรือไม่
                boolean isAdmin = adminService.isAdmin(tuResponse.getUsername());

                // 5. Generate JWT Token
                String token = jwtService.generateToken(user.getId(), user.getUsername());

                // 6. ส่ง Response กลับไป (พร้อม JWT Token)
                LoginResponse success = new LoginResponse(
                        true,                              // status
                        "Login Success",                   // message
                        token,                             // token - Generated JWT! ✅
                        user.getId(),                      // userId
                        tuResponse.getUsername(),          // username
                        tuResponse.getDisplaynameTh(),     // displaynameTh
                        tuResponse.getEmail(),             // email
                        tuResponse.getFaculty(),           // faculty
                        tuResponse.getDepartment(),        // department
                        isAdmin                            // isAdmin
                );
                return ResponseEntity.ok(success);
            } else {
                return ResponseEntity.status(401).body(
                        new LoginResponse(false, "Invalid credentials")
                );
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    new LoginResponse(false, "Login failed: " + e.getMessage())
            );
        }
    }

    /**
     * Validate JWT token
     */
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(
                    new LoginResponse(false, "No token provided")
                );
            }

            String token = authHeader.substring(7);
            
            // Validate token
            if (jwtService.isTokenValid(token)) {
                String username = jwtService.extractUsername(token);
                return ResponseEntity.ok().body(
                    new LoginResponse(true, "Token is valid", token, null, username, null, null, null, null, false)
                );
            } else {
                return ResponseEntity.status(401).body(
                    new LoginResponse(false, "Invalid or expired token")
                );
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).body(
                new LoginResponse(false, "Token validation failed: " + e.getMessage())
            );
        }
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