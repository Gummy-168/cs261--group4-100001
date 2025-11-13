package com.example.project_CS261.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "NVARCHAR(200)")
    private String title;

    @Column(columnDefinition = "NVARCHAR(2000)")
    private String description;

    @Column(columnDefinition = "NVARCHAR(300)")
    private String location;

    @Column(name = "startTime", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "endTime")
    private LocalDateTime endTime;

    @Column(columnDefinition = "NVARCHAR(100)")
    private String category;

    @Column(columnDefinition = "NVARCHAR(200)")
    private String organizer;

    @Column(name = "maxCapacity")
    private Integer maxCapacity;

    @Column(name = "currentParticipants")
    private Integer currentParticipants = 0;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String status = "OPEN";

    @Column
    private Double fee = 0.0;

    @Column(columnDefinition = "NVARCHAR(500)")
    private String imageUrl;

    @Column(name = "created_by_admin", columnDefinition = "NVARCHAR(200)")
    private String createdByAdmin;

    @Column(name = "created_by_faculty", columnDefinition = "NVARCHAR(200)")
    private String createdByFaculty;

    // Tags สำหรับการค้นหา (เก็บเป็น JSON หรือ comma-separated)
    @Column(columnDefinition = "NVARCHAR(500)")
    private String tags;

    // ✨ เพิ่มฟิลด์ isPublic เพื่อควบคุมการแสดงกิจกรรม
    @Column(name = "isPublic")
    private Boolean isPublic = false;

    // Default constructor
    public Event() {}

    // Constructor with basic fields
    public Event(String title, String description, String location, LocalDateTime startTime) {
        this.title = title;
        this.description = description;
        this.location = location;
        this.startTime = startTime;
        this.isPublic = false; // Default เป็น Draft
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getOrganizer() {
        return organizer;
    }

    public void setOrganizer(String organizer) {
        this.organizer = organizer;
    }

    public Integer getMaxCapacity() {
        return maxCapacity;
    }

    public void setMaxCapacity(Integer maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public Integer getCurrentParticipants() {
        return currentParticipants;
    }

    public void setCurrentParticipants(Integer currentParticipants) {
        this.currentParticipants = currentParticipants;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getFee() {
        return fee;
    }

    public void setFee(Double fee) {
        this.fee = fee;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getCreatedByAdmin() {
        return createdByAdmin;
    }

    public void setCreatedByAdmin(String createdByAdmin) {
        this.createdByAdmin = createdByAdmin;
    }

    public String getCreatedByFaculty() {
        return createdByFaculty;
    }

    public void setCreatedByFaculty(String createdByFaculty) {
        this.createdByFaculty = createdByFaculty;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    // ✨ Getter และ Setter สำหรับ isPublic
    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    // Alternative getters สำหรับ boolean (Spring Boot อาจต้องการ)
    public Boolean isPublic() {
        return isPublic;
    }

    @Override
    public String toString() {
        return "Event{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", location='" + location + '\'' +
                ", startTime=" + startTime +
                ", category='" + category + '\'' +
                ", isPublic=" + isPublic +
                '}';
    }
}