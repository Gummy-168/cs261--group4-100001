package com.example.project_CS261.controller;

import com.example.project_CS261.dto.AdminLoginRequest;
import com.example.project_CS261.dto.AdminLoginResponse;
import com.example.project_CS261.model.Admin;
import com.example.project_CS261.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin Controller - จัดการ Admin Login และ CRUD
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /**
     * POST /api/admin/login
     * Login สำหรับ Admin ด้วย Email/Password
     */
    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponse> login(@RequestBody AdminLoginRequest request) {
        try {
            Admin admin = adminService.login(request.getEmail(), request.getPassword());

            if (admin != null) {
                AdminLoginResponse response = new AdminLoginResponse(
                        true,
                        "Login successful",
                        admin.getEmail(),
                        admin.getDisplayName(),
                        admin.getRole(),
                        admin.getLastLogin()
                );
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new AdminLoginResponse(false, "Invalid email or password"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AdminLoginResponse(false, "Login failed: " + e.getMessage()));
        }
    }

    /**
     * POST /api/admin/create
     * สร้าง Admin ใหม่ (ต้องเป็น Admin ถึงจะสร้างได้)
     */
    @PostMapping("/create")
    public ResponseEntity<?> createAdmin(
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {

        try {
            // เช็คว่าผู้สร้างเป็น Admin หรือไม่
            if (adminEmail == null || !adminService.isAdmin(adminEmail)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only admins can create new admins"));
            }

            String email = request.get("email");
            String password = request.get("password");
            String displayName = request.get("displayName");

            if (email == null || password == null || displayName == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email, password, and displayName are required"));
            }

            Admin admin = adminService.createAdmin(email, password, displayName, adminEmail);
            admin.clearPassword();  // ลบ password ก่อนส่งกลับ

            return ResponseEntity.status(HttpStatus.CREATED).body(admin);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/admin/check/{email}
     * เช็คว่า email เป็น Admin หรือไม่
     */
    @GetMapping("/check/{email}")
    public ResponseEntity<Map<String, Boolean>> checkAdmin(@PathVariable String email) {
        boolean isAdmin = adminService.isAdmin(email);
        return ResponseEntity.ok(Map.of("isAdmin", isAdmin));
    }

    /**
     * GET /api/admin/list
     * ดึงรายชื่อ Admin ทั้งหมด
     */
    @GetMapping("/list")
    public ResponseEntity<?> getAllAdmins(
            @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {

        // เช็คว่าผู้ขอดูเป็น Admin หรือไม่
        if (adminEmail == null || !adminService.isAdmin(adminEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only admins can view admin list"));
        }

        List<Admin> admins = adminService.getAllAdmins();
        return ResponseEntity.ok(Map.of(
                "count", admins.size(),
                "admins", admins
        ));
    }

    /**
     * GET /api/admin/list/active
     * ดึงรายชื่อ Admin ที่ active
     */
    @GetMapping("/list/active")
    public ResponseEntity<List<Admin>> getActiveAdmins() {
        return ResponseEntity.ok(adminService.getActiveAdmins());
    }

    /**
     * PUT /api/admin/change-password
     * เปลี่ยน password ของตัวเอง
     */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "X-Admin-Email") String adminEmail) {

        try {
            String oldPassword = request.get("oldPassword");
            String newPassword = request.get("newPassword");

            if (oldPassword == null || newPassword == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "oldPassword and newPassword are required"));
            }

            adminService.changePassword(adminEmail, oldPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/admin/reset-password
     * Reset password ของ Admin คนอื่น (สำหรับ Super Admin)
     */
    @PutMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "X-Admin-Email") String adminEmail) {

        try {
            // เช็คว่าผู้ขอ reset เป็น Admin หรือไม่
            if (!adminService.isAdmin(adminEmail)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only admins can reset passwords"));
            }

            String targetEmail = request.get("email");
            String newPassword = request.get("newPassword");

            if (targetEmail == null || newPassword == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "email and newPassword are required"));
            }

            adminService.resetPassword(targetEmail, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/admin/deactivate/{email}
     * ปิดการใช้งาน Admin
     */
    @PutMapping("/deactivate/{email}")
    public ResponseEntity<?> deactivateAdmin(
            @PathVariable String email,
            @RequestHeader(value = "X-Admin-Email") String adminEmail) {

        try {
            // เช็คว่าผู้ขอ deactivate เป็น Admin หรือไม่
            if (!adminService.isAdmin(adminEmail)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only admins can deactivate admins"));
            }

            adminService.deactivateAdmin(email);
            return ResponseEntity.ok(Map.of("message", "Admin deactivated successfully"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/admin/activate/{email}
     * เปิดใช้งาน Admin อีกครั้ง
     */
    @PutMapping("/activate/{email}")
    public ResponseEntity<?> activateAdmin(
            @PathVariable String email,
            @RequestHeader(value = "X-Admin-Email") String adminEmail) {

        try {
            // เช็คว่าผู้ขอ activate เป็น Admin หรือไม่
            if (!adminService.isAdmin(adminEmail)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only admins can activate admins"));
            }

            adminService.activateAdmin(email);
            return ResponseEntity.ok(Map.of("message", "Admin activated successfully"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/admin/delete/{email}
     * ลบ Admin (hard delete)
     */
    @DeleteMapping("/delete/{email}")
    public ResponseEntity<?> deleteAdmin(
            @PathVariable String email,
            @RequestHeader(value = "X-Admin-Email") String adminEmail) {

        try {
            // เช็คว่าผู้ขอลบเป็น Admin หรือไม่
            if (!adminService.isAdmin(adminEmail)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only admins can delete admins"));
            }

            // ห้ามลบตัวเอง
            if (email.equals(adminEmail)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Cannot delete yourself"));
            }

            adminService.deleteAdmin(email);
            return ResponseEntity.ok(Map.of("message", "Admin deleted successfully"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
