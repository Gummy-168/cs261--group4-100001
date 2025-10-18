package com.example.project_CS261.service;

import com.example.project_CS261.dto.TuVerifyResponse;
import com.example.project_CS261.model.LoginHistory;
import com.example.project_CS261.model.User;
import com.example.project_CS261.repository.LoginHistoryRepository;
import com.example.project_CS261.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class UserService {

    private final LoginHistoryRepository loginHistoryRepository;
    private final UserRepository userRepository;

    public UserService(LoginHistoryRepository loginHistoryRepository, UserRepository userRepository) {
        this.loginHistoryRepository = loginHistoryRepository;
        this.userRepository = userRepository;
    }

    public void logUserLogout(String username) {
        // ค้นหา session ล่าสุดของ user คนนี้ที่ยังไม่ได้ logout
        loginHistoryRepository.findFirstByUsernameAndLogoutTimeIsNullOrderByLoginTimeDesc(username)
                .ifPresent(latestLogin -> {
                    // ถ้าเจอ ให้ตั้งเวลา logout เป็นเวลาปัจจุบัน
                    latestLogin.setLogoutTime(LocalDateTime.now());
                    // แล้วบันทึกการเปลี่ยนแปลงลงฐานข้อมูล
                    loginHistoryRepository.save(latestLogin);
                });
    }

    /**
     * ค้นหา User จาก username ถ้าไม่เจอก็สร้างใหม่จากข้อมูล TU API
     * @param tuResponse ข้อมูลที่ได้จากการ verify
     * @return User object ที่มีอยู่ในระบบ
     */
    public User findOrCreateUser(TuVerifyResponse tuResponse) {
        return userRepository.findByUsername(tuResponse.getUsername())
                .orElseGet(() -> {
                    // ถ้าหาไม่เจอ ให้สร้าง User ใหม่
                    User newUser = new User();
                    newUser.setUsername(tuResponse.getUsername());
                    newUser.setDisplaynameTh(tuResponse.getDisplaynameTh());
                    newUser.setEmail(tuResponse.getEmail());
                    newUser.setFaculty(tuResponse.getFaculty());
                    newUser.setDepartment(tuResponse.getDepartment());
                    return userRepository.save(newUser);
                });
    }

    /**
     * บันทึกประวัติการล็อกอิน (เวอร์ชันใหม่ที่รับ User)
     * @param user Object ของ User ที่ล็อกอิน
     * @param ipAddress IP ของผู้ใช้
     */
    public void saveLoginHistory(User user, String ipAddress) {
        LoginHistory history = new LoginHistory();
        history.setUser(user); // <-- ตอนนี้จะรู้จัก user.getId() แล้ว
        history.setUsername(user.getUsername());
        history.setIpAddress(ipAddress);
        history.setStatus("SUCCESS"); // กำหนดสถานะว่าสำเร็จ
        // บันทึกประวัติลงฐานข้อมูล
        loginHistoryRepository.save(history);
    }
}