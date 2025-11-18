package com.example.project_CS261.service;

import com.example.project_CS261.dto.ParticipantRequest;
import com.example.project_CS261.exception.ResourceNotFoundException;
import com.example.project_CS261.model.Event;
import com.example.project_CS261.model.EventParticipant;
import com.example.project_CS261.repository.EventParticipantRepository;
import com.example.project_CS261.repository.EventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class ParticipantService {

    private static final Logger logger = LoggerFactory.getLogger(ParticipantService.class);

    private final EventParticipantRepository participantRepository;
    private final EventRepository eventRepository;

    public ParticipantService(EventParticipantRepository participantRepository,
                              EventRepository eventRepository) {
        this.participantRepository = participantRepository;
        this.eventRepository = eventRepository;
    }

    /**
     * Upload รายชื่อผู้เข้าร่วมจากไฟล์ CSV
     *
     * รูปแบบไฟล์ที่คาดหวัง:
     *   index,student_name,email1
     *   1,6709xxxxx,xxx@dome.tu.ac.th
     *
     * พฤติกรรม:
     *  - ลบผู้เข้าร่วมเดิมของ event นี้ทั้งหมดก่อน (overwrite)
     *  - บังคับให้ username = student_name
     *  - กันชื่อซ้ำกันในไฟล์เดียวกัน (ถ้าซ้ำ ข้าม)
     */
    @Transactional
    public List<EventParticipant> uploadParticipants(Long eventId, MultipartFile file, String approvedBy) {
        logger.info("[Participant][UPLOAD] eventId={}, approvedBy={}, filename={}",
                eventId, approvedBy, file != null ? file.getOriginalFilename() : null);

        // 1) เช็กว่า event มีจริงไหม
        if (!eventRepository.existsById(eventId)) {
            throw new IllegalArgumentException("Event not found: " + eventId);
        }

        // 2) เช็กไฟล์
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.endsWith(".csv") && !filename.endsWith(".xlsx"))) {
            throw new IllegalArgumentException("Only .csv or .xlsx files supported");
        }

        // 3) ลบ participants เก่าของ event นี้ก่อน (กัน duplicate key)
        long countBefore = participantRepository.countByEventId(eventId);
        logger.info("[Participant][UPLOAD] delete old participants for eventId={}, countBefore={}",
                eventId, countBefore);
        participantRepository.deleteByEventId(eventId);
        long countAfter = participantRepository.countByEventId(eventId);
        logger.info("[Participant][UPLOAD] delete done for eventId={}, countAfter={}", eventId, countAfter);

        List<EventParticipant> participants = new ArrayList<>();
        Set<String> usernamesInFile = new HashSet<>();

        try (BufferedReader reader =
                     new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            int lineNumber = 0;

            // ข้าม header 1 บรรทัด (index,student_name,email1)
            String header = reader.readLine();
            lineNumber++;
            if (header == null) {
                throw new IllegalArgumentException("CSV file has no data");
            }

            while ((line = reader.readLine()) != null) {
                lineNumber++;

                if (line.trim().isEmpty()) {
                    continue; // ข้ามบรรทัดว่าง
                }

                String[] data = line.split(",");

                if (data.length < 2) {
                    logger.warn("[Participant][UPLOAD] invalid row at line {}: {}", lineNumber, line);
                    continue;
                }

                // col0 = index (ไม่ใช้), col1 = student_name, col2 (optional) = email1
                String studentName = data[1].trim();
                String email = data.length > 2 ? data[2].trim() : null;

                // username = student_name
                String username = studentName;

                if (username.isEmpty()) {
                    logger.warn("[Participant][UPLOAD] empty username at line {}, skip", lineNumber);
                    continue;
                }

                // กันชื่อซ้ำในไฟล์เดียวกัน
                if (!usernamesInFile.add(username)) {
                    logger.warn("[Participant][UPLOAD] duplicated username in file, skip: {}, line={}",
                            username, lineNumber);
                    continue;
                }

                EventParticipant participant = new EventParticipant();
                participant.setEventId(eventId);
                participant.setUsername(username);
                participant.setStudentName(studentName);
                participant.setEmail(email);
                participant.setApprovedBy(approvedBy);
                participant.setCanReview(true);

                participants.add(participant);
            }

            if (participants.isEmpty()) {
                throw new IllegalArgumentException("No valid participants found in file");
            }

            logger.info("[Participant][UPLOAD] Saving {} participants for eventId={}",
                    participants.size(), eventId);

            return participantRepository.saveAll(participants);

        } catch (IOException e) {
            logger.error("[Participant][UPLOAD] IO error while reading file", e);
            throw new RuntimeException("Cannot read file: " + e.getMessage());
        } catch (Exception e) {
            logger.error("[Participant][UPLOAD] Unexpected error", e);
            throw new RuntimeException("Cannot read file: " + e.getMessage());
        }
    }

    // ===== methods อื่น ๆ เดิม =====

    public List<EventParticipant> getAllParticipants(Long eventId) {
        logger.debug("[Participant][LIST] eventId={}", eventId);
        return participantRepository.findByEventId(eventId);
    }

    public EventParticipant addParticipant(Long eventId, ParticipantRequest request, String approvedBy) {
        logger.info("[Participant][ADD] eventId={}, username={}", eventId, request.getUsername());

        if (!eventRepository.existsById(eventId)) {
            throw new IllegalArgumentException("Event not found: " + eventId);
        }

        String username = request.getStudentName(); // username = student_name

        if (participantRepository.existsByEventIdAndUsername(eventId, username)) {
            throw new IllegalArgumentException("Participant already exists");
        }

        EventParticipant participant = new EventParticipant();
        participant.setEventId(eventId);
        participant.setUsername(username);
        participant.setStudentName(request.getStudentName());
        participant.setEmail(request.getEmail());
        participant.setApprovedBy(approvedBy);
        participant.setCanReview(true);

        return participantRepository.save(participant);
    }

    public EventParticipant updateParticipant(Long participantId, ParticipantRequest request) {
        logger.info("[Participant][UPDATE] participantId={}", participantId);

        EventParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found"));

        participant.setStudentName(request.getStudentName());
        participant.setEmail(request.getEmail());

        return participantRepository.save(participant);
    }

    public void deleteParticipant(Long participantId) {
        logger.info("[Participant][DELETE] participantId={}", participantId);

        if (!participantRepository.existsById(participantId)) {
            throw new IllegalArgumentException("Participant not found");
        }
        participantRepository.deleteById(participantId);
    }

    public List<EventParticipant> getUserParticipations(String username) {
        logger.debug("[Participant][USER_PARTICIPATIONS] username={}", username);
        return participantRepository.findByUsername(username);
    }
}
