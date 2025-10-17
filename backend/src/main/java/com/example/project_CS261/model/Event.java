package com.example.project_CS261.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Event {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Nationalized
    @Column(nullable = false, length = 200)
    private String title;

    @Nationalized
    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false)
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Nationalized
    @Column(nullable = false, length = 300)
    private String location;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private Integer reserved;

    @Nationalized
    @Column(nullable = false, length = 100)
    private String category;

    @Nationalized
    @Column(nullable = false, length = 150)
    private String organizerUnit;

    @Nationalized
    @Column(nullable = false, length = 120)
    private String organizerName;

    @Nationalized
    @Column(nullable = false, length = 120)
    private String organizerContact;

    @Column(nullable = false, length = 500)
    private String posterUrl;

    @Column(length = 500)
    private String registerUrl;

    @Column(nullable = false)
    private boolean edited;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // <<< MERGED: Helper methods จาก U2
    @Transient
    public int getRemaining() {
        int left = (capacity == null ? 0 : capacity) - (reserved == null ? 0 : reserved);
        return Math.max(left, 0);
    }

    @Transient
    public boolean isFull() {
        return getRemaining() <= 0;
    }
}