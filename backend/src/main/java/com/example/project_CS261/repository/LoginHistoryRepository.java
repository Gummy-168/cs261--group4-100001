package com.example.project_CS261.repository;

import com.example.project_CS261.model.LoginHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {
    
    // หาประวัติ Login ของ User คนหนึ่ง (เรียงจากใหม่ไปเก่า)
    List<LoginHistory> findByUsernameOrderByLoginTimeDesc(String username);
    
    // หาประวัติ Login จาก User ID
    List<LoginHistory> findByUserIdOrderByLoginTimeDesc(Long userId);
    
    // นับจำนวนครั้งที่ Login ของ User
    long countByUsername(String username);
}
