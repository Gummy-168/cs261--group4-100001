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
    
    @Column(name = "user_id")
    private Long userId; // ไม่บังคับ (NULL ได้)
    
    @Column(nullable = false, length = 50)
    private String username;
    
    @CreationTimestamp
    @Column(name = "login_time")
    private LocalDateTime loginTime;
    
    @Column(name = "ip_address", length = 50)
    private String ipAddress;
    
    @Column(length = 20)
    private String status = "SUCCESS";
}
