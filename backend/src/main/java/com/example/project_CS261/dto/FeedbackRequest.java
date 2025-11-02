package com.example.project_CS261.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackRequest {

    @NotBlank(message = "กรุณาใส่ความคิดเห็น")
    private String comment;

    @Min(value = 1, message = "คะแนนต้องมากกว่าหรือเท่ากับ 1 ดาว")
    @Max(value = 5, message = "คะแนนต้องน้อยกว่าหรือเท่ากับ 5 ดาว")
    private Integer rating; // 1-5 ดาว (optional)
}