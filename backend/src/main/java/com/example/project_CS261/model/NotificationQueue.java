package com.example.project_CS261.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notification_queue")
public class NotificationQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long eventId;  // เปลี่ยนจาก activityId เป็น eventId

    @Column(nullable = false)
    private LocalDateTime sendAt; // เวลาที่ควรจะส่งการแจ้งเตือน

    @Column(nullable = false, length = 20)
    private String status = "PENDING"; // สถานะ: PENDING, SENT, FAILED
}