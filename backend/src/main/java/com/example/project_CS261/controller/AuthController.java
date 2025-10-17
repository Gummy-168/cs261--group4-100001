package com.example.project_CS261.controller;

import com.example.project_CS261.dto.LoginRequest;
import com.example.project_CS261.dto.LoginResponse;
import com.example.project_CS261.dto.TuVerifyResponse;
import com.example.project_CS261.service.TuAuthService;
import com.example.project_CS261.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final TuAuthService tuAuthService;
    private final UserService userService;

    public AuthController(TuAuthService tuAuthService, UserService userService) {
        this.tuAuthService = tuAuthService;
        this.userService = userService;
    }

    /**
     * Login ผ่าน TU API และบันทึก Login History เท่านั้น
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
                
                // 3. บันทึก Login History เท่านั้น
                userService.saveLoginHistory(tuResponse, ipAddress);

                // 4. ส่ง Response กลับไป (ข้อมูลจาก TU API)
                LoginResponse success = new LoginResponse(
                    true, 
                    "Login Success", 
                    tuResponse.getUsername(), 
                    tuResponse.getDisplaynameTh(), 
                    tuResponse.getEmail()
                );
                return ResponseEntity.ok(success);
            } else {
                return ResponseEntity.status(401).body(
                    new LoginResponse(false, "Invalid credentials", null, null, null)
                );
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                new LoginResponse(false, "Login failed: " + e.getMessage(), null, null, null)
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
