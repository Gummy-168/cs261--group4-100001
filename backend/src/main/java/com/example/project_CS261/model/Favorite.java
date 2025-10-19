package com.example.project_CS261.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "favorites",
       uniqueConstraints = @UniqueConstraint(columnNames = {"userId", "eventId"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Favorite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;
    
    @Column(nullable = false)
    private Long eventId;  // Changed from activityId to eventId
}
