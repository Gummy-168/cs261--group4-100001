package com.example.project_CS261.repository;

import com.example.project_CS261.model.EventParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventParticipantRepository extends JpaRepository<EventParticipant, Long> {

    List<EventParticipant> findByEventId(Long eventId);

    boolean existsByEventIdAndUsername(Long eventId, String username);

    Optional<EventParticipant> findByEventIdAndUsername(Long eventId, String username);

    void deleteByEventId(Long eventId);

    long countByEventId(Long eventId);
}