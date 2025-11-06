package com.example.project_CS261.service;

import com.example.project_CS261.model.Admin;
import com.example.project_CS261.repository.AdminRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final AdminRepository adminRepository;

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    /**
     * เช็คว่า username เป็น Admin หรือไม่
     */
    public boolean isAdmin(String username) {
        return adminRepository.existsByUsernameAndIsActiveTrue(username);
    }

    /**
     * เพิ่ม Admin ใหม่
     */
    public Admin addAdmin(String username, String displayName, String createdBy) {
        // เช็คว่ามี Admin นี้แล้วหรือยัง
        if (adminRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Admin already exists: " + username);
        }

        Admin admin = new Admin();
        admin.setUsername(username);
        admin.setDisplayName(displayName);
        admin.setRole("ADMIN");
        admin.setCreatedBy(createdBy);
        admin.setIsActive(true);

        return adminRepository.save(admin);
    }

    /**
     * ดึงรายชื่อ Admin ทั้งหมด
     */
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    /**
     * ดึงรายชื่อ Admin ที่ active
     */
    public List<Admin> getActiveAdmins() {
        return adminRepository.findByIsActiveTrue();
    }

    /**
     * ลบ Admin (soft delete - ตั้ง isActive = false)
     */
    public void deactivateAdmin(String username) {
        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found: " + username));

        admin.setIsActive(false);
        adminRepository.save(admin);
    }

    /**
     * เปิดใช้งาน Admin อีกครั้ง
     */
    public void activateAdmin(String username) {
        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found: " + username));

        admin.setIsActive(true);
        adminRepository.save(admin);
    }
}