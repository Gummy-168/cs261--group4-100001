package com.example.project_CS261.service;

import com.example.project_CS261.model.Favorite;
import com.example.project_CS261.repository.FavoriteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Transactional
@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;

    public FavoriteService(FavoriteRepository favoriteRepository) {
        this.favoriteRepository = favoriteRepository;
    }

    public Favorite addFavorite(Long userId, Long activityId) {
        if (favoriteRepository.findByUserIdAndActivityId(userId, activityId).isPresent()) {
            throw new RuntimeException("Activity already favorited");
        }
        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setActivityId(activityId);
        return favoriteRepository.save(favorite);
    }

    public List<Favorite> getFavoritesByUser(Long userId) {
        return favoriteRepository.findByUserId(userId);
    }

    public void removeFavorite(Long userId, Long activityId) {
        favoriteRepository.deleteByUserIdAndActivityId(userId, activityId);
    }
}
