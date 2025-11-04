package com.example.project_CS261.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "event_participation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventParticipation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long eventId;
    private Long userId;
    private String status;
}