//ทำหน้าที่:รับ HTTP Request จาก client (เช่น Browser, Postman, Frontend React ฯลฯ)
//เรียกใช้ Service (EventService) เพื่อประมวลผล / จัดการข้อมูล
//ส่ง HTTP Response กลับไป (พร้อม status code 200, 201, 404, 204 ฯลฯ)

package com.example.project_CS261.controller;

import com.example.project_CS261.dto.EventCardDTO;
import com.example.project_CS261.model.Event;
import com.example.project_CS261.service.EventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:5173")
public class EventController {
    
    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // GET /api/events - Get all events
    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAll());
    }

    // GET /api/events/cards - Get all events as cards for frontend
    @GetMapping("/cards")
    public ResponseEntity<List<EventCardDTO>> getAllEventCards() {
        return ResponseEntity.ok(eventService.getAllCards());
    }

    // GET /api/events/cards/user/{userId} - Get all events as cards with favorite status
    @GetMapping("/cards/user/{userId}")
    public ResponseEntity<List<EventCardDTO>> getAllEventCardsForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(eventService.getAllCardsForUser(userId));
    }

    // GET /api/events/{id} - Get one event by id
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        Event event = eventService.getOne(id);
        return ResponseEntity.ok(event);
    }

    // POST /api/events - Create new event
    @PostMapping
    public ResponseEntity<Event> createEvent(@Valid @RequestBody Event event) {
        Event created = eventService.create(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/events/{id} - Update existing event
    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @Valid @RequestBody Event event) {
        Event updated = eventService.update(id, event);
        return ResponseEntity.ok(updated);
    }

    // DELETE /api/events/{id} - Delete event
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.delete(id);
        return ResponseEntity.noContent().build();
    }
}