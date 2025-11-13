package com.example.project_CS261.repository;

import com.example.project_CS261.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {

    // ✨ เพิ่ม method สำหรับหากิจกรรม Public เท่านั้น
    List<Event> findByIsPublicTrue();

    // ✨ เพิ่ม method สำหรับหากิจกรรม Public ที่ยังไม่หมดอายุ
    @Query("SELECT e FROM Event e WHERE e.isPublic = true AND e.startTime >= :currentTime ORDER BY e.startTime ASC")
    List<Event> findActivePublicEvents(@Param("currentTime") LocalDateTime currentTime);

    // ✨ เพิ่ม method สำหรับหากิจกรรมตาม status และ isPublic
    List<Event> findByStatusAndIsPublicTrue(String status);

    // ✨ เพิ่ม method สำหรับหากิจกรรมตาม category และ isPublic
    List<Event> findByCategoryAndIsPublicTrueOrderByStartTimeAsc(String category);

    // คงเก็บ methods เดิมไว้
    List<Event> findByTitleContainingIgnoreCase(String title);

    List<Event> findByCategoryIgnoreCase(String category);

    List<Event> findByLocationContainingIgnoreCase(String location);

    @Query("SELECT e FROM Event e WHERE e.startTime BETWEEN :startDate AND :endDate ORDER BY e.startTime ASC")
    List<Event> findEventsByDateRange(@Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate);

    @Query("SELECT e FROM Event e WHERE e.title LIKE %:keyword% OR e.description LIKE %:keyword% OR e.location LIKE %:keyword%")
    List<Event> findByKeyword(@Param("keyword") String keyword);

    @Query("SELECT DISTINCT e.category FROM Event e WHERE e.category IS NOT NULL AND e.isPublic = true")
    List<String> findAllPublicCategories();

    @Query("SELECT COUNT(e) FROM Event e WHERE e.createdByAdmin = :adminEmail")
    Long countEventsByAdmin(@Param("adminEmail") String adminEmail);

    // เพิ่ม method สำหรับ search ใน public events เท่านั้น
    @Query("SELECT e FROM Event e WHERE e.isPublic = true AND (e.title LIKE %:keyword% OR e.description LIKE %:keyword% OR e.location LIKE %:keyword%) ORDER BY e.startTime ASC")
    List<Event> findPublicEventsByKeyword(@Param("keyword") String keyword);

    // เพิ่ม method สำหรับหาอีเวนต์ที่ user เข้าร่วม และเป็น public
    @Query(value = "SELECT e.* FROM events e " +
            "JOIN event_participants ep ON e.id = ep.event_id " +
            "WHERE ep.user_id = :userId AND e.isPublic = 1 " +
            "ORDER BY e.startTime ASC", nativeQuery = true)
    List<Event> findPublicEventsByUserId(@Param("userId") String userId);

    // ✨ เพิ่ม method สำหรับหากิจกรรมตาม Faculty (สำหรับ Admin ของแต่ละคณะ)
    List<Event> findByCreatedByFaculty(String faculty);

    // ✨ เพิ่ม method สำหรับหากิจกรรม Public ของคณะ
    List<Event> findByCreatedByFacultyAndIsPublicTrue(String faculty);

    // ✨ เพิ่ม method สำหรับหากิจกรรมทั้งหมดของ Admin คนนั้น
    List<Event> findByCreatedByAdmin(String adminEmail);
}