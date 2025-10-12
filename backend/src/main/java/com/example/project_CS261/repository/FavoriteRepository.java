package com.example.project_CS261.repository;

import com.example.project_CS261.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserId(Long userId);
    Optional<Favorite> findByUserIdAndActivityId(Long userId, Long activityId);
    void deleteByUserIdAndActivityId(Long userId, Long activityId);
}