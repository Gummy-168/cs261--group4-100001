package com.example.project_CS261.service;

import com.example.project_CS261.dto.EventCardDTO;
import com.example.project_CS261.exception.ResourceNotFoundException;
import com.example.project_CS261.model.Event;
import com.example.project_CS261.model.Favorite;
import com.example.project_CS261.model.NotificationQueue;
import com.example.project_CS261.model.User;
import com.example.project_CS261.repository.EventFeedbackRepository;
import com.example.project_CS261.repository.EventRepository;
import com.example.project_CS261.repository.FavoriteRepository;
import com.example.project_CS261.repository.NotificationQueueRepository;
import com.example.project_CS261.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    private static final Logger logger = LoggerFactory.getLogger(EventService.class);

    private final EventRepository repo;
    private final FavoriteRepository favoriteRepository;
    private final EventFeedbackRepository eventFeedbackRepository;
    private final FeedbackService feedbackService;

    private final NotificationService notificationService;
    private final NotificationQueueRepository notificationQueueRepository;
    private final UserRepository userRepository;

    // ⭐️ ดึง Base URL (ถ้าไม่มีใน .properties, จะใช้ 8080 เป็นค่าเริ่มต้น)
    @Value("${server.base-url:http://localhost:8080}")
    private String baseUrl;

    public EventService(
            EventRepository repo,
            FavoriteRepository favoriteRepository,
            NotificationService notificationService,
            NotificationQueueRepository notificationQueueRepository,
            UserRepository userRepository,
            EventFeedbackRepository eventFeedbackRepository,
            FeedbackService feedbackService
    ) {
        this.repo = repo;
        this.favoriteRepository = favoriteRepository;
        this.notificationService = notificationService;
        this.notificationQueueRepository = notificationQueueRepository;
        this.userRepository = userRepository;
        this.eventFeedbackRepository = eventFeedbackRepository;
        this.feedbackService = feedbackService;
    }

    public List<Event> getAll() {
        return updateEventImageUrls(repo.findAll());
    }

    /**
     * ดึงข้อมูลเฉพาะ Events ที่เป็น Public เท่านั้น
     */
    public List<Event> getPublicEvents() {
        return updateEventImageUrls(repo.findByIsPublicTrue());
    }

    /**
     * ดึงข้อมูล Events ที่เป็น Public ในรูปแบบ Card DTO
     * สำหรับแสดงใน Frontend (ฝั่ง User)
     */
    public List<EventCardDTO> getAllCards() {
        return repo.findByIsPublicTrue().stream()
                .map(this::buildEventCardDTOWithStats)
                .collect(Collectors.toList());
    }

    /**
     * ดึงข้อมูล Events ทั้งหมดในรูปแบบ Card DTO
     * สำหรับ Admin/Staff
     */
    public List<EventCardDTO> getAllCardsForAdmin() {
        return repo.findAll().stream()
                .map(this::buildEventCardDTOWithStats)
                .collect(Collectors.toList());
    }

    /**
     * ดึงข้อมูล Events ของคณะเฉพาะในรูปแบบ Card DTO
     * สำหรับ Admin/Staff ของคณะนั้น
     * @param faculty - ชื่อคณะ
     */
    public List<EventCardDTO> getAllCardsForAdminByFaculty(String faculty) {
        return repo.findByCreatedByFaculty(faculty).stream()
                .map(this::buildEventCardDTOWithStats)
                .collect(Collectors.toList());
    }

    /**
     * ดึงข้อมูล Events ของ Admin คนนั้นเฉพาะ
     * @param adminEmail - Email ของ Admin
     */
    public List<EventCardDTO> getAllCardsForAdminByEmail(String adminEmail) {
        return repo.findByCreatedByAdmin(adminEmail).stream()
                .map(this::buildEventCardDTOWithStats)
                .collect(Collectors.toList());
    }

    /**
     * ดึงข้อมูล Events ที่เป็น Public ในรูปแบบ Card DTO พร้อมเช็ค Favorite
     * @param userId - ID ของ user เพื่อเช็คว่า favorite หรือยัง
     */
    public List<EventCardDTO> getAllCardsForUser(Long userId) {
        List<Event> events = repo.findByIsPublicTrue(); // ดึงเฉพาะ Public Events
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);

        return events.stream()
                .map(event -> {
                    // ใส่สถิติ + absolute image URL ก่อน
                    EventCardDTO dto = buildEventCardDTOWithStats(event);

                    // เช็คว่า user favorite กิจกรรมนี้หรือยัง
                    boolean isFavorited = favorites.stream()
                            .anyMatch(fav -> fav.getEventId().equals(event.getId()));
                    dto.setIsFavorited(isFavorited);

                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * ดึง Event เดียว + เพิ่ม viewCount และแปลง imageUrl ให้เป็น absolute
     */
    public Event getOne(Long id) {
        Event event = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        // ⭐ เพิ่มการนับ view
        Integer currentViews = event.getViewCount();
        if (currentViews == null) {
            currentViews = 0;
        }
        event.setViewCount(currentViews + 1);

        Event saved = repo.save(event);

        // ⭐ อัปเดต imageUrl ให้เป็น absolute
        updateEventImageUrl(saved);

        return saved;
    }

    public Event create(Event e) {
        logger.info("Creating new event: {}", e.getTitle());
        Event saved = repo.save(e);
        logger.info("Event created with ID: {}", saved.getId());
        updateEventImageUrl(saved);
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

        updateEventImageUrl(updated);
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

    public List<Event> search(String keyword, String category, String location, String organizer,
                              LocalDate startTime, LocalDate endTime, String sortBy) {

        Specification<Event> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.isEmpty()) {
                var titleLike = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("title")),
                        "%" + keyword.toLowerCase() + "%"
                );
                var descriptionLike = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")),
                        "%" + keyword.toLowerCase() + "%"
                );
                predicates.add(criteriaBuilder.or(titleLike, descriptionLike));
            }

            if (category != null && !category.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("category"), category));
            }

            if (location != null && !location.isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("location")),
                        location.toLowerCase()
                ));
            }

            if (organizer != null && !organizer.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("organizer"), organizer));
            }

            if (startTime != null && endTime != null) {
                // ค้นหากิจกรรมที่ *คาบเกี่ยว* กับช่วงเวลาที่เลือก
                var overlapStart = criteriaBuilder.lessThanOrEqualTo(
                        root.get("startTime"), endTime.atTime(LocalTime.MAX));
                var overlapEnd = criteriaBuilder.greaterThanOrEqualTo(
                        root.get("endTime"), startTime.atStartOfDay());
                predicates.add(criteriaBuilder.and(overlapStart, overlapEnd));

            } else if (startTime != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("endTime"), startTime.atStartOfDay()));

            } else if (endTime != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("startTime"), endTime.atTime(LocalTime.MAX)));
            }

            // ⭐️ เพิ่มเงื่อนไข: ดึงเฉพาะ isPublic = true
            predicates.add(criteriaBuilder.isTrue(root.get("isPublic")));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        String sortKey = (sortBy == null) ? "" : sortBy.toLowerCase();

        // เรียงลำดับ
        Sort sort = switch (sortKey) {
            case "popular" -> // "เรื่องเด่น"  คือมีคนเข้าร่วมเยอะสุด
                    Sort.by(Sort.Direction.DESC, "currentParticipants");

            // ⭐️ [แก้ไข] ใช้ key "new" (front ส่งมาเป็น new)
            case "new" -> // "กิจกรรมใหม่"  กิจกรรมที่กำลังจะเริ่มเร็วๆ นี้
                    Sort.by(Sort.Direction.DESC, "startTime");

            // ⭐️ [แก้ไข] ใช้ key "closingsoon" (ตัวเล็กหมด เพราะเรา toLowerCase แล้ว)
            case "closingsoon" -> // "ใกล้ปิดรับสมัคร"
                    Sort.by(Sort.Direction.ASC, "endTime");

            default ->
                    Sort.by(Sort.Direction.ASC, "startTime");
        };

        List<Event> events = repo.findAll(spec, sort);
        return updateEventImageUrls(events);
    }

    // ================== Helper ต่าง ๆ ==================

    /**
     * เมธอดช่วยสร้าง DTO ที่มีสถิติครบถ้วน (favoriteCount, reviewCount, rating, viewCount)
     * พร้อมอัปเดต imageUrl ให้เป็น absolute
     */
    private EventCardDTO buildEventCardDTOWithStats(Event event) {
        // อัปเดต imageUrl ก่อน
        updateEventImageUrl(event);

        EventCardDTO dto = new EventCardDTO(event);

        Long eventId = event.getId();
        if (eventId == null) {
            // ป้องกัน NPE ตอนสร้าง event ใหม่ที่ยังไม่มี ID
            dto.setFavoriteCount(0L);
            dto.setReviewCount(0L);
            dto.setRating(0.0);
            if (dto.getViewCount() == null) {
                dto.setViewCount(0);
            }
            return dto;
        }

        // นับ favorite
        long favoriteCount = favoriteRepository.countByEventId(eventId);

        // นับจำนวน review
        long reviewCount = eventFeedbackRepository.countByEventId(eventId);

        // ค่าเฉลี่ย rating
        Double rating = feedbackService.getAverageRating(eventId);
        if (rating == null) {
            rating = 0.0;
        }

        dto.setFavoriteCount(favoriteCount);
        dto.setReviewCount(reviewCount);
        dto.setRating(rating);

        // viewCount ดึงมาจาก Event (ถ้ามี)
        if (dto.getViewCount() == null) {
            dto.setViewCount(event.getViewCount() != null ? event.getViewCount() : 0);
        }

        return dto;
    }

    /**
     * Helper: แปลง imageUrl ของ event เดียวให้เป็น absolute URL
     */
    private void updateEventImageUrl(Event event) {
        if (event == null) return;
        String imageUrl = event.getImageUrl();

        // เช็คว่า imageUrl ไม่ null, ไม่ใช่ "http" (เผื่อเป็น URL เต็มอยู่แล้ว), และไม่ใช่ "data:image" (เผื่อเป็น Base64)
        if (imageUrl != null && !imageUrl.startsWith("http") && !imageUrl.startsWith("data:image")) {
            event.setImageUrl(baseUrl + "/" + imageUrl);
        }
    }

    /**
     * Helper: สำหรับ List<Event>
     */
    private List<Event> updateEventImageUrls(List<Event> events) {
        events.forEach(this::updateEventImageUrl);
        return events;
    }

    /**
     * Helper: เผื่ออนาคตอยากสร้าง DTO แบบง่าย ๆ แต่อยากได้ absolute URL ด้วย
     */
    @SuppressWarnings("unused")
    private EventCardDTO toCardDTOWithAbsoluteUrl(Event event) {
        updateEventImageUrl(event);
        return new EventCardDTO(event);
    }
}
