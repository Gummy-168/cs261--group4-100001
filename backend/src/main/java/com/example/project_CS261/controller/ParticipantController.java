package com.example.project_CS261.controller;

import com.example.project_CS261.dto.ParticipantRequest;
import com.example.project_CS261.model.EventParticipant;
import com.example.project_CS261.service.AdminService;
import com.example.project_CS261.service.ParticipantService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/events/{eventId}/participants")
public class ParticipantController {

    private final ParticipantService participantService;
    private final AdminService adminService;

    public ParticipantController(ParticipantService participantService, AdminService adminService) {
        this.participantService = participantService;
        this.adminService = adminService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadParticipants(
            @PathVariable Long eventId,
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-Username", required = false) String username) {

        try {
            if (username == null || !adminService.isAdmin(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "เฉพาะ Admin เท่านั้นที่สามารถอัปโหลดรายชื่อได้"));
            }

            List<EventParticipant> participants = participantService.uploadParticipants(eventId, file, username);

            return ResponseEntity.ok(Map.of(
                    "message", "อัปโหลดสำเร็จ",
                    "count", participants.size(),
                    "participants", participants
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "เกิดข้อผิดพลาด: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllParticipants(
            @PathVariable Long eventId,
            @RequestHeader(value = "X-Username", required = false) String username) {

        try {
            if (username == null || !adminService.isAdmin(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "เฉพาะ Admin เท่านั้น"));
            }

            List<EventParticipant> participants = participantService.getAllParticipants(eventId);

            return ResponseEntity.ok(Map.of(
                    "eventId", eventId,
                    "count", participants.size(),
                    "participants", participants
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> addParticipant(
            @PathVariable Long eventId,
            @RequestBody ParticipantRequest request,
            @RequestHeader(value = "X-Username", required = false) String username) {

        try {
            if (username == null || !adminService.isAdmin(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "เฉพาะ Admin เท่านั้น"));
            }

            EventParticipant participant = participantService.addParticipant(eventId, request, username);

            return ResponseEntity.status(HttpStatus.CREATED).body(participant);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{participantId}")
    public ResponseEntity<?> updateParticipant(
            @PathVariable Long eventId,
            @PathVariable Long participantId,
            @RequestBody ParticipantRequest request,
            @RequestHeader(value = "X-Username", required = false) String username) {

        try {
            if (username == null || !adminService.isAdmin(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "เฉพาะ Admin เท่านั้น"));
            }

            EventParticipant participant = participantService.updateParticipant(participantId, request);

            return ResponseEntity.ok(participant);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{participantId}")
    public ResponseEntity<?> deleteParticipant(
            @PathVariable Long eventId,
            @PathVariable Long participantId,
            @RequestHeader(value = "X-Username", required = false) String username) {

        try {
            if (username == null || !adminService.isAdmin(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "เฉพาะ Admin เท่านั้น"));
            }

            participantService.deleteParticipant(participantId);

            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}