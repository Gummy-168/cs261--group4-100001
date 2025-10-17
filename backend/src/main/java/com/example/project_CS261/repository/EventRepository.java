//ทำหน้าที่เหมือน Database Access Layer (การเข้าถึง/จัดการข้อมูล)
// แต่ในโค้ดนี้ยัง ไม่ต่อกับ Database จริง → ใช้ ConcurrentHashMap ทำตัวเหมือน DB ชั่วคราว (In-Memory Database)

package com.example.project_CS261.repository;

import com.example.project_CS261.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {
    List<Event> findAllByOrderByStartTimeAsc();
}