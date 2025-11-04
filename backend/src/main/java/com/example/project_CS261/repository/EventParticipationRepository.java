package com.example.project_CS261.repository;

import com.example.project_CS261.model.EventParticipation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EventParticipationRepository extends JpaRepository<EventParticipation, Long> {

    List<EventParticipation> findByEventId(Long eventId);

    Optional<EventParticipation> findByUserIdAndEventId(Long userId, Long eventId);
}