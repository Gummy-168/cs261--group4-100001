package com.example.project_CS261.service;

import com.example.project_CS261.model.Event;
import com.example.project_CS261.model.NotificationQueue;
import com.example.project_CS261.model.User;
import com.example.project_CS261.repository.EventRepository;
import com.example.project_CS261.repository.NotificationQueueRepository;
import com.example.project_CS261.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final JavaMailSender emailSender;
    private final NotificationQueueRepository notificationQueueRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    @Value("${app.email.from}")
    private String fromEmail;

    public NotificationService(JavaMailSender emailSender, NotificationQueueRepository notificationQueueRepository, UserRepository userRepository, EventRepository eventRepository) {
        this.emailSender = emailSender;
        this.notificationQueueRepository = notificationQueueRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
    }

    /**
     * Method นี้จะทำงานอัตโนมัติทุกวันตอนตี 1
     * cron = "วินาที นาที ชั่วโมง วัน เดือน วันในสัปดาห์"
     * "59 59 23 * * ?" = 23:59:59 ทุกวัน
     */
    @Scheduled(cron = "59 59 23 * * ?")
    public void sendScheduledNotifications() {
        logger.info("Executing scheduled notification job at 23:59:59...");

        // 1. ค้นหารายการแจ้งเตือนทั้งหมดที่ถึงเวลาส่ง และยังไม่ได้ส่ง
        List<NotificationQueue> notificationsToSend = notificationQueueRepository.findByStatusAndSendAtBefore("PENDING", LocalDateTime.now());

        // 2. วนลูปเพื่อส่ง Email
        for (NotificationQueue nq : notificationsToSend) {
            // 2.1 ดึงข้อมูล User เพื่อเอา Email
            User user = userRepository.findById(nq.getUserId()).orElse(null);
            // 2.2 ดึงข้อมูล Event เพื่อเอาชื่อกิจกรรม
            Event event = eventRepository.findById(nq.getEventId()).orElse(null);

            if (user != null && event != null && user.getEmail() != null) {
                String subject = "แจ้งเตือนกิจกรรมใกล้เริ่ม: " + event.getTitle();
                String body = "สวัสดีคุณ " + user.getDisplaynameTh() + ",\n\n" +
                        "กิจกรรม '" + event.getTitle() + "' ที่คุณสนใจ กำลังจะเริ่มในอีก 24 ชั่วโมงข้างหน้า!\n\n" +
                        "รายละเอียด: " + event.getDescription();

                sendEmail(user.getEmail(), subject, body);

                // 2.3 อัปเดตสถานะเป็น SENT เพื่อไม่ให้ส่งซ้ำ
                nq.setStatus("SENT");
                notificationQueueRepository.save(nq);
            }
        }
        logger.info("Notification job completed. Sent {} notifications.", notificationsToSend.size());
    }

    /**
     * Method สำหรับส่ง Email
     */
    public void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            emailSender.send(message);
            logger.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            logger.error("Error sending email to {}: {}", to, e.getMessage());
        }
    }

    public void sendRealTimeUpdateNotification(User user, Event event) {
        String subject = "ด่วน: กิจกรรม '" + event.getTitle() + "' มีการเปลี่ยนแปลง";
        String body = "สวัสดีคุณ " + user.getDisplaynameTh() + ",\n\n" +
                "กิจกรรม '" + event.getTitle() + "' ที่คุณสนใจมีการอัปเดตข้อมูลใหม่\n" +
                "กรุณาตรวจสอบรายละเอียดล่าสุด";
        sendEmail(user.getEmail(), subject, body);
    }
}