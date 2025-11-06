package com.example.project_CS261.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponse {
    private Long id;
    private Long eventId;
    private String username;
    private String studentName;
    private String comment;
    private Integer rating; // 1-5
    private String ratingStars; // ⭐⭐⭐⭐⭐
    private Boolean isEdited;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Helper method เพื่อแปลงคะแนนเป็นดาว
    public void setRating(Integer rating) {
        this.rating = rating;
        if (rating != null) {
            this.ratingStars = "⭐".repeat(rating);
        } else {
            this.ratingStars = "ไม่ได้ให้คะแนน";
        }
    }
}