package com.example.project_CS261.repository;

import com.example.project_CS261.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {

    // หา Admin จาก username
    Optional<Admin> findByUsername(String username);

    // เช็คว่า username เป็น Admin หรือไม่
    boolean existsByUsername(String username);

    // หา Admin ที่ active อยู่
    List<Admin> findByIsActiveTrue();

    // เช็คว่าเป็น Admin และ active
    boolean existsByUsernameAndIsActiveTrue(String username);
}