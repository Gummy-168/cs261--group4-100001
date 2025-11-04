package com.example.project_CS261.controller;

import com.example.project_CS261.dto.EventParticipationDTO;
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

    // ดูจำนวนคนสนใจ/ไปในกิจกรรม
    @GetMapping("/{id}/participants")
    public Map<String, Long> getPopularity(@PathVariable Long id) {
        return service.getEventPopularity(id);
    }

    // เข้าร่วม/กดสนใจ
    @PostMapping("/{id}/participate")
    public EventParticipation participate(@PathVariable Long id,
                                          @RequestBody EventParticipationDTO dto) {
        return service.participate(dto.getUserId(), id, dto.getStatus());
    }

    // ยกเลิกการเข้าร่วม
    @DeleteMapping("/{id}/participate")
    public void remove(@PathVariable Long id,
                       @RequestBody EventParticipationDTO dto) {
        service.removeParticipation(dto.getUserId(), id);
    }
}