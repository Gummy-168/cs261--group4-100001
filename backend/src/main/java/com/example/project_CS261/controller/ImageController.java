package com.example.project_CS261.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Controller สำหรับจัดการการอัปโหลดและดาวน์โหลดรูปภาพกิจกรรม
 */
@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "http://localhost:5173")
public class ImageController {

    private static final Logger logger = LoggerFactory.getLogger(ImageController.class);
    
    // Path สำหรับเก็บรูปภาพ (ใน static folder)
    private final Path imageStorageLocation = Paths.get("src/main/resources/static/images/events");

    public ImageController() {
        try {
            // สร้าง directory ถ้ายังไม่มี
            Files.createDirectories(this.imageStorageLocation);
        } catch (Exception ex) {
            logger.error("Could not create upload directory!", ex);
        }
    }

    /**
     * Upload รูปภาพ
     * POST /api/images/upload
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // ตรวจสอบไฟล์ว่าง
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Please select a file to upload"));
            }

            // ตรวจสอบประเภทไฟล์
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Only image files are allowed"));
            }

            // สร้างชื่อไฟล์ใหม่ (เพื่อไม่ให้ซ้ำ)
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : "";
            String newFilename = UUID.randomUUID().toString() + fileExtension;

            // บันทึกไฟล์
            Path targetLocation = this.imageStorageLocation.resolve(newFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // สร้าง URL สำหรับเข้าถึงรูป
            String imageUrl = "/images/events/" + newFilename;

            logger.info("File uploaded successfully: {}", newFilename);

            Map<String, String> response = new HashMap<>();
            response.put("filename", newFilename);
            response.put("imageUrl", imageUrl);
            response.put("message", "Upload successful");

            return ResponseEntity.ok(response);

        } catch (IOException ex) {
            logger.error("Failed to upload file", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to upload file: " + ex.getMessage()));
        }
    }

    /**
     * ดาวน์โหลด/ดูรูปภาพ
     * GET /api/images/{filename}
     */
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path filePath = this.imageStorageLocation.resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                // ตรวจสอบ Content-Type
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException ex) {
            logger.error("File not found: {}", filename, ex);
            return ResponseEntity.notFound().build();
        } catch (IOException ex) {
            logger.error("Error reading file: {}", filename, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * ลบรูปภาพ
     * DELETE /api/images/{filename}
     */
    @DeleteMapping("/{filename:.+}")
    public ResponseEntity<Map<String, String>> deleteImage(@PathVariable String filename) {
        try {
            Path filePath = this.imageStorageLocation.resolve(filename).normalize();
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                logger.info("File deleted successfully: {}", filename);
                return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException ex) {
            logger.error("Failed to delete file: {}", filename, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete file: " + ex.getMessage()));
        }
    }
}
