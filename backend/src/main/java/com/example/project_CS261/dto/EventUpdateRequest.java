package com.example.project_CS261.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EventUpdateRequest {
    public LocalDateTime startTime;
    public LocalDateTime endTime;
    public String location;
    public Integer capacity;
    public Integer reserved;
    public String posterUrl;
    public String registerUrl;
    private String imageurl;
}
