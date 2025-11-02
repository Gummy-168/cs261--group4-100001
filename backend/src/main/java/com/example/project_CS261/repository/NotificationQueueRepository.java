package com.example.project_CS261.repository;

import com.example.project_CS261.model.NotificationQueue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationQueueRepository extends JpaRepository<NotificationQueue, Long> {

    // ค้นหารายการแจ้งเตือนทั้งหมดที่ถึงเวลาส่งแล้วและยังไม่ได้ส่ง
    List<NotificationQueue> findByStatusAndSendAtBefore(String status, java.time.LocalDateTime now);
    
    // ใช้สำหรับลบรายการแจ้งเศือนเมื่อผู้ใช้ un-favorite
    void deleteByUserIdAndEventId(Long userId, Long eventId);

    List<NotificationQueue> findByEventId(Long eventId);
}