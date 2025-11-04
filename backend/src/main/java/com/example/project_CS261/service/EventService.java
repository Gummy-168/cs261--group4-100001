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
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {
    
    private static final Logger logger = LoggerFactory.getLogger(EventService.class);
    
    private final EventRepository repo;
    private final FavoriteRepository favoriteRepository;

    private final NotificationService notificationService;
    private final NotificationQueueRepository notificationQueueRepository;
    private final UserRepository userRepository;

    public EventService(EventRepository repo, FavoriteRepository favoriteRepository,
                        NotificationService notificationService, NotificationQueueRepository notificationQueueRepository, UserRepository userRepository) {
        this.repo = repo;
        this.favoriteRepository = favoriteRepository;
        this.notificationService = notificationService; // เพิ่ม
        this.notificationQueueRepository = notificationQueueRepository; // เพิ่ม
        this.userRepository = userRepository; // เพิ่ม
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

        boolean timeChanged = !existed.getStartTime().isEqual(e.getStartTime());
        boolean locationChanged = !existed.getLocation().equals(e.getLocation());

        existed.setTitle(e.getTitle());
        existed.setDescription(e.getDescription());
        existed.setLocation(e.getLocation());
        existed.setStartTime(e.getStartTime());
        existed.setEndTime(e.getEndTime());

        Event updated = repo.save(existed);
        logger.info("Event updated successfully: {}", id);

        // --- เพิ่ม Logic FR-3 ---
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
}