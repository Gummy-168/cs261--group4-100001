package com.example.project_CS261.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantRequest {
    private String username;
    private String studentName;
    private String email;
}