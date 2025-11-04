package com.example.project_CS261.service;

import com.example.project_CS261.model.EventParticipation;
import com.example.project_CS261.repository.EventParticipationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class EventParticipationService {

    @Autowired
    private EventParticipationRepository repo;

    public Map<String, Long> getEventPopularity(Long eventId) {
        List<EventParticipation> participations = repo.findByEventId(eventId);

        long interested = participations.stream()
                .filter(p -> "interested".equalsIgnoreCase(p.getStatus()))
                .count();

        long going = participations.stream()
                .filter(p -> "going".equalsIgnoreCase(p.getStatus()))
                .count();

        Map<String, Long> result = new HashMap<>();
        result.put("interested", interested);
        result.put("going", going);
        return result;
    }

    public EventParticipation participate(Long userId, Long eventId, String status) {
        EventParticipation participation = repo.findByUserIdAndEventId(userId, eventId)
                .orElse(new EventParticipation(null, eventId, userId, status));
        participation.setStatus(status);
        return repo.save(participation);
    }

    public void removeParticipation(Long userId, Long eventId) {
        repo.findByUserIdAndEventId(userId, eventId)
                .ifPresent(repo::delete);
    }
}
