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

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.example.project_CS261.model.User;

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
            @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {

        try {
            System.out.println("[DEBUG] Received admin email: " + adminEmail);
            System.out.println("[DEBUG] Is admin? " + adminService.isAdmin(adminEmail));
            
            if (adminEmail == null || !adminService.isAdmin(adminEmail)) {
                System.out.println("[DEBUG] Admin check failed - returning 403");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only Admin can upload participant list"));
            }

            List<EventParticipant> participants = participantService.uploadParticipants(eventId, file, adminEmail);

            return ResponseEntity.ok(Map.of(
                    "message", "Upload successful",
                    "count", participants.size(),
                    "participants", participants
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllParticipants(
            @PathVariable Long eventId,
            @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {

        try {
            if (adminEmail == null || !adminService.isAdmin(adminEmail)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only Admin can view participants"));
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
            @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {

        try {
            if (adminEmail == null || !adminService.isAdmin(adminEmail)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only Admin can add participants"));
            }

            EventParticipant participant = participantService.addParticipant(eventId, request, adminEmail);

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
            @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {

        try {
            if (adminEmail == null || !adminService.isAdmin(adminEmail)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only Admin can update participants"));
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
            @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {

        try {
            if (adminEmail == null || !adminService.isAdmin(adminEmail)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only Admin can delete participants"));
            }

            participantService.deleteParticipant(participantId);

            return ResponseEntity.ok(Map.of("message", "Deleted successfully"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}