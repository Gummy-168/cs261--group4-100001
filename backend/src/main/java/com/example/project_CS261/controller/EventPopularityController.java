package com.example.project_CS261.controller;

import com.example.project_CS261.dto.FavoriteCountDTO;
import com.example.project_CS261.service.EventPopularityService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventPopularityController {

    private final EventPopularityService popularityService;

    public EventPopularityController(EventPopularityService popularityService) {
        this.popularityService = popularityService;
    }

    // GET /api/events/{activityId}/favorite-count
    @GetMapping("/{activityId}/favorite-count")
    public FavoriteCountDTO getFavoriteCount(@PathVariable Long activityId) {
        return popularityService.getFavoriteCount(activityId);
    }
}