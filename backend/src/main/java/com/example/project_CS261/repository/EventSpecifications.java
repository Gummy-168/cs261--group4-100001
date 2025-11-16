package com.example.project_CS261.repository;

import com.example.project_CS261.model.Event;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class EventSpecifications {

    public static Specification<Event> findByCriteria(
            String keyword, String category, String location, String organizer,
            LocalDateTime startTime, LocalDateTime endTime) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Status ต้องเป็น OPEN เสมอ
            predicates.add(cb.equal(root.get("status"), "OPEN"));

            // Keyword (ค้นหาจาก title หรือ description)
            if (keyword != null && !keyword.isEmpty()) {
                String likePattern = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), likePattern),
                        cb.like(cb.lower(root.get("description")), likePattern)
                ));
            }

            // Category
            if (category != null && !category.isEmpty()) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            // Location
            if (location != null && !location.isEmpty()) {
                predicates.add(cb.equal(root.get("location"), location));
            }

            // Organizer
            if (organizer != null && !organizer.isEmpty()) {
                predicates.add(cb.equal(root.get("organizer"), organizer));
            }

            // StartTime (กิจกรรมที่เริ่ม *หลัง* หรือ *เท่ากับ* วันที่ระบุ)
            if (startTime != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("startTime"), startTime));
            }

            // EndTime (กิจกรรมที่จบ *ก่อน* หรือ *เท่ากับ* วันที่ระบุ)
            if (endTime != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("endTime"), endTime));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}