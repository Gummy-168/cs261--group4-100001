//ทำหน้าที่:รับ HTTP Request จาก client (เช่น Browser, Postman, Frontend React ฯลฯ)
//เรียกใช้ Service (EventService) เพื่อประมวลผล / จัดการข้อมูล
//ส่ง HTTP Response กลับไป (พร้อม status code 200, 201, 404, 204 ฯลฯ)

package com.example.project_CS261.controller;

import com.example.project_CS261.model.Event;
import com.example.project_CS261.service.EventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;


import java.util.List;

@RestController
@RequestMapping("/api/events")
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

    // GET /api/events/{id} - Get one event by id
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        try {
            Event event = eventService.getOne(id);
            return ResponseEntity.ok(event);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // GET /api/events/search - Search and filter events
    @GetMapping("/search")
    public ResponseEntity<List<Event>> searchEvents(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        // เราจะส่ง Parameters ทั้งหมดนี้ไปให้ Service เพื่อทำการค้นหาต่อไป
        List<Event> foundEvents = eventService.search(keyword, category, location, startDate, endDate);
        return ResponseEntity.ok(foundEvents);
    }

    // POST /api/events - Create new event
    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        Event created = eventService.create(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/events/{id} - Update existing event
    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event event) {
        try {
            Event updated = eventService.update(id, event);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/events/{id} - Delete event
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        try {
            eventService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}