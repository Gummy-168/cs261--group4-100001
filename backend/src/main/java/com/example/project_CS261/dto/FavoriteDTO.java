package com.example.project_CS261.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
// Notice the class name matches the file name
public class FavoriteDTO {
    private Long userId;
    private Long eventId;
}