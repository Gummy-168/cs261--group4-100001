//เป็นชั้นกลางที่ทำหน้าที่ ประมวลผล logic ของแอปพลิเคชัน ก่อนส่งไปยัง Repository หรือส่งกลับไปยัง Controller
//พูดง่าย ๆ: Controller ไม่ไปยุ่งกับ Repository โดยตรง แต่สั่งงานผ่าน Service เพื่อแยกความรับผิดชอบ (Separation of Concerns)

package com.example.project_CS261.service;

import com.example.project_CS261.dto.EventCardDTO;
import com.example.project_CS261.exception.ResourceNotFoundException;
import com.example.project_CS261.model.Event;
import com.example.project_CS261.model.Favorite;
import com.example.project_CS261.repository.EventRepository;
import com.example.project_CS261.repository.FavoriteRepository;
import com.example.project_CS261.repository.NotificationQueueRepository; // เพิ่ม
import com.example.project_CS261.repository.UserRepository; // เพิ่ม
import com.example.project_CS261.service.NotificationService; // เพิ่ม
import com.example.project_CS261.model.NotificationQueue; // เพิ่ม
import com.example.project_CS261.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

// ⭐️ [FIX 1] ADD IMPORT
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.LocalTime;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import com.example.project_CS261.repository.EventSpecifications;

@Service
public class EventService {

    private static final Logger logger = LoggerFactory.getLogger(EventService.class);

    private final EventRepository repo;
    private final FavoriteRepository favoriteRepository;

    private final NotificationService notificationService;
    private final NotificationQueueRepository notificationQueueRepository;
    private final UserRepository userRepository;

    // ⭐️ [FIX 2] ADD FIELD: ดึง Base URL (ถ้าไม่มีใน .properties, จะใช้ 8080 เป็นค่าเริ่มต้น)
    @Value("${server.base-url:http://localhost:8080}")
    private String baseUrl;

    public EventService(EventRepository repo, FavoriteRepository favoriteRepository,
                        NotificationService notificationService, NotificationQueueRepository notificationQueueRepository, UserRepository userRepository) {
        this.repo = repo;
        this.favoriteRepository = favoriteRepository;
        this.notificationService = notificationService; // เพิ่ม
        this.notificationQueueRepository = notificationQueueRepository; // เพิ่ม
        this.userRepository = userRepository; // เพิ่ม
    }

    public List<Event> getAll() {
        // ⭐️ [FIX 3] ADD CALL to helper
        return updateEventImageUrls(repo.findAll());
    }

    /**
     * ดึงข้อมูลเฉพาะ Events ที่เป็น Public เท่านั้น
     */
    public List<Event> getPublicEvents() {
        // ⭐️ [FIX 3] ADD CALL to helper
        return updateEventImageUrls(repo.findByIsPublicTrue());
    }

    /**
     * ดึงข้อมูล Events ที่เป็น Public ในรูปแบบ Card DTO
     * สำหรับแสดงใน Frontend (ฝั่ง User)
     */
    public List<EventCardDTO> getAllCards() {
        return repo.findByIsPublicTrue().stream()
                // ⭐️ [FIX 3] Use helper for DTO
                .map(this::toCardDTOWithAbsoluteUrl)
                .collect(Collectors.toList());
    }

    /**
     * ดึงข้อมูล Events ทั้งหมดในรูปแบบ Card DTO
     * สำหรับ Admin/Staff
     */
    public List<EventCardDTO> getAllCardsForAdmin() {
        return repo.findAll().stream()
                // ⭐️ [FIX 3] Use helper for DTO
                .map(this::toCardDTOWithAbsoluteUrl)
                .collect(Collectors.toList());
    }

    /**
     * ดึงข้อมูล Events ของคณะเฉพาะในรูปแบบ Card DTO
     * สำหรับ Admin/Staff ของคณะนั้น
     * @param faculty - ชื่อคณะ
     */
    public List<EventCardDTO> getAllCardsForAdminByFaculty(String faculty) {
        return repo.findByCreatedByFaculty(faculty).stream()
                // ⭐️ [FIX 3] Use helper for DTO
                .map(this::toCardDTOWithAbsoluteUrl)
                .collect(Collectors.toList());
    }

    /**
     * ดึงข้อมูล Events ของ Admin คนนั้นเฉพาะ
     * @param adminEmail - Email ของ Admin
     */
    public List<EventCardDTO> getAllCardsForAdminByEmail(String adminEmail) {
        return repo.findByCreatedByAdmin(adminEmail).stream()
                // ⭐️ [FIX 3] Use helper for DTO
                .map(this::toCardDTOWithAbsoluteUrl)
                .collect(Collectors.toList());
    }

    /**
     * ดึงข้อมูล Events ที่เป็น Public ในรูปแบบ Card DTO พร้อมเช็ค Favorite
     * @param userId - ID ของ user เพื่อเช็คว่า favorite หรือยัง
     */
    public List<EventCardDTO> getAllCardsForUser(Long userId) {
        List<Event> events = repo.findByIsPublicTrue();
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);

        return events.stream()
                .map(event -> {

                    updateEventImageUrl(event); // ⭐️ [FIX] ต้องเพิ่มบรรทัดนี้

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
        Event event = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        updateEventImageUrl(event); // ⭐️ [FIX] ต้องเพิ่มบรรทัดนี้

        return event;
    }

    public Event create(Event e) {
        logger.info("Creating new event: {}", e.getTitle());
        Event saved = repo.save(e);
        logger.info("Event created with ID: {}", saved.getId());
        updateEventImageUrl(saved); // ⭐️ [FIX 3] ADD CALL to helper
        return saved;
    }

    public Event update(Long id, Event e) {
        logger.info("Updating event with ID: {}", id);
        Event existed = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        boolean timeChanged = !existed.getStartTime().isEqual(e.getStartTime());
        boolean locationChanged = !existed.getLocation().equals(e.getLocation());

        existed.setTitle(e.getTitle());
        existed.setDescription(e.getDescription());
        existed.setLocation(e.getLocation());
        existed.setStartTime(e.getStartTime());
        existed.setEndTime(e.getEndTime());
        existed.setCategory(e.getCategory());
        existed.setMaxCapacity(e.getMaxCapacity());
        existed.setOrganizer(e.getOrganizer());
        existed.setFee(e.getFee());
        existed.setTags(e.getTags());
        existed.setImageUrl(e.getImageUrl());
        existed.setIsPublic(e.getIsPublic()); // ✅ เพิ่มการ update isPublic

        Event updated = repo.save(existed);
        logger.info("Event updated successfully: {}", id);

        if (timeChanged || locationChanged) {
            logger.warn("Event {} has significant changes. Sending notifications...", id);

            // 1. ค้นหาทุกคนที่ Favorite กิจกรรมนี้
            List<NotificationQueue> subscribers = notificationQueueRepository.findByEventId(updated.getId());


            // 2. วนลูปส่ง Real-time notification
            for (NotificationQueue nq : subscribers) {
                User user = userRepository.findById(nq.getUserId()).orElse(null);

                if (user != null && user.getEmail() != null) {
                    notificationService.sendRealTimeUpdateNotification(user, updated);

                }
            }
            logger.info("Sent {} update notifications.", subscribers.size());
        }

        updateEventImageUrl(updated); // ⭐️ [FIX 3] ADD CALL to helper
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

            // ⭐️ เพิ่มเงื่อนไข: ดึงเฉพาะ isPublic = true
            predicates.add(criteriaBuilder.isTrue(root.get("isPublic")));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };


        // เรียงลำดับ
        Sort sort = switch (sortBy.toLowerCase()) { // ⭐️ เพิ่ม .toLowerCase() เพื่อความปลอดภัย
            // ⭐️ [แก้ไข] เปลี่ยน "featured" เป็น "popular"
            case "popular" -> // "เรื่องเด่น"  คือมีคนเข้าร่วมเยอะสุด
                    Sort.by(Sort.Direction.DESC, "currentParticipants");

            // ⭐️ [แก้ไข] เปลี่ยน "newest" เป็น "new"
            case "new" -> // "กิจกรรมใหม่"  กิจกรรมที่กำลังจะเริ่มเร็วๆ นี้ (เอา DESC เพื่อให้วันที่ล่าสุดขึ้นก่อน)
                    Sort.by(Sort.Direction.DESC, "startTime");

            case "closingsoon" -> // "ใกล้ปิดรับสมัคร"  กิจกรรมที่กำลังจะจบ (endTime) เร็วที่สุด
                    Sort.by(Sort.Direction.ASC, "endTime");

            default ->
                // ค่าเริ่มต้น เราเรียงตามวันที่เริ่มกิจกรรม (ASC คือเก่าไปใหม่)
                    Sort.by(Sort.Direction.ASC, "startTime");
        };

        // ส่ง Specification ไปให้ Repository ค้นหา
        List<Event> events = repo.findAll(spec, sort);
        return updateEventImageUrls(events); // ⭐️ [FIX 3] ADD CALL to helper (นี่คือจุดที่สำคัญที่สุดสำหรับหน้า Activities)
    }


    // ⭐️ [FIX 4] ADD HELPER METHODS (เพิ่ม 3 เมธอดนี้ต่อท้ายคลาส)

    /**
     * Helper method to convert relative image URL to absolute URL.
     * (เช่น /api/images/file.png -> http://localhost:8080/api/images/file.png)
     */
    private void updateEventImageUrl(Event event) {
        if (event == null) return;
        String imageUrl = event.getImageUrl();
        // เช็คว่า imageUrl ไม่ null, ไม่ใช่ "http" (เผื่อเป็น URL เต็มอยู่แล้ว), และไม่ใช่ "data:image" (เผื่อเป็น Base64)
        if (imageUrl != null && !imageUrl.startsWith("http") && !imageUrl.startsWith("data:image")) {
            event.setImageUrl(baseUrl + imageUrl);
        }
    }

    /**
     * Helper method สำหรับ List
     */
    private List<Event> updateEventImageUrls(List<Event> events) {
        events.forEach(this::updateEventImageUrl);
        return events;
    }

    /**
     * Helper method สำหรับ DTO
     */
    private EventCardDTO toCardDTOWithAbsoluteUrl(Event event) {
        updateEventImageUrl(event);
        return new EventCardDTO(event);
    }
}