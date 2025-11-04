package com.example.project_CS261.service;

import com.example.project_CS261.model.EventParticipation;
import com.example.project_CS261.repository.EventParticipationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EventParticipationService {

    @Autowired
    private EventParticipationRepository repo;

    public Map<String, Long> getEventPopularity(Long eventId) {
        List<EventParticipation> participations = repo.findByEventId(eventId);

        long interested = participations.stream()
                .filter(p -> p.getStatus().equalsIgnoreCase("interested"))
                .count();

        long going = participations.stream()
                .filter(p -> p.getStatus().equalsIgnoreCase("going"))
                .count();

        Map<String, Long> result = new HashMap<>();
        result.put("interested", interested);
        result.put("going", going);
        return result;
    }

    public EventParticipation participate(Long userId, Long eventId, String status) {
        EventParticipation p = repo.findByUserIdAndEventId(userId, eventId)
                .orElse(new EventParticipation(null, eventId, userId, status));
        p.setStatus(status);
        return repo.save(p);
    }

    public void removeParticipation(Long userId, Long eventId) {
        repo.findByUserIdAndEventId(userId, eventId)
                .ifPresent(repo::delete);
    }
}