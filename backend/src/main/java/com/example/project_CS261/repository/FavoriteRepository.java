package com.example.project_CS261.repository;

import com.example.project_CS261.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserId(Long userId);
    
    Optional<Favorite> findByUserIdAndEventId(Long userId, Long eventId);
    
    void deleteByUserIdAndEventId(Long userId, Long eventId);
    
    boolean existsByUserIdAndEventId(Long userId, Long eventId);
}
