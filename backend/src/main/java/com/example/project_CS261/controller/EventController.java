package com.example.project_CS261.controller;

import com.example.project_CS261.dto.*;
import com.example.project_CS261.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    // FR-1/2: Event List (sorted)
    @GetMapping
    public ResponseEntity<List<EventCardResponse>> list() {
        return ResponseEntity.ok(eventService.listAll());
    }

    // FR-3/4/5/6/7/9/10/12: Event Detail
    @GetMapping("/{id}")
    public ResponseEntity<EventDetailResponse> one(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getOne(id));
    }

    // Admin/testing: create
    @PostMapping
    public ResponseEntity<EventDetailResponse> create(@RequestBody EventCreateRequest req) {
        return ResponseEntity.ok(eventService.create(req));
    }

    // Admin/testing: update (marks edited when time/location changed)
    @PatchMapping("/{id}")
    public ResponseEntity<EventDetailResponse> update(@PathVariable Long id,
                                                      @RequestBody EventUpdateRequest req) {
        return ResponseEntity.ok(eventService.update(id, req));
    }
}
