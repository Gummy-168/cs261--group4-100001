package com.example.project_CS261.service;

import com.example.project_CS261.dto.TuVerifyResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("test")
@Primary
public class MockTuAuthService extends TuAuthService {

    public MockTuAuthService(
            @Value("${TU_API_URL:http://localhost}") String tuApiUrl,
            @Value("${TU_API_KEY:mock-key}") String tuApiKey
    ) {
        super(tuApiUrl, tuApiKey);
    }

    @Override
    public TuVerifyResponse verify(String username, String password) {
        System.out.println("🧪 Using MOCK TuAuthService - Not calling real TU API");
        System.out.println("📝 Mock login attempt: username=" + username);
        
        // สร้าง Mock Response
        TuVerifyResponse response = new TuVerifyResponse();
        
        // ✅ ถ้า username และ password ไม่ว่าง ถือว่าสำเร็จ (สำหรับทดสอบ)
        if (username != null && !username.isEmpty() && 
            password != null && !password.isEmpty()) {
            
            response.setStatus(true);
            response.setMessage("Mock authentication successful");
            response.setUsername(username);
            response.setDisplaynameEn("Mock User - " + username);
            response.setDisplaynameTh("ผู้ใช้ทดสอบ - " + username);
            response.setEmail(username + "@dome.tu.ac.th");
            response.setFaculty("Mock Faculty");
            response.setDepartment("Mock Department");
            response.setType("student");
            
            System.out.println("✅ Mock authentication SUCCESS for: " + username);
        } else {
            response.setStatus(false);
            response.setMessage("Mock authentication failed - empty credentials");
            System.out.println("❌ Mock authentication FAILED");
        }
        
        return response;
    }
}
