package com.example.project_CS261.service;

import com.example.project_CS261.dto.TuVerifyResponse;
import com.example.project_CS261.model.LoginHistory;
import com.example.project_CS261.model.User;
import com.example.project_CS261.repository.LoginHistoryRepository;
import com.example.project_CS261.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final LoginHistoryRepository loginHistoryRepository;
    private final UserRepository userRepository;

    public UserService(LoginHistoryRepository loginHistoryRepository, UserRepository userRepository) {
        this.loginHistoryRepository = loginHistoryRepository;
        this.userRepository = userRepository;
    }

    /**
     * บันทึก/อัพเดท User และบันทึก Login History
     */
    @Transactional
    public User saveLoginHistory(TuVerifyResponse tuResponse, String ipAddress) {
        logger.info("Login attempt for user: {} from IP: {}", tuResponse.getUsername(), ipAddress);

        // 1. ตรวจสอบว่ามี User ในระบบหรือยัง
        User user = userRepository.findByUsername(tuResponse.getUsername())
                .orElse(null);

        // 2. ถ้ายังไม่มี ให้สร้าง User ใหม่
        if (user == null) {
            user = new User();
            user.setUsername(tuResponse.getUsername());
            user.setDisplaynameTh(tuResponse.getDisplaynameTh());
            user.setEmail(tuResponse.getEmail());
            user.setFaculty(tuResponse.getFaculty());
            user.setDepartment(tuResponse.getDepartment());
            user = userRepository.save(user); // บันทึกและได้ ID กลับมา
            logger.info("New user created: {}", tuResponse.getUsername());
        } else {
            // 3. ถ้ามีอยู่แล้ว ให้อัพเดทข้อมูล (กรณีข้อมูลเปลี่ยน)
            user.setDisplaynameTh(tuResponse.getDisplaynameTh());
            user.setEmail(tuResponse.getEmail());
            user.setFaculty(tuResponse.getFaculty());
            user.setDepartment(tuResponse.getDepartment());
            user = userRepository.save(user);
            logger.info("User updated: {}", tuResponse.getUsername());
        }

        // 4. บันทึก Login History พร้อม user_id ที่ถูกต้อง
        LoginHistory history = new LoginHistory();
        history.setUserId(user.getId()); // ✅ ใช้ user_id จริง
        history.setUsername(tuResponse.getUsername());
        history.setIpAddress(ipAddress);
        history.setStatus("SUCCESS");

        loginHistoryRepository.save(history);
        logger.info("Login successful for user: {} with ID: {}", tuResponse.getUsername(), user.getId());

        // 5. Return User object
        return user;
    }

    /**
     * บันทึก/อัพเดท User และบันทึก Login History แล้ว return userId
     */
    @Transactional
    public Long saveLoginHistoryAndGetUserId(TuVerifyResponse tuResponse, String ipAddress) {
        logger.info("Login attempt for user: {} from IP: {}", tuResponse.getUsername(), ipAddress);

        // 1. ตรวจสอบว่ามี User ในระบบหรือยัง
        User user = userRepository.findByUsername(tuResponse.getUsername())
                .orElse(null);

        // 2. ถ้ายังไม่มี ให้สร้าง User ใหม่
        if (user == null) {
            user = new User();
            user.setUsername(tuResponse.getUsername());
            user.setDisplaynameTh(tuResponse.getDisplaynameTh());
            user.setEmail(tuResponse.getEmail());
            user.setFaculty(tuResponse.getFaculty());
            user.setDepartment(tuResponse.getDepartment());
            user = userRepository.save(user);
            logger.info("New user created: {} with ID: {}", tuResponse.getUsername(), user.getId());
        } else {
            // 3. ถ้ามีอยู่แล้ว ให้อัพเดทข้อมูล
            user.setDisplaynameTh(tuResponse.getDisplaynameTh());
            user.setEmail(tuResponse.getEmail());
            user.setFaculty(tuResponse.getFaculty());
            user.setDepartment(tuResponse.getDepartment());
            user = userRepository.save(user);
            logger.info("User updated: {} with ID: {}", tuResponse.getUsername(), user.getId());
        }

        // 4. บันทึก Login History
        LoginHistory history = new LoginHistory();
        history.setUserId(user.getId());
        history.setUsername(tuResponse.getUsername());
        history.setIpAddress(ipAddress);
        history.setStatus("SUCCESS");
        loginHistoryRepository.save(history);

        logger.info("Login successful for user: {} with ID: {}", tuResponse.getUsername(), user.getId());

        // 5. Return userId
        return user.getId();
    }

    /**
     * อัพเดท theme preference
     */
    public void updateTheme(String username, String theme) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
        
        user.setTheme(theme);
        userRepository.save(user);
        
        logger.info("Theme updated for user: {} to {}", username, theme);
    }

    /**
     * ดึง theme ของ user
     */
    public String getTheme(String username) {
        User user = userRepository.findByUsername(username)
                .orElse(null);
        
        return (user != null && user.getTheme() != null) ? user.getTheme() : "light";
    }
}