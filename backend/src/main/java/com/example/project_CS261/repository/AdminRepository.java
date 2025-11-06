package com.example.project_CS261.repository;

import com.example.project_CS261.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {

    // OLD METHODS (รองรับระบบเดิม - username)
    Optional<Admin> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByUsernameAndIsActiveTrue(String username);

    // NEW METHODS (ระบบใหม่ - email)
    Optional<Admin> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<Admin> findByEmailAndIsActiveTrue(String email);
    boolean existsByEmailAndIsActiveTrue(String email);

    // COMMON METHODS
    List<Admin> findByIsActiveTrue();
}