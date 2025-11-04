package com.example.project_CS261.controller;

import com.example.project_CS261.model.EventParticipation;
import com.example.project_CS261.service.EventParticipationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventParticipationController {

    @Autowired
    private EventParticipationService service;

    // GET popularity count
    @GetMapping("/{id}/participants")
    public Map<String, Long> getPopularity(@PathVariable Long id) {
        return service.getEventPopularity(id);
    }

    // POST participate
    @PostMapping("/{id}/participate")
    public EventParticipation participate(@PathVariable Long id,
                                          @RequestParam Long userId,
                                          @RequestParam String status) {
        return service.participate(userId, id, status);
    }

    // DELETE participation
    @DeleteMapping("/{id}/participate")
    public void remove(@PathVariable Long id,
                       @RequestParam Long userId) {
        service.removeParticipation(userId, id);
    }
}