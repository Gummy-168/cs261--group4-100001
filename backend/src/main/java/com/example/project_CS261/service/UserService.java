package com.example.project_CS261.service;

import com.example.project_CS261.dto.TuVerifyResponse;
import com.example.project_CS261.model.LoginHistory;
import com.example.project_CS261.repository.LoginHistoryRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final LoginHistoryRepository loginHistoryRepository;

    public UserService(LoginHistoryRepository loginHistoryRepository) {
        this.loginHistoryRepository = loginHistoryRepository;
    }

    /**
     * บันทึก Login History เท่านั้น
     * ไม่บันทึกข้อมูล User
     */
    public void saveLoginHistory(TuVerifyResponse tuResponse, String ipAddress) {
        LoginHistory history = new LoginHistory();
        history.setUserId(null); // ไม่มี user_id เพราะไม่เก็บตาราง users
        history.setUsername(tuResponse.getUsername());
        history.setIpAddress(ipAddress);
        history.setStatus("SUCCESS");
        
        loginHistoryRepository.save(history);
    }
}
