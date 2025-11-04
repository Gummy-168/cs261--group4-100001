package com.example.project_CS261.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class NotificationDTO {

    private Long eventId;
    private String title;
    private String message; // ข้อความที่จะแสดงใน UI (เช่น "อีก 2 วัน")
    private LocalDateTime startTime;

}