package com.example.project_CS261.controller;

// FIX 1: Add the missing import for the DTO
import com.example.project_CS261.dto.FavoriteCountDTO;
import com.example.project_CS261.service.EventPopularityService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class EventPopularityController {

    private final EventPopularityService popularityService;

    public EventPopularityController(EventPopularityService popularityService) {
        this.popularityService = popularityService;
    }

    // FIX 2: Changed path from activityId to eventId
    @GetMapping("/{eventId}/favorite-count")
    public FavoriteCountDTO getFavoriteCount(
            // FIX 3: Changed parameter name
            @PathVariable Long eventId
    ) {
        // FIX 4: Pass the correct variable to the service
        return popularityService.getFavoriteCount(eventId);
    }
}