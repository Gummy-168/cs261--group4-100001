package com.example.project_CS261.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Admin Entity - เก็บรายชื่อ username ที่เป็น Admin
 * Admin ต้อง login ผ่าน TU API เหมือนกัน แต่จะมีสิทธิ์พิเศษ
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

    @Column(length = 100)
    private String role = "ADMIN"; // บทบาท (เผื่อมี SUPER_ADMIN ในอนาคต)

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", length = 50)
    private String createdBy; // ใครเพิ่ม Admin คนนี้

    @Column(name = "is_active")
    private Boolean isActive = true; // สามารถปิดการใช้งาน Admin ได้
}