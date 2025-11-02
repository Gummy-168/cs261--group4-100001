package com.example.project_CS261.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EventCreateRequest {
    public String title;
    public String description;
    public LocalDateTime startTime;
    public LocalDateTime endTime;
    public String location;
    public Integer capacity;
    public Integer reserved; // can be 0 on create
    public String category;
    public String organizerUnit;
    public String organizerName;
    public String organizerContact;
    public String posterUrl;     // jpg/png
    public String registerUrl;   // optional
}
