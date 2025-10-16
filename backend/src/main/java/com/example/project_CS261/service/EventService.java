//เป็นชั้นกลางที่ทำหน้าที่ ประมวลผล logic ของแอปพลิเคชัน ก่อนส่งไปยัง Repository หรือส่งกลับไปยัง Controller
//พูดง่าย ๆ: Controller ไม่ไปยุ่งกับ Repository โดยตรง แต่สั่งงานผ่าน Service เพื่อแยกความรับผิดชอบห

package com.example.project_CS261.service;

import com.example.project_CS261.model.Event;
import com.example.project_CS261.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {
    private final EventRepository repo;

    public EventService(EventRepository repo) {
        this.repo = repo;
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

        return repo.save(existed);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Event not found: " + id);
        }
        repo.deleteById(id);
    }
}