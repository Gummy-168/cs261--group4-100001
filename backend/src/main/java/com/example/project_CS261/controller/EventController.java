//ทำหน้าที่:รับ HTTP Request จาก client (เช่น Browser, Postman, Frontend React ฯลฯ)
//เรียกใช้ Service (EventService) เพื่อประมวลผล / จัดการข้อมูล
//ส่ง HTTP Response กลับไป (พร้อม status code 200, 201, 404, 204 ฯลฯ)

package com.example.project_CS261.controller;

import com.example.project_CS261.dto.*;
import com.example.project_CS261.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<EventCardResponse>> listAllEvents() {
        return ResponseEntity.ok(eventService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDetailResponse> getEventById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(eventService.getOne(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<EventCardResponse>> searchEvents(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<EventCardResponse> foundEvents = eventService.search(keyword, category, location, startDate, endDate);
        return ResponseEntity.ok(foundEvents);
    }

    @PostMapping
    public ResponseEntity<EventDetailResponse> createEvent(@RequestBody EventCreateRequest req) {
        EventDetailResponse created = eventService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventDetailResponse> updateEvent(@PathVariable Long id, @RequestBody EventUpdateRequest req) {
        try {
            EventDetailResponse updated = eventService.update(id, req);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

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