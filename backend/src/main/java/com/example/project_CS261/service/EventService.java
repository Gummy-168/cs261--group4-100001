//เป็นชั้นกลางที่ทำหน้าที่ ประมวลผล logic ของแอปพลิเคชัน ก่อนส่งไปยัง Repository หรือส่งกลับไปยัง Controller
//พูดง่าย ๆ: Controller ไม่ไปยุ่งกับ Repository โดยตรง แต่สั่งงานผ่าน Service เพื่อแยกความรับผิดชอบห

package com.example.project_CS261.service;

import com.example.project_CS261.model.Event;
import com.example.project_CS261.repository.EventRepository;
import org.springframework.stereotype.Service;

import com.example.project_CS261.repository.NotificationQueueRepository;
import java.util.List;
import com.example.project_CS261.model.NotificationQueue;
import com.example.project_CS261.model.User;
import com.example.project_CS261.repository.UserRepository;

@Service
public class EventService {
    private final EventRepository repo;
    private final NotificationService notificationService;
    private final NotificationQueueRepository notificationQueueRepository;
    private final UserRepository userRepository;

    public EventService(EventRepository repo, NotificationService notificationService, NotificationQueueRepository notificationQueueRepository, UserRepository userRepository) {
        this.repo = repo;
        // 2. เพิ่มเข้าไปใน Constructor
        this.notificationService = notificationService;
        this.notificationQueueRepository = notificationQueueRepository;
        this.userRepository = userRepository;
    }

    public List<Event> getAll() {
        return repo.findAll();
    }

    public Event getOne(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + id));
    }

    public Event create(Event e) {
        return repo.save(e);
    }

    public Event update(Long id, Event e) {
        Event existed = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + id));

        existed.setTitle(e.getTitle());
        existed.setDescription(e.getDescription());
        existed.setLocation(e.getLocation());
        existed.setStartTime(e.getStartTime());
        existed.setEndTime(e.getEndTime());

        Event updatedEvent = repo.save(existed);

        // 3. --- ส่วนที่เพิ่มเข้ามา ---
        // ค้นหา User ทุกคนที่ Favorite Event นี้ไว้
        List<NotificationQueue> affectedQueues = notificationQueueRepository.findByActivityId(updatedEvent.getId());
        for (NotificationQueue nq : affectedQueues) {
            userRepository.findById(nq.getUserId()).ifPresent(user -> {
                // ส่ง Real-time notification
                notificationService.sendRealTimeUpdateNotification(user, updatedEvent);
            });
        }
        return updatedEvent;
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Event not found: " + id);
        }
        repo.deleteById(id);
    }
}