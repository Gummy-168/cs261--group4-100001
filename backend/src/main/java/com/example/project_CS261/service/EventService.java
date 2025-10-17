package com.example.project_CS261.service;

import com.example.project_CS261.dto.*;
import com.example.project_CS261.model.Event;
import com.example.project_CS261.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    // --- Create (for testing/admin in Postman) ---
    public EventDetailResponse create(EventCreateRequest req) {
        validatePoster(req.posterUrl);

        Event e = Event.builder()
                .title(req.title)
                .description(req.description)
                .startAt(req.startAt)
                .endAt(req.endAt)
                .location(req.location)
                .capacity(req.capacity == null ? 0 : req.capacity)
                .reserved(req.reserved == null ? 0 : req.reserved)
                .category(req.category)
                .organizerUnit(req.organizerUnit)
                .organizerName(req.organizerName)
                .organizerContact(req.organizerContact)
                .posterUrl(req.posterUrl)
                .registerUrl(req.registerUrl)
                .edited(false)
                .build();

        e = eventRepository.save(e);
        return toDetail(e);
    }

    // --- List (sorted by date) ---
    public List<EventCardResponse> listAll() {
        return eventRepository.findAllByOrderByStartAtAsc()
                .stream()
                .map(this::toCard)
                .toList();
    }

    // --- Detail ---
    public EventDetailResponse getOne(Long id) {
        Event e = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + id));
        return toDetail(e);
    }

    // --- Update time/location/capacity (mark edited) ---
    public EventDetailResponse update(Long id, EventUpdateRequest req) {
        Event e = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + id));

        boolean changed = false;

        if (req.startAt != null && !req.startAt.equals(e.getStartAt())) {
            e.setStartAt(req.startAt);
            changed = true;
        }
        if (req.endAt != null && (e.getEndAt() == null || !req.endAt.equals(e.getEndAt()))) {
            e.setEndAt(req.endAt);
            changed = true;
        }
        if (StringUtils.hasText(req.location) && !req.location.equals(e.getLocation())) {
            e.setLocation(req.location);
            changed = true;
        }
        if (req.capacity != null && !req.capacity.equals(e.getCapacity())) {
            e.setCapacity(req.capacity);
        }
        if (req.reserved != null && !req.reserved.equals(e.getReserved())) {
            e.setReserved(req.reserved);
        }
        if (StringUtils.hasText(req.posterUrl) && !req.posterUrl.equals(e.getPosterUrl())) {
            validatePoster(req.posterUrl);
            e.setPosterUrl(req.posterUrl);
        }
        if (StringUtils.hasText(req.registerUrl)) {
            e.setRegisterUrl(req.registerUrl);
        }
        if (changed) {
            e.setEdited(true); // FR-10
        }

        e = eventRepository.save(e);
        return toDetail(e);
    }

    // --- Mapping ---
    private EventCardResponse toCard(Event e) {
        return EventCardResponse.builder()
                .id(e.getId())
                .title(e.getTitle())
                .startAt(e.getStartAt())
                .category(e.getCategory())
                .organizerUnit(e.getOrganizerUnit())
                .posterUrl(e.getPosterUrl())
                .remaining(e.getRemaining())
                .full(e.isFull()) // FR-9
                .build();
    }

    private EventDetailResponse toDetail(Event e) {
        return EventDetailResponse.builder()
                .id(e.getId())
                .title(e.getTitle())
                .description(e.getDescription())
                .startAt(e.getStartAt())
                .endAt(e.getEndAt())
                .location(e.getLocation())
                .capacity(e.getCapacity())
                .remaining(e.getRemaining())
                .full(e.isFull()) // FR-9
                .organizerName(e.getOrganizerName())
                .organizerContact(e.getOrganizerContact())
                .posterUrl(e.getPosterUrl())
                .category(e.getCategory())
                .organizerUnit(e.getOrganizerUnit())
                .registerUrl(e.getRegisterUrl()) // FR-7
                .edited(e.isEdited()) // FR-10
                .interestedPlaceholder("TODO in Sprint 2") // FR-8
                .reviewPlaceholder("TODO in Sprint 2")     // FR-12
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
