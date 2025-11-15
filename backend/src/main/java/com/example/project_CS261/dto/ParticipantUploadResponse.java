package com.example.project_CS261.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantUploadResponse {
    private Integer totalRows;
    private Integer successCount;
    private Integer failedCount;
    private List<String> failedUsernames;
    private String message;
}