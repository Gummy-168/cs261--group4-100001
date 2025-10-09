package com.example.project_CS261.service;

import com.example.project_CS261.dto.TuVerifyRequest;
import com.example.project_CS261.dto.TuVerifyResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

/**
 * เรียก TU API โดยซ่อน Application-Key ไว้ฝั่ง backend
 */
@Service
public class TuAuthService {

    private final WebClient client;

    public TuAuthService(
            @Value("${tuapi.url}") String tuApiUrl,
            @Value("${tuapi.key}") String tuApiKey
    ) {
        this.client = WebClient.builder()
                .baseUrl(tuApiUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("Application-Key", tuApiKey)
                .build();
    }

    public TuVerifyResponse verify(String username, String password) {
        // 1. สร้างข้อมูลที่จะส่งไป TU API
        TuVerifyRequest body = new TuVerifyRequest(username, password);

        try {
            // 2. ส่ง HTTP Request ไปที่ TU API
            TuVerifyResponse res = client.post()
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(TuVerifyResponse.class)
                    .block();

            if (res == null) {
                throw new RuntimeException("Empty response from TU API");
            }
            // 3. ได้ response กลับมา (ถ้า login ถูก จะได้ข้อมูลนักศึกษา)
            return res;

        } catch (WebClientResponseException e) {
            // แปลง error ให้อ่านง่าย
            String msg = "TU API error: " + e.getStatusCode().value() + " " + e.getStatusText();
            if (e.getStatusCode().value() == 401) {
                msg = "Unauthorized (ตรวจ Application-Key หรือสิทธิ์ channel)";
            } else if (e.getStatusCode().value() == 403) {
                msg = "Forbidden (ไม่ได้รับอนุญาตใช้งาน API นี้)";
            } else if (e.getStatusCode().value() == 400) {
                msg = "Bad Request (ตรวจ JSON: UserName/PassWord สะกด/เคสตัวอักษรให้ถูก)";
            }
            throw new RuntimeException(msg, e);
        } catch (Exception e) {
            throw new RuntimeException("Cannot call TU API: " + e.getMessage(), e);
        }
    }
}
