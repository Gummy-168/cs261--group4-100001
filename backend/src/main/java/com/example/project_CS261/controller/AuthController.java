package com.example.project_CS261.controller;

import com.example.project_CS261.dto.LoginRequest;
import com.example.project_CS261.dto.LoginResponse;
import com.example.project_CS261.dto.TuVerifyResponse;
import com.example.project_CS261.service.TuAuthService;
import com.example.project_CS261.service.UserService;
import com.example.project_CS261.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final TuAuthService tuAuthService;
    private final UserService userService;
    private final AdminService adminService;

    public AuthController(TuAuthService tuAuthService, UserService userService, AdminService adminService) {
        this.tuAuthService = tuAuthService;
        this.userService = userService;
        this.adminService = adminService;
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

                // 3. บันทึก Login History
                userService.saveLoginHistory(tuResponse, ipAddress);

                // 4. เช็คว่าเป็น Admin หรือไม่
                boolean isAdmin = adminService.isAdmin(tuResponse.getUsername());

                // 5. ส่ง Response กลับไป (พร้อมข้อมูลว่าเป็น Admin หรือไม่)
                LoginResponse success = new LoginResponse(
                        true,                              // status
                        "Login Success",                   // message
                        null,                              // token (if you use JWT, generate it here)
                        null,                              // userId (if you want to include it)
                        tuResponse.getUsername(),          // username
                        tuResponse.getDisplaynameTh(),     // displaynameTh
                        tuResponse.getEmail(),             // email
                        tuResponse.getFaculty(),           // faculty
                        tuResponse.getDepartment(),        // department
                        isAdmin                            // isAdmin ✅
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