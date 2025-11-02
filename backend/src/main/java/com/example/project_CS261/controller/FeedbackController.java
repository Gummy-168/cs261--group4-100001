package com.example.project_CS261.controller;

import com.example.project_CS261.dto.FeedbackRequest;
import com.example.project_CS261.dto.FeedbackResponse;
import com.example.project_CS261.model.EventFeedback;
import com.example.project_CS261.service.FeedbackService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events/{eventId}/feedbacks")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public ResponseEntity<?> createFeedback(
            @PathVariable Long eventId,
            @RequestBody FeedbackRequest request,
            @RequestHeader(value = "X-Username") String username) {

        try {
            if (username == null || username.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "กรุณาเข้าสู่ระบบก่อน"));
            }

            EventFeedback feedback = feedbackService.createFeedback(eventId, username, request);

            return ResponseEntity.status(HttpStatus.CREATED).body(feedback);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateFeedback(
            @PathVariable Long eventId,
            @RequestBody FeedbackRequest request,
            @RequestHeader(value = "X-Username") String username) {

        try {
            if (username == null || username.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "กรุณาเข้าสู่ระบบก่อน"));
            }

            EventFeedback feedback = feedbackService.updateFeedback(eventId, username, request);

            return ResponseEntity.ok(Map.of(
                    "message", "แก้ไขสำเร็จ (มีการแก้ไข)",
                    "feedback", feedback
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllFeedbacks(@PathVariable Long eventId) {
        try {
            List<FeedbackResponse> feedbacks = feedbackService.getAllFeedbacks(eventId);

            return ResponseEntity.ok(Map.of(
                    "eventId", eventId,
                    "count", feedbacks.size(),
                    "feedbacks", feedbacks
            ));

        } catch (Exception e) {
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
            Double averageRating = feedbackService.getAverageRating(eventId);
            Map<Integer, Long> distribution = feedbackService.getRatingDistribution(eventId);
            long totalFeedbacks = feedbackService.getAllFeedbacks(eventId).size();

            // สร้างดาวแสดงคะแนนเฉลี่ย
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
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyFeedback(
            @PathVariable Long eventId,
            @RequestHeader(value = "X-Username") String username) {

        try {
            if (username == null || username.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "กรุณาเข้าสู่ระบบก่อน"));
            }

            EventFeedback feedback = feedbackService.getMyFeedback(eventId, username);

            if (feedback == null) {
                return ResponseEntity.ok(Map.of(
                        "message", "คุณยังไม่ได้เขียน feedback",
                        "feedback", null
                ));
            }

            return ResponseEntity.ok(Map.of(
                    "message", "พบ feedback ของคุณ",
                    "feedback", feedback
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteFeedback(
            @PathVariable Long eventId,
            @RequestHeader(value = "X-Username") String username) {

        try {
            if (username == null || username.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "กรุณาเข้าสู่ระบบก่อน"));
            }

            feedbackService.deleteFeedback(eventId, username);

            return ResponseEntity.ok(Map.of("message", "ลบ feedback สำเร็จ"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}