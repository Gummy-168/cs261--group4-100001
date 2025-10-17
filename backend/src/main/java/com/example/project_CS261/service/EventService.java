//เป็นชั้นกลางที่ทำหน้าที่ ประมวลผล logic ของแอปพลิเคชัน ก่อนส่งไปยัง Repository หรือส่งกลับไปยัง Controller
//พูดง่าย ๆ: Controller ไม่ไปยุ่งกับ Repository โดยตรง แต่สั่งงานผ่าน Service เพื่อแยกความรับผิดชอบ (Separation of Concerns)

package com.example.project_CS261.service;

import com.example.project_CS261.dto.*;
import com.example.project_CS261.model.Event;
import com.example.project_CS261.model.NotificationQueue;
import com.example.project_CS261.repository.EventRepository;
import com.example.project_CS261.repository.NotificationQueueRepository;
import com.example.project_CS261.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final NotificationService notificationService;
    private final NotificationQueueRepository notificationQueueRepository;
    private final UserRepository userRepository;

    public EventDetailResponse create(EventCreateRequest req) {
        validatePoster(req.getPosterUrl());
        Event event = Event.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .location(req.getLocation())
                .capacity(req.getCapacity() == null ? 0 : req.getCapacity())
                .reserved(req.getReserved() == null ? 0 : req.getReserved())
                .category(req.getCategory())
                .organizerUnit(req.getOrganizerUnit())
                .organizerName(req.getOrganizerName())
                .organizerContact(req.getOrganizerContact())
                .posterUrl(req.getPosterUrl())
                .registerUrl(req.getRegisterUrl())
                .edited(false)
                .build();
        event = eventRepository.save(event);
        return toDetail(event);
    }

    public List<EventCardResponse> listAll() {
        return eventRepository.findAllByOrderByStartTimeAsc().stream()
                .map(this::toCard)
                .toList();
    }

    public EventDetailResponse getOne(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + id));
        return toDetail(event);
    }

    public EventDetailResponse update(Long id, EventUpdateRequest req) {
        Event existed = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + id));
        boolean changed = false;

        if (req.getStartTime() != null && !req.getStartTime().equals(existed.getStartTime())) {
            existed.setStartTime(req.getStartTime());
            changed = true;
        }
        if (req.getEndTime() != null && (existed.getEndTime() == null || !req.getEndTime().equals(existed.getEndTime()))) {
            existed.setEndTime(req.getEndTime());
            changed = true;
        }
        if (StringUtils.hasText(req.getLocation()) && !req.getLocation().equals(existed.getLocation())) {
            existed.setLocation(req.getLocation());
            changed = true;
        }
        if (req.getCapacity() != null && !req.getCapacity().equals(existed.getCapacity())) {
            existed.setCapacity(req.getCapacity());
        }
        if (req.getReserved() != null && !req.getReserved().equals(existed.getReserved())) {
            existed.setReserved(req.getReserved());
        }
        if (StringUtils.hasText(req.getPosterUrl()) && !req.getPosterUrl().equals(existed.getPosterUrl())) {
            validatePoster(req.getPosterUrl());
            existed.setPosterUrl(req.getPosterUrl());
        }
        if (StringUtils.hasText(req.getRegisterUrl())) {
            existed.setRegisterUrl(req.getRegisterUrl());
        }
        if (changed) {
            existed.setEdited(true);
        }

        Event updatedEvent = eventRepository.save(existed);

        List<NotificationQueue> affectedQueues = notificationQueueRepository.findByActivityId(updatedEvent.getId());
        for (NotificationQueue nq : affectedQueues) {
            userRepository.findById(nq.getUserId()).ifPresent(user -> {
                notificationService.sendRealTimeUpdateNotification(user, updatedEvent);
            });
        }
        return toDetail(updatedEvent);
    }

    public void delete(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new IllegalArgumentException("Event not found: " + id);
        }
        eventRepository.deleteById(id);
    }

    public List<EventCardResponse> search(String keyword, String category, String location, LocalDate startDate, LocalDate endDate) {
        Specification<Event> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (keyword != null && !keyword.isEmpty()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                Predicate titleLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), pattern);
                Predicate descriptionLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), pattern);
                predicates.add(criteriaBuilder.or(titleLike, descriptionLike));
            }
            if (category != null && !category.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("category"), category));
            }
            if (location != null && !location.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("location"), location));
            }
            if (startDate != null) {
                LocalDateTime startOfDay = startDate.atStartOfDay();
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("startAt"), startOfDay));
            }
            if (endDate != null) {
                LocalDateTime endOfDay = endDate.atTime(23, 59, 59);
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("startAt"), endOfDay));
            }
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        return eventRepository.findAll(spec).stream().map(this::toCard).toList();
    }

    private EventCardResponse toCard(Event e) {
        return EventCardResponse.builder()
                .id(e.getId())
                .title(e.getTitle())
                .startTime(e.getStartTime())
                .category(e.getCategory())
                .organizerUnit(e.getOrganizerUnit())
                .posterUrl(e.getPosterUrl())
                .remaining(e.getRemaining())
                .full(e.isFull())
                .build();
    }

    private EventDetailResponse toDetail(Event e) {
        return EventDetailResponse.builder()
                .id(e.getId())
                .title(e.getTitle())
                .description(e.getDescription())
                .startTime(e.getStartTime())
                .endTime(e.getEndTime())
                .location(e.getLocation())
                .capacity(e.getCapacity())
                .remaining(e.getRemaining())
                .full(e.isFull())
                .organizerName(e.getOrganizerName())
                .organizerContact(e.getOrganizerContact())
                .posterUrl(e.getPosterUrl())
                .category(e.getCategory())
                .organizerUnit(e.getOrganizerUnit())
                .registerUrl(e.getRegisterUrl())
                .edited(e.isEdited())
                .interestedPlaceholder("TODO in Sprint 2")
                .reviewPlaceholder("TODO in Sprint 2")
                .build();
    }

    private void validatePoster(String posterUrl) {
        if (!StringUtils.hasText(posterUrl)) {
            throw new IllegalArgumentException("posterUrl is required (.jpg or .png)");
        }
        String lower = posterUrl.toLowerCase(Locale.ROOT);
        if (!(lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png"))) {
            throw new IllegalArgumentException("posterUrl must be .jpg/.jpeg/.png");
        }
    }
}