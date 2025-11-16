package com.example.project_CS261.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO สำหรับส่งข้อมูล Event ไปยัง Frontend
 * รวมข้อมูลที่จำเป็นสำหรับแสดงใน Card
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventCardDTO {
    
    private Long id;
    private String title;
    private String description;
    private String location;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    // ข้อมูลเพิ่มเติมสำหรับ Card
    private String imageUrl;
    private String category;
    private Integer maxCapacity;
    private Integer currentParticipants;
    private String status;
    private String organizer;
    private Double fee;
    private String tags;
    
    // ข้อมูลที่คำนวณเพิ่มเติม
    private Boolean isFull; // เช็คว่าเต็มหรือยัง
    private Integer availableSeats; // จำนวนที่นั่งว่าง
    private Boolean isFavorited; // เช็คว่า user favorite หรือยัง (ถ้าส่ง userId มา)

    /**
     * Constructor สำหรับสร้างจาก Event Entity
     */
    public EventCardDTO(com.example.project_CS261.model.Event event) {
        this.id = event.getId();
        this.title = event.getTitle();
        this.description = event.getDescription();
        this.location = event.getLocation();
        this.startTime = event.getStartTime();
        this.endTime = event.getEndTime();
        this.imageUrl = event.getImageUrl();
        this.category = event.getCategory();
        this.maxCapacity = event.getMaxCapacity();
        this.currentParticipants = event.getCurrentParticipants();
        this.status = event.getStatus();
        this.organizer = event.getOrganizer();
        this.fee = event.getFee();
        this.tags = event.getTags();

        // คำนวณข้อมูลเพิ่มเติม
        if (this.maxCapacity != null && this.currentParticipants != null) {
            this.availableSeats = this.maxCapacity - this.currentParticipants;
            this.isFull = this.currentParticipants >= this.maxCapacity;
        } else {
            this.availableSeats = null;
            this.isFull = false;
        }
        
        this.isFavorited = false; // ต้องเช็คจาก database ทีหลัง
    }
}
