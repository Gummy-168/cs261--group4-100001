package com.example.project_CS261.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @Builder
@AllArgsConstructor @NoArgsConstructor
public class EventDetailResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private String location;
    private int capacity;
    private int remaining;
    private boolean full;
    private String organizerName;
    private String organizerContact;
    private String posterUrl;
    private String category;
    private String organizerUnit;
    private String registerUrl;
    private boolean edited;           // FR-10 show “(มีการแก้ไข…)”
    private String interestedPlaceholder; // FR-8
    private String reviewPlaceholder;     // FR-12
}
