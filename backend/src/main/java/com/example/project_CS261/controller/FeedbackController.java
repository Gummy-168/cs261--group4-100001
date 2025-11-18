package com.example.project_CS261.controller;

import com.example.project_CS261.dto.FeedbackRequest;
import com.example.project_CS261.dto.FeedbackResponse;
import com.example.project_CS261.model.EventFeedback;
import com.example.project_CS261.repository.EventParticipantRepository;
import com.example.project_CS261.service.FeedbackService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events/{eventId}/feedbacks")
public class FeedbackController {

    private static final Logger logger = LoggerFactory.getLogger(FeedbackController.class);

    private final FeedbackService feedbackService;
    private final EventParticipantRepository eventParticipantRepository;

    public FeedbackController(FeedbackService feedbackService,
                              EventParticipantRepository eventParticipantRepository) {
        this.feedbackService = feedbackService;
        this.eventParticipantRepository = eventParticipantRepository;
    }

    /**
     * Helper: ดึง username ปัจจุบันจาก SecurityContext (ใช้ JWT ที่ filter เซ็ตไว้)
     */
    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            logger.debug("[Feedback] getCurrentUsername -> auth is null or not authenticated");
            return null;
        }

        Object principal = auth.getPrincipal();
        String username = null;

        if (principal instanceof UserDetails userDetails) {
            username = userDetails.getUsername();
        } else {
            String name = auth.getName();
            if (!"anonymousUser".equalsIgnoreCase(name)) {
                username = name;
            }
        }

        logger.debug("[Feedback] getCurrentUsername -> username={}", username);
        return username;
    }

    /**
     * Helper: ตรวจว่า user มีสิทธิ์รีวิวกิจกรรมนี้ไหม
     * เงื่อนไข = ต้องมี row ใน event_participants ที่ event_id ตรง และ can_review = true
     */
    /**
     * Helper: ตรวจว่า user มีสิทธิ์รีวิวกิจกรรมนี้ไหม
     * เงื่อนไขเดิม = ต้องมี can_review = true เท่านั้น
     * ตอนนี้เพิ่ม fallback: ถ้าไม่มี can_review แต่อย่างน้อยเป็นผู้เข้าร่วม ก็ให้รีวิวได้
     */
    private boolean canUserReview(Long eventId, String username) {
        // เช็กแบบเข้มก่อน: มี can_review = true มั้ย
        boolean canReviewFlag = eventParticipantRepository
                .existsByEventIdAndUsernameAndCanReviewTrue(eventId, username);

        if (canReviewFlag) {
            return true;
        }

        // Fallback: เป็นผู้เข้าร่วมกิจกรรมไหม
        boolean isParticipant = eventParticipantRepository
                .existsByEventIdAndUsername(eventId, username);

        logger.debug("[Feedback] canUserReview (fallback) -> eventId={}, username={}, isParticipant={}",
                eventId, username, isParticipant);

        return isParticipant;
    }


    @PostMapping
    public ResponseEntity<?> createFeedback(
            @PathVariable Long eventId,
            @RequestBody FeedbackRequest request
    ) {
        String username = getCurrentUsername();
        if (username == null || username.isEmpty()) {
            logger.info("[Feedback][CREATE] Unauthorized: eventId={}", eventId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "กรุณาเข้าสู่ระบบก่อน"));
        }

        if (!canUserReview(eventId, username)) {
            logger.info("[Feedback][CREATE] Forbidden: eventId={}, username={}", eventId, username);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "คุณไม่มีสิทธิ์รีวิวกิจกรรมนี้ (ไม่ได้เข้าร่วมกิจกรรมหรือยังไม่ได้รับสิทธิ์ให้รีวิว)"));
        }

        try {
            logger.info("[Feedback][CREATE] eventId={}, username={}", eventId, username);
            EventFeedback feedback = feedbackService.createFeedback(eventId, username, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(feedback);
        } catch (IllegalArgumentException e) {
            logger.warn("[Feedback][CREATE] Bad request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("[Feedback][CREATE] Unexpected error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "เกิดข้อผิดพลาดภายในระบบ"));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateFeedback(
            @PathVariable Long eventId,
            @RequestBody FeedbackRequest request
    ) {
        String username = getCurrentUsername();
        if (username == null || username.isEmpty()) {
            logger.info("[Feedback][UPDATE] Unauthorized: eventId={}", eventId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "กรุณาเข้าสู่ระบบก่อน"));
        }

        if (!canUserReview(eventId, username)) {
            logger.info("[Feedback][UPDATE] Forbidden: eventId={}, username={}", eventId, username);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "คุณไม่มีสิทธิ์แก้ไขรีวิวของกิจกรรมนี้"));
        }

        try {
            logger.info("[Feedback][UPDATE] eventId={}, username={}", eventId, username);
            EventFeedback feedback = feedbackService.updateFeedback(eventId, username, request);

            return ResponseEntity.ok(Map.of(
                    "message", "แก้ไขสำเร็จ (มีการแก้ไข)",
                    "feedback", feedback
            ));
        } catch (IllegalArgumentException e) {
            logger.warn("[Feedback][UPDATE] Bad request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("[Feedback][UPDATE] Unexpected error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "เกิดข้อผิดพลาดภายในระบบ"));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllFeedbacks(@PathVariable Long eventId) {
        try {
            logger.debug("[Feedback][LIST] eventId={}", eventId);
            List<FeedbackResponse> feedbacks = feedbackService.getAllFeedbacks(eventId);

            return ResponseEntity.ok(Map.of(
                    "eventId", eventId,
                    "count", feedbacks.size(),
                    "feedbacks", feedbacks
            ));
        } catch (Exception e) {
            logger.error("[Feedback][LIST] Unexpected error", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/events/{eventId}/feedbacks/statistics
     * ดูสถิติคะแนน
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getFeedbackStatistics(@PathVariable Long eventId) {
        try {
            logger.debug("[Feedback][STATS] eventId={}", eventId);
            Double averageRating = feedbackService.getAverageRating(eventId);
            Map<Integer, Long> distribution = feedbackService.getRatingDistribution(eventId);
            long totalFeedbacks = feedbackService.getAllFeedbacks(eventId).size();

            String averageStars = "";
            if (averageRating > 0) {
                int fullStars = averageRating.intValue();
                averageStars = "⭐".repeat(fullStars);
                if (averageRating - fullStars >= 0.5) {
                    averageStars += "½";
                }
            }

            return ResponseEntity.ok(Map.of(
                    "eventId", eventId,
                    "totalFeedbacks", totalFeedbacks,
                    "averageRating", String.format("%.2f", averageRating),
                    "averageRatingStars", averageStars,
                    "distribution", Map.of(
                            "5stars", distribution.getOrDefault(5, 0L),
                            "4stars", distribution.getOrDefault(4, 0L),
                            "3stars", distribution.getOrDefault(3, 0L),
                            "2stars", distribution.getOrDefault(2, 0L),
                            "1star", distribution.getOrDefault(1, 0L)
                    )
            ));
        } catch (Exception e) {
            logger.error("[Feedback][STATS] Unexpected error", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * ใช้โดย frontend เพื่อตัดสินใจว่า:
     * - 200 + feedback → แสดงรีวิวเดิม
     * - 404 → ยังไม่เคยรีวิว แต่ "มีสิทธิ์" → แสดงฟอร์มรีวิว
     * - 403 → ไม่มีสิทธิ์ → ซ่อนฟอร์มรีวิว
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyFeedback(@PathVariable Long eventId) {
        String username = getCurrentUsername();
        if (username == null || username.isEmpty()) {
            logger.info("[Feedback][MY] Unauthorized: eventId={}", eventId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "กรุณาเข้าสู่ระบบก่อน"));
        }

        boolean canReview = canUserReview(eventId, username);
        if (!canReview) {
            logger.info("[Feedback][MY] Forbidden: eventId={}, username={}", eventId, username);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "คุณไม่มีสิทธิ์รีวิวกิจกรรมนี้"));
        }

        try {
            logger.info("[Feedback][MY] eventId={}, username={}", eventId, username);
            EventFeedback feedback = feedbackService.getMyFeedback(eventId, username);

            if (feedback == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "message", "คุณยังไม่ได้เขียน feedback สำหรับกิจกรรมนี้"
                        ));
            }

            return ResponseEntity.ok(Map.of(
                    "message", "พบ feedback ของคุณ",
                    "feedback", feedback
            ));
        } catch (Exception e) {
            logger.error("[Feedback][MY] Unexpected error", e);
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage() != null ? e.getMessage() : "Unexpected error")
            );
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteFeedback(@PathVariable Long eventId) {
        String username = getCurrentUsername();
        if (username == null || username.isEmpty()) {
            logger.info("[Feedback][DELETE] Unauthorized: eventId={}", eventId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "กรุณาเข้าสู่ระบบก่อน"));
        }

        if (!canUserReview(eventId, username)) {
            logger.info("[Feedback][DELETE] Forbidden: eventId={}, username={}", eventId, username);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "คุณไม่มีสิทธิ์ลบรีวิวของกิจกรรมนี้"));
        }

        try {
            logger.info("[Feedback][DELETE] eventId={}, username={}", eventId, username);
            feedbackService.deleteFeedback(eventId, username);
            return ResponseEntity.ok(Map.of("message", "ลบ feedback สำเร็จ"));
        } catch (IllegalArgumentException e) {
            logger.warn("[Feedback][DELETE] Bad request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("[Feedback][DELETE] Unexpected error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "เกิดข้อผิดพลาดภายในระบบ"));
        }
    }
}
