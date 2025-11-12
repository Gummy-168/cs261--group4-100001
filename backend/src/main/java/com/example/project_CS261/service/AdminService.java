package com.example.project_CS261.service;

import com.example.project_CS261.model.Admin;
import com.example.project_CS261.repository.AdminRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // ==================== OLD METHODS (รองรับระบบเดิม) ====================

    /**
     * เช็คว่า username เป็น Admin หรือไม่ (ระบบเดิม)
     */
    public boolean isAdmin(String identifier) {
        // Try username first (old system)
        if (adminRepository.existsByUsernameAndIsActiveTrue(identifier)) {
            return true;
        }
        // Try email (new system)
        if (adminRepository.existsByEmailAndIsActiveTrue(identifier)) {
            return true;
        }
        return false;
    }

    /**
     * เพิ่ม Admin ใหม่ (ระบบเดิม - ใช้ username)
     */
    public Admin addAdmin(String username, String displayName, String createdBy) {
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
        List<Admin> admins = adminRepository.findAll();
        admins.forEach(Admin::clearPassword);
        return admins;
    }

    /**
     * ดึงรายชื่อ Admin ที่ active
     */
    public List<Admin> getActiveAdmins() {
        List<Admin> admins = adminRepository.findByIsActiveTrue();
        admins.forEach(Admin::clearPassword);
        return admins;
    }

    /**
     * ลบ Admin (soft delete - ตั้ง isActive = false)
     */
    public void deactivateAdmin(String usernameOrEmail) {
        Admin admin = findAdminByUsernameOrEmail(usernameOrEmail);
        admin.setIsActive(false);
        adminRepository.save(admin);
    }

    /**
     * เปิดใช้งาน Admin อีกครั้ง
     */
    public void activateAdmin(String usernameOrEmail) {
        Admin admin = findAdminByUsernameOrEmail(usernameOrEmail);
        admin.setIsActive(true);
        adminRepository.save(admin);
    }

    // ==================== NEW METHODS (ระบบใหม่ - Email/Password) ====================

    /**
     * สร้าง Admin ใหม่ด้วย email/password
     */
    public Admin createAdmin(String email, String password, String displayName, String createdBy) {
        if (adminRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists: " + email);
        }

        Admin admin = new Admin();
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setDisplayName(displayName);
        admin.setRole("ADMIN");
        admin.setIsActive(true);
        admin.setCreatedBy(createdBy);

        // Generate username from email if not provided
        admin.setUsername(email.split("@")[0]);

        return adminRepository.save(admin);
    }

    /**
     * Login สำหรับ Admin ด้วย email/password
     */
    public Admin login(String email, String password) {
        Optional<Admin> adminOpt = adminRepository.findByEmailAndIsActiveTrue(email);

        if (adminOpt.isEmpty()) {
            return null;
        }

        Admin admin = adminOpt.get();

        // Check password - รองรับทั้ง plain text แลา BCrypt
        boolean passwordMatch = false;
        
        if (admin.getPassword() != null) {
            // ลอง plain text ก่อน
            if (admin.getPassword().equals(password)) {
                passwordMatch = true;
            }
            // ถ้าไม่ตรง ลอง BCrypt
            else if (admin.getPassword().startsWith("$2a$") && passwordEncoder.matches(password, admin.getPassword())) {
                passwordMatch = true;
            }
        }

        if (passwordMatch) {
            admin.setLastLogin(LocalDateTime.now());
            adminRepository.save(admin);
            admin.clearPassword();
            return admin;
        }

        return null;
    }

    /**
     * เปลี่ยน password
     */
    public void changePassword(String email, String oldPassword, String newPassword) {
        Admin admin = adminRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));

        if (admin.getPassword() == null || !passwordEncoder.matches(oldPassword, admin.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }

        admin.setPassword(passwordEncoder.encode(newPassword));
        adminRepository.save(admin);
    }

    /**
     * Reset password (สำหรับ Super Admin)
     */
    public void resetPassword(String email, String newPassword) {
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));

        admin.setPassword(passwordEncoder.encode(newPassword));
        adminRepository.save(admin);
    }

    /**
     * หา Admin จาก email
     */
    public Optional<Admin> getAdminByEmail(String email) {
        Optional<Admin> admin = adminRepository.findByEmail(email);
        admin.ifPresent(Admin::clearPassword);
        return admin;
    }

    /**
     * ลบ Admin (hard delete)
     */
    public void deleteAdmin(String usernameOrEmail) {
        Admin admin = findAdminByUsernameOrEmail(usernameOrEmail);
        adminRepository.delete(admin);
    }

    // ==================== HELPER METHODS ====================

    private Admin findAdminByUsernameOrEmail(String identifier) {
        // Try username first
        Optional<Admin> admin = adminRepository.findByUsername(identifier);
        if (admin.isPresent()) {
            return admin.get();
        }

        // Try email
        admin = adminRepository.findByEmail(identifier);
        if (admin.isPresent()) {
            return admin.get();
        }

        throw new IllegalArgumentException("Admin not found: " + identifier);
    }
}