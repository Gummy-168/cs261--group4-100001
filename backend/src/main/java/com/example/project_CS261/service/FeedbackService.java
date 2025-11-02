package com.example.project_CS261.service;

import com.example.project_CS261.dto.FeedbackRequest;
import com.example.project_CS261.dto.FeedbackResponse;
import com.example.project_CS261.model.EventFeedback;
import com.example.project_CS261.model.EventParticipant;
import com.example.project_CS261.repository.EventFeedbackRepository;
import com.example.project_CS261.repository.EventParticipantRepository;
import com.example.project_CS261.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    private final EventFeedbackRepository feedbackRepository;
    private final EventParticipantRepository participantRepository;
    private final EventRepository eventRepository;

    public FeedbackService(EventFeedbackRepository feedbackRepository,
                           EventParticipantRepository participantRepository,
                           EventRepository eventRepository) {
        this.feedbackRepository = feedbackRepository;
        this.participantRepository = participantRepository;
        this.eventRepository = eventRepository;
    }

    public EventFeedback createFeedback(Long eventId, String username, FeedbackRequest request) {
        if (!eventRepository.existsById(eventId)) {
            throw new IllegalArgumentException("ไม่พบกิจกรรม ID: " + eventId);
        }

        if (!participantRepository.existsByEventIdAndUsername(eventId, username)) {
            throw new IllegalArgumentException("คุณไม่ได้รับอนุมัติให้เขียน feedback ในกิจกรรมนี้");
        }

        if (feedbackRepository.existsByEventIdAndUsername(eventId, username)) {
            throw new IllegalArgumentException("คุณเขียน feedback ไปแล้ว กรุณาใช้ฟังก์ชันแก้ไข");
        }

        if (request.getRating() != null && (request.getRating() < 1 || request.getRating() > 5)) {
            throw new IllegalArgumentException("คะแนนต้องอยู่ระหว่าง 1-5");
        }

        EventFeedback feedback = new EventFeedback();
        feedback.setEventId(eventId);
        feedback.setUsername(username);
        feedback.setComment(request.getComment());
        feedback.setRating(request.getRating());
        feedback.setIsEdited(false);

        return feedbackRepository.save(feedback);
    }

    public EventFeedback updateFeedback(Long eventId, String username, FeedbackRequest request) {
        EventFeedback feedback = feedbackRepository.findByEventIdAndUsername(eventId, username)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบ feedback ของคุณ"));

        if (request.getRating() != null && (request.getRating() < 1 || request.getRating() > 5)) {
            throw new IllegalArgumentException("คะแนนต้องอยู่ระหว่าง 1-5");
        }

        feedback.setComment(request.getComment());
        feedback.setRating(request.getRating());
        feedback.setIsEdited(true);

        return feedbackRepository.save(feedback);
    }

    public List<FeedbackResponse> getAllFeedbacks(Long eventId) {
        List<EventFeedback> feedbacks = feedbackRepository.findByEventIdOrderByCreatedAtDesc(eventId);

        return feedbacks.stream().map(feedback -> {
            EventParticipant participant = participantRepository
                    .findByEventIdAndUsername(eventId, feedback.getUsername())
                    .orElse(null);

            FeedbackResponse response = new FeedbackResponse();
            response.setId(feedback.getId());
            response.setEventId(feedback.getEventId());
            response.setUsername(feedback.getUsername());
            response.setStudentName(participant != null ? participant.getStudentName() : "ไม่ทราบชื่อ");
            response.setComment(feedback.getComment());
            response.setRating(feedback.getRating()); // จะ set ratingStars อัตโนมัติ
            response.setIsEdited(feedback.getIsEdited());
            response.setCreatedAt(feedback.getCreatedAt());
            response.setUpdatedAt(feedback.getUpdatedAt());

            return response;
        }).collect(Collectors.toList());
    }

    /**
     * คำนวณคะแนนเฉลี่ยของกิจกรรม
     */
    public Double getAverageRating(Long eventId) {
        List<EventFeedback> feedbacks = feedbackRepository.findByEventIdOrderByCreatedAtDesc(eventId);

        return feedbacks.stream()
                .filter(f -> f.getRating() != null)
                .mapToInt(EventFeedback::getRating)
                .average()
                .orElse(0.0);
    }

    /**
     * สถิติคะแนนแยกตามดาว
     */
    public Map<Integer, Long> getRatingDistribution(Long eventId) {
        List<EventFeedback> feedbacks = feedbackRepository.findByEventIdOrderByCreatedAtDesc(eventId);

        return feedbacks.stream()
                .filter(f -> f.getRating() != null)
                .collect(Collectors.groupingBy(EventFeedback::getRating, Collectors.counting()));
    }

    public EventFeedback getMyFeedback(Long eventId, String username) {
        return feedbackRepository.findByEventIdAndUsername(eventId, username)
                .orElse(null);
    }

    public void deleteFeedback(Long eventId, String username) {
        EventFeedback feedback = feedbackRepository.findByEventIdAndUsername(eventId, username)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบ feedback"));

        feedbackRepository.delete(feedback);
    }
}