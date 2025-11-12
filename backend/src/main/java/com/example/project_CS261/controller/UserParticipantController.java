package com.example.project_CS261.controller;

import com.example.project_CS261.dto.ParticipantRequest;
import com.example.project_CS261.model.EventParticipant;
import com.example.project_CS261.model.User;
import com.example.project_CS261.repository.UserRepository;
import com.example.project_CS261.service.ParticipantService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/participants")
@CrossOrigin(origins = "http://localhost:5173")
public class UserParticipantController {

    private final ParticipantService participantService;
    private final UserRepository userRepository;

    public UserParticipantController(ParticipantService participantService, UserRepository userRepository) {
        this.participantService = participantService;
        this.userRepository = userRepository;
    }

    /**
     * ลงทะเบียนเข้าร่วม Event
     * POST /api/participants/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerForEvent(@RequestBody Map<String, Long> request) {
        try {
            // ดึง username จาก JWT token
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            if (username == null || username.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "กรุณาเข้าสู่ระบบก่อน"));
            }

            Long eventId = request.get("eventId");
            if (eventId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "กรุณาระบุ eventId"));
            }

            //  สร้าง ParticipantRequest ตาม DTO ที่มีจริง
            ParticipantRequest participantRequest = new ParticipantRequest();
            participantRequest.setUsername(username);  // username ใน DTO = studentId / TU Login

            //  ดึงข้อมูล User จาก DB
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                participantRequest.setStudentName(user.getDisplaynameTh()); // ✅ ใช้ displaynameTh แทน getName()
                participantRequest.setEmail(user.getEmail());
            }

            EventParticipant participant = participantService.addParticipant(eventId, participantRequest, username);

            return ResponseEntity.ok(Map.of(
                    "message", "ลงทะเบียนสำเร็จ",
                    "participant", participant
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "เกิดข้อผิดพลาด: " + e.getMessage()));
        }
    }

    /**
     * ยกเลิกการลงทะเบียน
     * DELETE /api/participants/cancel/{eventId}
     */
    @DeleteMapping("/cancel/{eventId}")
    public ResponseEntity<?> cancelRegistration(@PathVariable Long eventId) {
        try {
            // ดึง username จาก JWT token
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            if (username == null || username.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "กรุณาเข้าสู่ระบบก่อน"));
            }

            // หา participant ของ user นี้ในงานนี้
            List<EventParticipant> allParticipants = participantService.getAllParticipants(eventId);
            EventParticipant userParticipant = allParticipants.stream()
                    .filter(p -> p.getStudentId().equals(username))
                    .findFirst()
                    .orElse(null);

            if (userParticipant == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "คุณยังไม่ได้ลงทะเบียนงานนี้"));
            }

            // ลบ participant
            participantService.deleteParticipant(userParticipant.getId());

            return ResponseEntity.ok(Map.of("message", "ยกเลิกการลงทะเบียนสำเร็จ"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "เกิดข้อผิดพลาด: " + e.getMessage()));
        }
    }

    /**
     * ดึงรายการ Events ที่ User ลงทะเบียนแล้ว
     * GET /api/participants/user
     */
    @GetMapping("/user")
    public ResponseEntity<?> getMyRegisteredEvents() {
        try {
            // ดึง username จาก JWT token
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            if (username == null || username.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "กรุณาเข้าสู่ระบบก่อน"));
            }

            // ดึง events ที่ user ลงทะเบียนแล้ว
            List<EventParticipant> registrations = participantService.getUserParticipations(username);

            return ResponseEntity.ok(Map.of(
                    "count", registrations.size(),
                    "events", registrations
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "เกิดข้อผิดพลาด: " + e.getMessage()));
        }
    }

    /**
     * ตรวจสอบว่า User ลงทะเบียน Event นี้แล้วหรือยัง
     * GET /api/participants/check/{eventId}
     */
    @GetMapping("/check/{eventId}")
    public ResponseEntity<?> checkRegistrationStatus(@PathVariable Long eventId) {
        try {
            // ดึง username จาก JWT token
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            if (username == null || username.isEmpty()) {
                return ResponseEntity.ok(Map.of("isRegistered", false));
            }

            // ตรวจสอบว่า user ลงทะเบียนแล้วหรือยัง
            List<EventParticipant> allParticipants = participantService.getAllParticipants(eventId);
            boolean isRegistered = allParticipants.stream()
                    .anyMatch(p -> p.getStudentId().equals(username));

            return ResponseEntity.ok(Map.of("isRegistered", isRegistered));

        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("isRegistered", false));
        }
    }

    /**
     * นับจำนวนผู้ลงทะเบียนใน Event
     * GET /api/participants/event/{eventId}/count
     */
    @GetMapping("/event/{eventId}/count")
    public ResponseEntity<?> getParticipantCount(@PathVariable Long eventId) {
        try {
            List<EventParticipant> participants = participantService.getAllParticipants(eventId);
            
            return ResponseEntity.ok(Map.of(
                    "eventId", eventId,
                    "count", participants.size()
            ));

        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "eventId", eventId,
                    "count", 0
            ));
        }
    }
}
