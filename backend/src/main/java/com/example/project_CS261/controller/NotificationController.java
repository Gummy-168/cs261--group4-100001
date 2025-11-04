package com.example.project_CS261.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.example.project_CS261.dto.NotificationDTO;
import com.example.project_CS261.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "API for In-App Notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * FR-8: ดึงข้อมูลแจ้งเตือน (ที่ยังไม่หมดอายุ) สำหรับแสดงในไอคอนกระดิ่ง
     * (ต้องใช้ Token)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsForUser(@PathVariable Long userId) {
        // ต้องไปเขียน Logic เพิ่มใน NotificationService
        // เพื่อดึงข้อมูลจากตาราง notification_queue
        List<NotificationDTO> notifications = notificationService.getInAppNotifications(userId);
        return ResponseEntity.ok(notifications);
    }
}