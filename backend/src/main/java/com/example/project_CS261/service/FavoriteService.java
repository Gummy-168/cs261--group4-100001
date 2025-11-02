package com.example.project_CS261.service;

import com.example.project_CS261.model.Event;
import com.example.project_CS261.model.Favorite;
import com.example.project_CS261.model.NotificationQueue;
import com.example.project_CS261.repository.EventRepository;
import com.example.project_CS261.repository.FavoriteRepository;
import com.example.project_CS261.repository.NotificationQueueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FavoriteService {

    private static final Logger logger = LoggerFactory.getLogger(FavoriteService.class);

    private final FavoriteRepository favoriteRepository;
    private final NotificationQueueRepository notificationQueueRepository;
    private final EventRepository eventRepository;

    public FavoriteService(FavoriteRepository favoriteRepository, 
                          NotificationQueueRepository notificationQueueRepository, 
                          EventRepository eventRepository) {
        this.favoriteRepository = favoriteRepository;
        this.notificationQueueRepository = notificationQueueRepository;
        this.eventRepository = eventRepository;
    }

    /**
     * Add event to user's favorites
     */
    public Favorite addFavorite(Long userId, Long eventId) {
        logger.info("=== Adding favorite ===");
        logger.info("userId: {}", userId);
        logger.info("eventId: {}", eventId);
        
        // Validate inputs
        if (userId == null) {
            logger.error("userId is NULL!");
            throw new IllegalArgumentException("User ID cannot be null");
        }
        
        if (eventId == null) {
            logger.error("eventId is NULL!");
            throw new IllegalArgumentException("Event ID cannot be null");
        }
        
        // Check if already favorited
        if (favoriteRepository.existsByUserIdAndEventId(userId, eventId)) {
            logger.warn("Event {} already favorited by user {}", eventId, userId);
            throw new RuntimeException("Event already favorited");
        }

        // Create favorite
        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setEventId(eventId);

        // Get event details for notification
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));

        logger.info("Event found: {}", event.getTitle());
        logger.info("Event start time: {}", event.getStartTime());

        // Create notification queue entry
        NotificationQueue nq = new NotificationQueue();
        nq.setUserId(userId);
        nq.setEventId(eventId);
        nq.setSendAt(event.getStartTime().minusDays(1));
        nq.setStatus("PENDING");
        
        logger.info("NotificationQueue before save:");
        logger.info("  userId: {}", nq.getUserId());
        logger.info("  eventId: {}", nq.getEventId());
        logger.info("  sendAt: {}", nq.getSendAt());
        logger.info("  status: {}", nq.getStatus());
        
        notificationQueueRepository.save(nq);
        logger.info("NotificationQueue saved successfully");

        Favorite savedFavorite = favoriteRepository.save(favorite);
        logger.info("Favorite added successfully for user {} and event {}", userId, eventId);
        
        return savedFavorite;
    }

    /**
     * Get all favorites for a user
     */
    public List<Favorite> getFavoritesByUser(Long userId) {
        logger.info("Fetching favorites for user: {}", userId);
        return favoriteRepository.findByUserId(userId);
    }

    /**
     * Remove event from user's favorites
     */
    public void removeFavorite(Long userId, Long eventId) {
        logger.info("Removing favorite: userId={}, eventId={}", userId, eventId);
        
        // Remove from notification queue
        notificationQueueRepository.deleteByUserIdAndEventId(userId, eventId);
        
        // Remove favorite
        favoriteRepository.deleteByUserIdAndEventId(userId, eventId);
        
        logger.info("Favorite removed successfully for user {} and event {}", userId, eventId);
    }

    /**
     * Check if event is favorited by user
     */
    public boolean isFavorited(Long userId, Long eventId) {
        return favoriteRepository.existsByUserIdAndEventId(userId, eventId);
    }
}
