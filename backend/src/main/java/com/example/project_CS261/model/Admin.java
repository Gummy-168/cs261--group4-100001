package com.example.project_CS261.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
<<<<<<< HEAD
 * Admin Entity - เก็บรายชื่อ username ที่เป็น Admin
 * Admin ต้อง login ผ่าน TU API เหมือนกัน แต่จะมีสิทธิ์พิเศษ
=======
 * Admin Entity - รองรับทั้ง username (TU API) และ email/password login
>>>>>>> be/AdminFeedbackControl
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "admins")
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username; // รหัสนักศึกษา/บุคลากรที่เป็น Admin

    @Column(length = 255,columnDefinition = "NVARCHAR(1000)")
    private String displayName; // ชื่อ Admin

    // NEW FIELDS (สำหรับ email/password login)
    @Column(length = 255)
    private String email;

    @Column(length = 255)
    private String password;

    @Column(length = 100)
    private String role = "ADMIN"; // บทบาท (เผื่อมี SUPER_ADMIN ในอนาคต)

    @Column(length = 100)
    private String faculty; // คณะที่ดูแล

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    // Helper method
    public void clearPassword() {
        this.password = null;
    }
}