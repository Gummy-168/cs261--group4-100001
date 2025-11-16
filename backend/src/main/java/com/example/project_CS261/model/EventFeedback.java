package com.example.project_CS261.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "event_feedbacks",
        uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "username"}))
public class EventFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(columnDefinition = "NVARCHAR(2000)")
    private String comment;

    @Min(value = 1, message = "คะแนนต้องมากกว่าหรือเท่ากับ 1")
    @Max(value = 5, message = "คะแนนต้องน้อยกว่าหรือเท่ากับ 5")
    @Column
    private Integer rating; // 1-5 ดาว (⭐⭐⭐⭐⭐)

    @Column(name = "is_edited")
    private Boolean isEdited = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}