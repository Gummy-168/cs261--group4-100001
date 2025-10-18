package com.example.project_CS261.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username; // รหัสนักศึกษา/บุคลากร จาก TU API

    @Column(nullable = false, name = "displayname_th")
    private String displaynameTh; // ชื่อภาษาไทย

    private String email; // อีเมล์จาก TU API

    private String faculty; // คณะ

    private String department; // สาขา/หน่วยงาน

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ไม่เก็บ password เพราะใช้ TU API ตรวจสอบทุกครั้ง
}
