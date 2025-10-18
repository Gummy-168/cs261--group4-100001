package com.example.project_CS261.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Events", schema = "dbo")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    @Column(nullable = false, length = 255)
    private String title;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(length = 1000)
    private String description;

    private String location;

    @NotNull(message = "Start time is required")
    @Column(name = "startTime")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Column(name = "endTime")
    private LocalDateTime endTime;

    // รูปภาพกิจกรรม (เก็บเป็น URL หรือ path)
    @Column(name = "imageUrl", length = 500)
    private String imageUrl;

    // หมวดหมู่กิจกรรม (เช่น "กีฬา", "ศิลปะ", "วิชาการ", "กิจกรรมพิเศษ")
    @Column(length = 100)
    private String category;

    // จำนวนผู้เข้าร่วมสูงสุด
    @Min(value = 1, message = "Capacity must be at least 1")
    @Column(name = "maxCapacity")
    private Integer maxCapacity;

    // จำนวนผู้ที่ลงทะเบียนแล้ว
    @Column(name = "currentParticipants")
    private Integer currentParticipants = 0;

    // สถานะกิจกรรม (OPEN, FULL, CLOSED, CANCELLED)
    @Column(length = 20)
    private String status = "OPEN";

    // ชื่อผู้จัดกิจกรรม/หน่วยงาน
    @Column(name = "organizer", length = 255)
    private String organizer;

    // ค่าใช้จ่าย (0 = ฟรี)
    @Column(name = "fee")
    private Double fee = 0.0;

    // Tags สำหรับการค้นหา (เก็บเป็น JSON หรือ comma-separated)
    @Column(length = 500)
    private String tags;
}