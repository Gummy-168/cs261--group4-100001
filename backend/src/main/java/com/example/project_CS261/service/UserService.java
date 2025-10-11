package com.example.project_CS261.service;

import com.example.project_CS261.dto.TuVerifyResponse;
import com.example.project_CS261.model.LoginHistory;
import com.example.project_CS261.model.User;
import com.example.project_CS261.repository.LoginHistoryRepository;
import com.example.project_CS261.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

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
    public void saveLoginHistory(TuVerifyResponse tuResponse, String ipAddress) {
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
        } else {
            // 3. ถ้ามีอยู่แล้ว ให้อัพเดทข้อมูล (กรณีข้อมูลเปลี่ยน)
            user.setDisplaynameTh(tuResponse.getDisplaynameTh());
            user.setEmail(tuResponse.getEmail());
            user.setFaculty(tuResponse.getFaculty());
            user.setDepartment(tuResponse.getDepartment());
            user = userRepository.save(user);
        }
        
        // 4. บันทึก Login History พร้อม user_id ที่ถูกต้อง
        LoginHistory history = new LoginHistory();
        history.setUserId(user.getId()); // ✅ ใช้ user_id จริง
        history.setUsername(tuResponse.getUsername());
        history.setIpAddress(ipAddress);
        history.setStatus("SUCCESS");
        
        loginHistoryRepository.save(history);
    }
}
