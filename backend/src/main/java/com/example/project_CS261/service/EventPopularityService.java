package com.example.project_CS261.service;

// This is the new line you were missing
import com.example.project_CS261.dto.FavoriteCountDTO;
import com.example.project_CS261.repository.FavoriteRepository;
import org.springframework.stereotype.Service;

@Service
public class EventPopularityService {

    private final FavoriteRepository favoriteRepository;

    public EventPopularityService(FavoriteRepository favoriteRepository) {
        this.favoriteRepository = favoriteRepository;
    }

    public FavoriteCountDTO getFavoriteCount(Long eventId) {
        long count = favoriteRepository.countByEventId(eventId);
        return new FavoriteCountDTO(eventId, count);
    }
}