package com.example.project_CS261.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Admin Entity - รองรับทั้ง username (TU API) และ email/password login
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

    // OLD FIELDS (รองรับระบบเดิม)
    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(length = 255, columnDefinition = "NVARCHAR(1000)")
    private String displayName;

    // NEW FIELDS (สำหรับ email/password login)
    @Column(length = 255)
    private String email;

    @Column(length = 255)
    private String password;

    // COMMON FIELDS
    @Column(length = 100)
    private String role = "ADMIN";

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