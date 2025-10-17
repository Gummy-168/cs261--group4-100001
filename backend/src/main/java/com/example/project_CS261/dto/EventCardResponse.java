package com.example.project_CS261.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @Builder
@AllArgsConstructor @NoArgsConstructor
public class EventCardResponse {
    private Long id;
    private String title;
    private LocalDateTime startAt;
    private String category;
    private String organizerUnit;
    private String posterUrl;
    private boolean full;
    private int remaining;
}
