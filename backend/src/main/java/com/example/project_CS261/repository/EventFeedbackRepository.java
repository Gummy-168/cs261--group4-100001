package com.example.project_CS261.repository;

import com.example.project_CS261.model.EventFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventFeedbackRepository extends JpaRepository<EventFeedback, Long> {

    List<EventFeedback> findByEventIdOrderByCreatedAtDesc(Long eventId);

    Optional<EventFeedback> findByEventIdAndUsername(Long eventId, String username);

    boolean existsByEventIdAndUsername(Long eventId, String username);

    long countByEventId(Long eventId);
}