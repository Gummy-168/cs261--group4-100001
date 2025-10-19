package com.example.project_CS261.controller;

import com.example.project_CS261.dto.LoginRequest;
import com.example.project_CS261.dto.LoginResponse;
import com.example.project_CS261.dto.TuVerifyResponse;
import com.example.project_CS261.security.JwtService;
import com.example.project_CS261.service.TuAuthService;
import com.example.project_CS261.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication API with TU Integration")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final TuAuthService tuAuthService;
    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(TuAuthService tuAuthService, UserService userService, JwtService jwtService) {
        this.tuAuthService = tuAuthService;
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    @Operation(summary = "Login with TU credentials", description = "Authenticate user with Thammasat University API and generate JWT token")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletRequest httpRequest) {
        try {
            logger.info("Login attempt for username: {}", request.getUsername());
            
            // 1. ตรวจสอบ username/password กับ TU API
            TuVerifyResponse tuResponse = tuAuthService.verify(request.getUsername(), request.getPassword());

            // Log ข้อมูลที่ได้จาก TU API
            logger.info("TU API Response - Username: {}, Faculty: {}, Department: {}", 
                tuResponse.getUsername(), tuResponse.getFaculty(), tuResponse.getDepartment());

            if (tuResponse != null && tuResponse.isStatus()) {
                // 2. ดึง IP Address
                String ipAddress = getClientIP(httpRequest);
                
                // 3. บันทึก Login History และได้ userId กลับมา
                Long userId = userService.saveLoginHistoryAndGetUserId(tuResponse, ipAddress);

                // 4. สร้าง JWT Token
                String token = jwtService.generateToken(userId, tuResponse.getUsername());

                logger.info("Login successful for user: {} with userId: {}", tuResponse.getUsername(), userId);

                // 5. ส่ง Response พร้อม Token
                LoginResponse success = new LoginResponse(
                    true, 
                    "Login Success",
                    token,
                    userId,
                    tuResponse.getUsername(), 
                    tuResponse.getDisplaynameTh(), 
                    tuResponse.getEmail(),
                    tuResponse.getFaculty(),
                    tuResponse.getDepartment()
                );
                return ResponseEntity.ok(success);
            } else {
                logger.warn("Invalid credentials for username: {}", request.getUsername());
                return ResponseEntity.status(401).body(
                    new LoginResponse(false, "Invalid credentials")
                );
            }
        } catch (Exception e) {
            logger.error("Login failed for username: {}", request.getUsername(), e);
            return ResponseEntity.status(500).body(
                new LoginResponse(false, "Login failed: " + e.getMessage())
            );
        }
    }
    
    @GetMapping("/validate")
    @Operation(summary = "Validate JWT token", description = "Check if the provided JWT token is valid")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Invalid token format");
            }

            String token = authHeader.substring(7);
            
            if (jwtService.validateToken(token)) {
                Long userId = jwtService.extractUserId(token);
                String username = jwtService.extractUsername(token);
                
                return ResponseEntity.ok(new ValidationResponse(true, "Token is valid", userId, username));
            } else {
                return ResponseEntity.status(401).body(new ValidationResponse(false, "Token is invalid or expired"));
            }
        } catch (Exception e) {
            logger.error("Token validation error", e);
            return ResponseEntity.status(401).body(new ValidationResponse(false, "Token validation failed"));
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

    // Inner class for validation response
    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    private static class ValidationResponse {
        private boolean valid;
        private String message;
        private Long userId;
        private String username;

        public ValidationResponse(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }
    }
}
