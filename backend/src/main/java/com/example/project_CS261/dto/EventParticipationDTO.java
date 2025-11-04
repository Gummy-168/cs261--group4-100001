package com.example.project_CS261.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventParticipationDTO {
    private Long userId;
    private String status; // "interested" or "going"
}