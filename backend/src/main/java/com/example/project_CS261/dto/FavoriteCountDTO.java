package com.example.project_CS261.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class FavoriteCountDTO {
    private Long activityId;
    private long count;
}