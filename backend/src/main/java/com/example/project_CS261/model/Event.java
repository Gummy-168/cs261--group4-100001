package com.example.project_CS261.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import org.hibernate.annotations.Nationalized;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Events", schema = "dbo")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Nationalized // ใช้อันนี้ตัวเดียวพอ
    @Column(nullable = false, length = 255)
    private String title;

    @Nationalized // ใช้อันนี้ตัวเดียวพอ
    @Column(length = 1000)
    private String description;

    @Nationalized // ใช้อันนี้ตัวเดียวพอ
    private String location;

    @Nationalized // ใช้อันนี้ตัวเดียวพอ
    private String category;

    @Column(name = "startTime")
    private LocalDateTime startTime;

    @Column(name = "endTime")
    private LocalDateTime endTime;
}