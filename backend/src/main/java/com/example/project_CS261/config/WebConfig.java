package com.example.project_CS261.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * ส่วนที่ 1: การตั้งค่า CORS
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .exposedHeaders("Authorization", "Content-Type", "X-Admin-Email", "X-Username") // เพิ่ม custom headers
                .allowCredentials(true)
                .maxAge(3600); // Cache preflight response for 1 hour
    }

    /**
     * ส่วนที่ 2: การตั้งค่า Resource Handlers (สำหรับไฟล์ต่างๆ)
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // ส่วนสำหรับ Swagger (ถ้ามี)
        registry.addResourceHandler("/swagger-ui/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/springdoc-openapi-ui/");
        registry.addResourceHandler("/v3/api-docs/**")
                .addResourceLocations("classpath:/META-INF/api-docs/");

        // ส่วนสำหรับรูปภาพตัวอย่าง (Sample) ที่อยู่ใน src/main/resources
        // URL: /images/events/MCthammasat.png
        // ดึงจาก: classpath:/static/images/events/
        registry.addResourceHandler("/images/events/**")
                .addResourceLocations("classpath:/static/images/events/");

        // ⭐️ [นี่คือตัวแก้ปัญหาหลัก]
        // ส่วนสำหรับรูปที่ Admin อัปโหลด (Uploads)
        // สร้าง Path แบบเต็มไปยังโฟลเดอร์ "uploads"
        String uploadPath = Paths.get("uploads/images/events").toAbsolutePath().toString();

        // URL: /uploads/images/events/some-uuid.png
        // ดึงจาก: file:(Path ที่ชี้ไปโฟลเดอร์ uploads)/
        registry.addResourceHandler("/uploads/images/events/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}