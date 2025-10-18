package com.example.project_CS261.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "login_history")
public class LoginHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // เราจะใช้ตัวนี้เป็นตัวแทนของ user_id เพียงตัวเดียว
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") // บอกว่าให้เชื่อมกับคอลัมน์ user_id ในตารางนี้
    private User user;
    
    @Column(nullable = false, length = 50)
    private String username;

    @Column(name = "logout_time") // จับคู่กับคอลัมน์ logout_time
    private LocalDateTime logoutTime; // ชนิดข้อมูลสำหรับเก็บวัน-เวลา
    
    @CreationTimestamp
    @Column(name = "login_time")
    private LocalDateTime loginTime;
    
    @Column(name = "ip_address", length = 50)
    private String ipAddress;
    
    @Column(length = 20)
    private String status = "SUCCESS";
}
