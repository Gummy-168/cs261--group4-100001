package com.example.project_CS261.service;

import com.example.project_CS261.dto.FavoriteCountDTO;
import com.example.project_CS261.repository.FavoriteRepository;
import org.springframework.stereotype.Service;

@Service
public class EventPopularityService {

    private final FavoriteRepository favoriteRepository;

    public EventPopularityService(FavoriteRepository favoriteRepository) {
        this.favoriteRepository = favoriteRepository;
    }

    public FavoriteCountDTO getFavoriteCount(Long activityId) {
        long count = favoriteRepository.countByActivityId(activityId);
        return new FavoriteCountDTO(activityId, count);
    }
}