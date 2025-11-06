package com.example.project_CS261.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantResponse {
    private Long id;
    private Long eventId;
    private String username;
    private String studentName;
    private String email;
    private LocalDateTime approvedAt;
    private String approvedBy;
}