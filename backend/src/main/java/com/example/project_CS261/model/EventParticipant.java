package com.example.project_CS261.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "event_participants",
        uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "username"}))
public class EventParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(name = "student_name", length = 255)
    private String studentName;

    @Column(length = 255)
    private String email;

    @CreationTimestamp
    @Column(name = "approved_at", updatable = false)
    private LocalDateTime approvedAt;

    @Column(name = "approved_by", length = 50)
    private String approvedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}