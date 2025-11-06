package com.example.project_CS261.controller;

import com.example.project_CS261.dto.EventCardDTO;
import com.example.project_CS261.model.Event;
import com.example.project_CS261.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import com.example.project_CS261.service.AdminService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/events")
@Tag(name = "Events", description = "Event Management API")
public class EventController {

    private final EventService eventService;
    private final AdminService adminService;

    public EventController(EventService eventService, AdminService adminService) {
        this.eventService = eventService;
        this.adminService = adminService;
    }
    /**
     * GET /api/events - ดูทั้งหมด (ทุกคนเห็นได้)
     */
    @GetMapping
    @Operation(summary = "Get all events", description = "Retrieve all events from the database")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAll());
    }

    @GetMapping("/search")
    @Operation(summary = "Search events", description = "Search events by multiple criteria (public)")
    public ResponseEntity<List<Event>> searchEvents(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String organizer,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endTime,
            @RequestParam(required = false, defaultValue = "default") String sortBy)
    {
        List<Event> events = eventService.search(keyword, category, location, organizer, startTime, endTime, sortBy);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/cards")
    @Operation(summary = "Get all event cards", description = "Retrieve all events in card format for frontend display")
    public ResponseEntity<List<EventCardDTO>> getAllEventCards() {
        return ResponseEntity.ok(eventService.getAllCards());
    }

    @GetMapping("/cards/user/{userId}")
    @Operation(summary = "Get event cards for user", description = "Retrieve all events with favorite status for a specific user")
    public ResponseEntity<List<EventCardDTO>> getAllEventCardsForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(eventService.getAllCardsForUser(userId));
    }

    @GetMapping("/{id}") //
    @Operation(summary = "Get event by ID", description = "Retrieve a specific event by its ID")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        try {
            Event event = eventService.getOne(id);
            return ResponseEntity.ok(event);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @Operation(summary = "Create new event", description = "Create a new event (requires authentication)")
    public ResponseEntity<?> createEvent(
            @RequestBody Event event,
            @RequestHeader(value = "X-Username", required = false) String username) {

        // เช็คว่าเป็น Admin หรือไม่
        if (username == null || !adminService.isAdmin(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only admins can create events"));
        }

        Event created = eventService.create(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update event", description = "Update an existing event (requires authentication)")
    public ResponseEntity<?> updateEvent(
            @PathVariable Long id,
            @RequestBody Event event,
            @RequestHeader(value = "X-Username", required = false) String username) {

        // เช็คว่าเป็น Admin หรือไม่
        if (username == null || !adminService.isAdmin(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only admins can update events"));
        }

        try {
            Event updated = eventService.update(id, event);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete event", description = "Delete an event (requires authentication)")
    public ResponseEntity<?> deleteEvent(
            @PathVariable Long id,
            @RequestHeader(value = "X-Username", required = false) String username) {

        // เช็คว่าเป็น Admin หรือไม่
        if (username == null || !adminService.isAdmin(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only admins can delete events"));
        }

        try {
            eventService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
