package com.example.project_CS261.service;

import com.example.project_CS261.model.Event;
import com.example.project_CS261.model.Favorite;
import com.example.project_CS261.model.NotificationQueue;
import com.example.project_CS261.repository.EventRepository;
import com.example.project_CS261.repository.FavoriteRepository;
import com.example.project_CS261.repository.NotificationQueueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Transactional
@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final NotificationQueueRepository notificationQueueRepository;
    private final EventRepository eventRepository;

    public FavoriteService(FavoriteRepository favoriteRepository, NotificationQueueRepository notificationQueueRepository, EventRepository eventRepository) {
        this.favoriteRepository = favoriteRepository;
        this.notificationQueueRepository = notificationQueueRepository;
        this.eventRepository = eventRepository;
    }
    public Favorite addFavorite(Long userId, Long activityId) {
        if (favoriteRepository.findByUserIdAndActivityId(userId, activityId).isPresent()) {
            throw new RuntimeException("Activity already favorited");
        }
        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setActivityId(activityId);

        // 1. ดึงข้อมูล Event เพื่อเอาเวลา startTime
        Event event = eventRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // 2. สร้างรายการใหม่ใน Notification Queue
        NotificationQueue nq = new NotificationQueue();
        nq.setUserId(userId);
        nq.setActivityId(activityId);
        nq.setSendAt(event.getStartTime().minusDays(1)); // ตั้งเวลาส่งล่วงหน้า 1 วัน
        nq.setStatus("PENDING");
        notificationQueueRepository.save(nq);

        return favoriteRepository.save(favorite);
    }

    public List<Favorite> getFavoritesByUser(Long userId) {
        return favoriteRepository.findByUserId(userId);
    }

    public void removeFavorite(Long userId, Long activityId) {
        // เมื่อเลิกชอบ ให้ลบออกจากคิวแจ้งเตือนด้วย
        notificationQueueRepository.deleteByUserIdAndActivityId(userId, activityId);

        favoriteRepository.deleteByUserIdAndActivityId(userId, activityId);
    }
}
