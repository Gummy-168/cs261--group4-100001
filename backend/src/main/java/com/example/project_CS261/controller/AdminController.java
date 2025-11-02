package com.example.project_CS261.controller;

import com.example.project_CS261.model.Admin;
import com.example.project_CS261.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin Controller - จัดการรายชื่อ Admin
 * Public endpoints for testing - no authentication required
 */
@RestController
@RequestMapping("/api/admin")

public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /**
     * GET /api/admin/check/{username}
     * เช็คว่า username เป็น Admin หรือไม่
     */
    @GetMapping("/check/{username}")
    public ResponseEntity<Map<String, Boolean>> checkAdmin(@PathVariable String username) {
        boolean isAdmin = adminService.isAdmin(username);
        return ResponseEntity.ok(Map.of("isAdmin", isAdmin));
    }

    /**
     * GET /api/admin/list
     * ดึงรายชื่อ Admin ทั้งหมด
     */
    @GetMapping("/list")
    public ResponseEntity<List<Admin>> getAllAdmins() {
        return ResponseEntity.ok(adminService.getAllAdmins());
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
     * POST /api/admin/add
     * เพิ่ม Admin ใหม่
     * Body: { "username": "6414421234", "displayName": "นายทดสอบ", "createdBy": "admin" }
     */
    @PostMapping("/add")
    public ResponseEntity<?> addAdmin(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String displayName = request.get("displayName");
            String createdBy = request.get("createdBy");

            if (username == null || username.isEmpty()) {
                return ResponseEntity.badRequest().body("Username is required");
            }

            Admin admin = adminService.addAdmin(username, displayName, createdBy);
            return ResponseEntity.status(HttpStatus.CREATED).body(admin);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * DELETE /api/admin/remove/{username}
     * ปิดการใช้งาน Admin (soft delete)
     */
    @DeleteMapping("/remove/{username}")
    public ResponseEntity<?> removeAdmin(@PathVariable String username) {
        try {
            adminService.deactivateAdmin(username);
            return ResponseEntity.ok(Map.of("message", "Admin deactivated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PUT /api/admin/activate/{username}
     * เปิดใช้งาน Admin อีกครั้ง
     */
    @PutMapping("/activate/{username}")
    public ResponseEntity<?> activateAdmin(@PathVariable String username) {
        try {
            adminService.activateAdmin(username);
            return ResponseEntity.ok(Map.of("message", "Admin activated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}