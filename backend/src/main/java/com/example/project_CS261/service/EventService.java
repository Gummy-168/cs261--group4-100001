//เป็นชั้นกลางที่ทำหน้าที่ ประมวลผล logic ของแอปพลิเคชัน ก่อนส่งไปยัง Repository หรือส่งกลับไปยัง Controller
//พูดง่าย ๆ: Controller ไม่ไปยุ่งกับ Repository โดยตรง แต่สั่งงานผ่าน Service เพื่อแยกความรับผิดชอบ (Separation of Concerns)

package com.example.project_CS261.service;

import com.example.project_CS261.dto.EventCardDTO;
import com.example.project_CS261.exception.ResourceNotFoundException;
import com.example.project_CS261.model.Event;
import com.example.project_CS261.model.Favorite;
import com.example.project_CS261.repository.EventRepository;
import com.example.project_CS261.repository.FavoriteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.LocalTime;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;

@Service
public class EventService {
    
    private static final Logger logger = LoggerFactory.getLogger(EventService.class);
    
    private final EventRepository repo;
    private final FavoriteRepository favoriteRepository;

    public EventService(EventRepository repo, FavoriteRepository favoriteRepository) {
        this.repo = repo;
        this.favoriteRepository = favoriteRepository;
    }

    public List<Event> getAll() {
        return repo.findAll();
    }

    /**
     * ดึงข้อมูล Events ทั้งหมดในรูปแบบ Card DTO
     * สำหรับแสดงใน Frontend
     */
    public List<EventCardDTO> getAllCards() {
        return repo.findAll().stream()
                .map(EventCardDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * ดึงข้อมูล Events ทั้งหมดในรูปแบบ Card DTO พร้อมเช็ค Favorite
     * @param userId - ID ของ user เพื่อเช็คว่า favorite หรือยัง
     */
    public List<EventCardDTO> getAllCardsForUser(Long userId) {
        List<Event> events = repo.findAll();
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        
        return events.stream()
                .map(event -> {
                    EventCardDTO dto = new EventCardDTO(event);
                    // เช็คว่า user favorite กิจกรรมนี้หรือยัง
                    boolean isFavorited = favorites.stream()
                            .anyMatch(fav -> fav.getEventId().equals(event.getId()));
                    dto.setIsFavorited(isFavorited);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public Event getOne(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
    }

    public Event create(Event e) {
        logger.info("Creating new event: {}", e.getTitle());
        Event saved = repo.save(e);
        logger.info("Event created with ID: {}", saved.getId());
        return saved;
    }

    public Event update(Long id, Event e) {
        logger.info("Updating event with ID: {}", id);
        Event existed = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        existed.setTitle(e.getTitle());
        existed.setDescription(e.getDescription());
        existed.setLocation(e.getLocation());
        existed.setStartTime(e.getStartTime());
        existed.setEndTime(e.getEndTime());

        Event updated = repo.save(existed);
        logger.info("Event updated successfully: {}", id);
        return updated;
    }

    public void delete(Long id) {
        logger.info("Deleting event with ID: {}", id);
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Event not found with id: " + id);
        }
        repo.deleteById(id);
        logger.info("Event deleted successfully: {}", id);
    }

    public List<Event> search(String keyword, String category, String location, String organizer, LocalDate startTime, LocalDate endTime, String sortBy) {

        Specification<Event> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.isEmpty()) {
                Predicate titleLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), "%" + keyword.toLowerCase() + "%");
                Predicate descriptionLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), "%" + keyword.toLowerCase() + "%");
                predicates.add(criteriaBuilder.or(titleLike, descriptionLike));
            }

            if (category != null && !category.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("category"), category));
            }

            if (location != null && !location.isEmpty()) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("location")), location.toLowerCase()));
            }

            if (organizer != null && !organizer.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("organizer"), organizer));
            }

            if (startTime != null && endTime != null) {
                // ค้นหากิจกรรมที่ *คาบเกี่ยว* กับช่วงเวลาที่เลือก
                Predicate overlapStart = criteriaBuilder.lessThanOrEqualTo(root.get("startTime"), endTime.atTime(LocalTime.MAX));
                Predicate overlapEnd = criteriaBuilder.greaterThanOrEqualTo(root.get("endTime"), startTime.atStartOfDay());
                predicates.add(criteriaBuilder.and(overlapStart, overlapEnd));

            } else if (startTime != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("endTime"), startTime.atStartOfDay()));

            } else if (endTime != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("startTime"), endTime.atTime(LocalTime.MAX)));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };


        // เรียงลำดับ
        Sort sort = switch (sortBy) {
            case "featured" -> // "เรื่องเด่น"  คือมีคนเข้าร่วมเยอะสุด
                    Sort.by(Sort.Direction.DESC, "currentParticipants");
            case "newest" -> // "กิจกรรมใหม่"  กิจกรรมที่กำลังจะเริ่มเร็วๆ นี้ (เอา DESC เพื่อให้วันที่ล่าสุดขึ้นก่อน)
                    Sort.by(Sort.Direction.DESC, "startTime");
            case "closingSoon" -> // "ใกล้ปิดรับสมัคร"  กิจกรรมที่กำลังจะจบ (endTime) เร็วที่สุด
                    Sort.by(Sort.Direction.ASC, "endTime"); // "เรียงลำดับ" (ค่าเริ่มต้น)
            default ->
                // ค่าเริ่มต้น เราเรียงตามวันที่เริ่มกิจกรรม (ASC คือเก่าไปใหม่)
                    Sort.by(Sort.Direction.ASC, "startTime");
        };

        // ส่ง Specification ไปให้ Repository ค้นหา
        return repo.findAll(spec, sort);
    }
}