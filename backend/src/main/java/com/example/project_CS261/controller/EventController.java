package com.example.project_CS261.controller;

import com.example.project_CS261.model.Event;
import com.example.project_CS261.service.EventService;
import com.example.project_CS261.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")

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
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAll());
    }

    /**
     * GET /api/events/{id} - ดู Event ตัวเดียว (ทุกคนเห็นได้)
     */
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        try {
            Event event = eventService.getOne(id);
            return ResponseEntity.ok(event);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/events - สร้าง Event ใหม่ (Admin เท่านั้น)
     * Header: X-Username (ใส่ username ที่ login)
     */
    @PostMapping
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

    /**
     * PUT /api/events/{id} - แก้ไข Event (Admin เท่านั้น)
     * Header: X-Username (ใส่ username ที่ login)
     */
    @PutMapping("/{id}")
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

    /**
     * DELETE /api/events/{id} - ลบ Event (Admin เท่านั้น)
     * Header: X-Username (ใส่ username ที่ login)
     */
    @DeleteMapping("/{id}")
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