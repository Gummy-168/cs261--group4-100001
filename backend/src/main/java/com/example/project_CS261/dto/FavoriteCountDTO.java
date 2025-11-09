package com.example.project_CS261.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
// Notice this class name matches this file name
public class FavoriteCountDTO {
    private long eventId;
    private long count;
}