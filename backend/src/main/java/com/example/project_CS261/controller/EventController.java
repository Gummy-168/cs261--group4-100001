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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@Tag(name = "Events", description = "Event Management API")
@CrossOrigin(origins = "http://localhost:5173")
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

    /**
     * GET /api/events/by-faculty - ดูกิจกรรมตามคณะ (Admin)
     */
    @GetMapping("/by-faculty")
    @Operation(summary = "Get events by faculty", description = "Filter events by faculty (for admin)")
    public ResponseEntity<List<Event>> getEventsByFaculty(
            @RequestParam String faculty) {

        List<Event> events = eventService.getAll().stream()
            .filter(e -> faculty.equals(e.getCreatedByFaculty()))
            .collect(Collectors.toList());

        return ResponseEntity.ok(events);
    }

    @GetMapping("/cards")
    @Operation(summary = "Get all public event cards", description = "Retrieve all PUBLIC events in card format for frontend display")
    public ResponseEntity<List<EventCardDTO>> getAllEventCards() {
        return ResponseEntity.ok(eventService.getAllCards());
    }

    @GetMapping("/cards/admin")
    @Operation(summary = "Get all event cards for admin", description = "Retrieve ALL events (including drafts) in card format for admin/staff")
    public ResponseEntity<List<EventCardDTO>> getAllEventCardsForAdmin(
            @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {

        // เช็คว่าเป็น Admin หรือไม่
        if (adminEmail == null || !adminService.isAdmin(adminEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(null);
        }

        // ดึงข้อมูล Admin เพื่อเช็คคณะ
        var adminOpt = adminService.getAdminByEmail(adminEmail);
        if (adminOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        var admin = adminOpt.get();

        // ถ้ามี Faculty ระบุ ให้กรองเฉพาะคณะนั้น
        // ถ้าไม่มี หรือเป็น "ALL" ให้แสดงทั้งหมด (สำหรับ Super Admin)
        List<EventCardDTO> cards;
        if (admin.getFaculty() != null && !admin.getFaculty().equalsIgnoreCase("ALL")) {
            cards = eventService.getAllCardsForAdminByFaculty(admin.getFaculty());
        } else {
            cards = eventService.getAllCardsForAdmin();
        }

        return ResponseEntity.ok(cards);
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
            @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {

        // เช็คว่าเป็น Admin หรือไม่
        if (adminEmail == null || !adminService.isAdmin(adminEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only admins can create events"));
        }

        // ดึงข้อมูล Admin เพื่อเซ็ต createdByFaculty
        var adminOpt = adminService.getAdminByEmail(adminEmail);
        if (adminOpt.isPresent()) {
            var admin = adminOpt.get();
            event.setCreatedByAdmin(adminEmail);
            event.setCreatedByFaculty(admin.getFaculty()); // ✅ เซ็ตคณะตอนสร้าง
        } else {
            event.setCreatedByAdmin(adminEmail);
        }

        Event created = eventService.create(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/events/{id} - แก้ไข Event (Admin เท่านั้น)
     * Header: X-Admin-Email (ใส่ email ของ admin ที่ login)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(
            @PathVariable Long id,
            @RequestBody Event event,
            @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {

        // เช็คว่าเป็น Admin หรือไม่
        if (adminEmail == null || !adminService.isAdmin(adminEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only admins can update events"));
        }

        try {
            // ✅ ดึงข้อมูล Admin และ Event เพื่อเช็ค Faculty
            var adminOpt = adminService.getAdminByEmail(adminEmail);
            if (adminOpt.isPresent()) {
                var admin = adminOpt.get();
                var existingEvent = eventService.getOne(id);

                // เช็คว่า Admin มีสิทธิ์แก้ไข Event นี้หรือไม่
                // - ถ้าเป็น Super Admin (faculty = "ALL") แก้ไขได้หมด
                // - ถ้าไม่ใช่ ต้องเป็น Event ของคณะเดียวกันเท่านั้น
                if (admin.getFaculty() != null &&
                    !admin.getFaculty().equalsIgnoreCase("ALL") &&
                    !admin.getFaculty().equals(existingEvent.getCreatedByFaculty())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "You can only edit events from your faculty"));
                }
            }

            Event updated = eventService.update(id, event);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE /api/events/{id} - ลบ Event (Admin เท่านั้น)
     * Header: X-Admin-Email (ใส่ email ของ admin ที่ login)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(
            @PathVariable Long id,
            @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {

        // เช็คว่าเป็น Admin หรือไม่
        if (adminEmail == null || !adminService.isAdmin(adminEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only admins can delete events"));
        }

        try {
            // ✅ ดึงข้อมูล Admin และ Event เพื่อเช็ค Faculty
            var adminOpt = adminService.getAdminByEmail(adminEmail);
            if (adminOpt.isPresent()) {
                var admin = adminOpt.get();
                var existingEvent = eventService.getOne(id);

                // เช็คว่า Admin มีสิทธิ์ลบ Event นี้หรือไม่
                // - ถ้าเป็น Super Admin (faculty = "ALL") ลบได้หมด
                // - ถ้าไม่ใช่ ต้องเป็น Event ของคณะเดียวกันเท่านั้น
                if (admin.getFaculty() != null &&
                    !admin.getFaculty().equalsIgnoreCase("ALL") &&
                    !admin.getFaculty().equals(existingEvent.getCreatedByFaculty())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "You can only delete events from your faculty"));
                }
            }

            eventService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
