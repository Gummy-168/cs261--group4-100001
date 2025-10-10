//เป็นชั้นกลางที่ทำหน้าที่ ประมวลผล logic ของแอปพลิเคชัน ก่อนส่งไปยัง Repository หรือส่งกลับไปยัง Controller
//พูดง่าย ๆ: Controller ไม่ไปยุ่งกับ Repository โดยตรง แต่สั่งงานผ่าน Service เพื่อแยกความรับผิดชอบ (Separation of Concerns)

package com.example.project_CS261.service;

import com.example.project_CS261.model.Event;
import com.example.project_CS261.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.data.jpa.domain.Specification; // Import เพิ่ม
import java.time.LocalDate;
import java.time.LocalDateTime; // Import เพิ่ม
import java.util.ArrayList; // Import เพิ่ม
import java.util.List;
import jakarta.persistence.criteria.Predicate; // Import เพิ่ม


@Service
public class EventService {
    private final EventRepository repo;

    public EventService(EventRepository repo) {
        this.repo = repo;
    }

    public List<Event> getAll() {
        return repo.findAll();
    }

    public Event getOne(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + id));
    }

    public Event create(Event e) {
        return repo.save(e);
    }

    public Event update(Long id, Event e) {
        Event existed = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + id));

        existed.setTitle(e.getTitle());
        existed.setDescription(e.getDescription());
        existed.setLocation(e.getLocation());
        existed.setStartTime(e.getStartTime());
        existed.setEndTime(e.getEndTime());

        return repo.save(existed);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Event not found: " + id);
        }
        repo.deleteById(id);
    }

    // ===== Method search ที่เราจะมาแก้ไขกัน =====
    public List<Event> search(String keyword, String category, String location, LocalDate startDate, LocalDate endDate) {

        // เราใช้ Specification ในการสร้าง Query แบบ Dynamic
        Specification<Event> spec = (root, query, criteriaBuilder) -> {

            List<Predicate> predicates = new ArrayList<>();

            // 1. เงื่อนไขสำหรับ Keyword (ค้นหาจาก title และ description)
            if (keyword != null && !keyword.isEmpty()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                Predicate titleLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), pattern);
                Predicate descriptionLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), pattern);
                predicates.add(criteriaBuilder.or(titleLike, descriptionLike));
            }

            // 2. เงื่อนไขสำหรับ Category
            if (category != null && !category.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("category"), category));
            }

            // 3. เงื่อนไขสำหรับ Location (สมมติว่า Location เก็บชื่อสถานที่ตรงๆ)
            if (location != null && !location.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("location"), location));
            }

            // 4. เงื่อนไขสำหรับช่วงเวลา (Date Range)
            if (startDate != null) {
                LocalDateTime startOfDay = startDate.atStartOfDay();
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("startTime"), startOfDay));
            }
            if (endDate != null) {
                LocalDateTime endOfDay = endDate.atTime(23, 59, 59);
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("startTime"), endOfDay));
            }

            // นำเงื่อนไขทั้งหมดมาเชื่อมกันด้วย AND
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        return repo.findAll(spec);
    }
}