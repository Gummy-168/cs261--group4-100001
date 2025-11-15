package com.example.project_CS261.service;

import com.example.project_CS261.dto.ParticipantRequest;
import com.example.project_CS261.model.EventParticipant;
import com.example.project_CS261.repository.EventParticipantRepository;
import com.example.project_CS261.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;


import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;

import com.example.project_CS261.model.Event;
import com.example.project_CS261.exception.ResourceNotFoundException;


@Service
public class ParticipantService {
    @Autowired
    private final EventParticipantRepository participantRepository;
    private final EventRepository eventRepository;

    public ParticipantService(EventParticipantRepository participantRepository,
                              EventRepository eventRepository) {
        this.participantRepository = participantRepository;
        this.eventRepository = eventRepository;
    }

    @Transactional
    public List<EventParticipant> uploadParticipants(Long eventId, MultipartFile file, String approvedBy) {
        if (!eventRepository.existsById(eventId)) {
            throw new IllegalArgumentException("Event not found: " + eventId);
        }

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.endsWith(".csv") && !filename.endsWith(".xlsx"))) {
            throw new IllegalArgumentException("Only .csv or .xlsx files supported");
        }

        List<EventParticipant> participants = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isFirstLine = true;
            int lineNumber = 0;

            while ((line = reader.readLine()) != null) {
                lineNumber++;

                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }

                // Skip empty lines
                if (line.trim().isEmpty()) {
                    continue;
                }

                String[] data = line.split(",");

                if (data.length >= 2) {
                    String username = data[0].trim();
                    String studentName = data[1].trim();
                    String email = data.length > 2 ? data[2].trim() : null;

                    // Validate username is not empty
                    if (username.isEmpty()) {
                        throw new IllegalArgumentException("Empty username at line " + lineNumber);
                    }

                    // Validate student name is not empty
                    if (studentName.isEmpty()) {
                        throw new IllegalArgumentException("Empty student name at line " + lineNumber);
                    }

                    // Skip if already exists
                    if (participantRepository.existsByEventIdAndUsername(eventId, username)) {
                        continue;
                    }

                    EventParticipant participant = new EventParticipant();
                    participant.setEventId(eventId);
                    participant.setUsername(username);
                    participant.setStudentName(studentName);
                    participant.setEmail(email);
                    participant.setApprovedBy(approvedBy);
                    participant.setCanReview(true); // อนุญาตให้รีวิว

                    participants.add(participant);
                }
            }

            if (participants.isEmpty()) {
                throw new IllegalArgumentException("No valid participants found in file");
            }

            return participantRepository.saveAll(participants);

        } catch (Exception e) {
            throw new RuntimeException("Cannot read file: " + e.getMessage());
        }
    }

    public List<EventParticipant> getAllParticipants(Long eventId) {
        return participantRepository.findByEventId(eventId);
    }

    public EventParticipant addParticipant(Long eventId, ParticipantRequest request, String approvedBy) {
        if (!eventRepository.existsById(eventId)) {
            throw new IllegalArgumentException("Event not found: " + eventId);
        }

        if (participantRepository.existsByEventIdAndUsername(eventId, request.getUsername())) {
            throw new IllegalArgumentException("Participant already exists");
        }

        EventParticipant participant = new EventParticipant();
        participant.setEventId(eventId);
        participant.setUsername(request.getUsername());
        participant.setStudentName(request.getStudentName());
        participant.setEmail(request.getEmail());
        participant.setApprovedBy(approvedBy);
        participant.setCanReview(true); // อนุญาตให้รีวิว

        return participantRepository.save(participant);
    }

    public EventParticipant updateParticipant(Long participantId, ParticipantRequest request) {
        EventParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found"));

        participant.setStudentName(request.getStudentName());
        participant.setEmail(request.getEmail());

        return participantRepository.save(participant);
    }

    public void deleteParticipant(Long participantId) {
        if (!participantRepository.existsById(participantId)) {
            throw new IllegalArgumentException("Participant not found");
        }
        participantRepository.deleteById(participantId);
    }

    /**
     * ดึงรายการ Events ที่ User ลงทะเบียนแล้ว
     * @param username - username ของ user
     * @return List of EventParticipant
     */
    public List<EventParticipant> getUserParticipations(String username) {
        return participantRepository.findByUsername(username);
    }

    /**
     * U12: Logic การประมวลผลไฟล์ CSV และบันทึกผู้เข้าร่วม
     * @param eventId ID ของ Event
     * @param file ไฟล์ .csv ที่อัปโหลด
     * @throws IOException
     */
    public void uploadParticipantsFromCsv(Long eventId, MultipartFile file) throws IOException {

        // 1. ค้นหา Event หลัก
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        List<EventParticipant> participantsToSave = new ArrayList<>();

        // 2. ใช้ try-with-resources เพื่อเปิด Reader และ Parser
        try (BufferedReader fileReader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(fileReader,
                     CSVFormat.DEFAULT.withHeader("username", "student_name", "email") // ตรงตาม Spec U12
                             .withFirstRecordAsHeader()  // บอกว่าแถวแรกคือ Header
                             .withIgnoreHeaderCase()
                             .withTrim())) {

            // 3. วน Loop อ่านข้อมูลทีละแถว
            for (CSVRecord csvRecord : csvParser) {
                String username = csvRecord.get("username");
                String studentName = csvRecord.get("student_name");
                String email = csvRecord.get("email");

                // (ป้องกัน Error) ข้ามแถวที่ข้อมูล username ว่างเปล่า
                if (username == null || username.isEmpty()) {
                    continue;
                }

                // 4. สร้าง Object
                EventParticipant participant = new EventParticipant();
                participant.setEventId(event.getId());
                participant.setUsername(username); // หรือ set User ถ้าคุณเชื่อมตาราง User
                participant.setStudentName(studentName);
                participant.setEmail(email);

                // กำหนดสิทธิ์ให้รีวิวได้ ตาม SQL 'add_can_review_column.sql'
                participant.setCanReview(true);

                participantsToSave.add(participant);
            }

            // 5. บันทึกข้อมูลทั้งหมดลง DB ในครั้งเดียว (ประสิทธิภาพดีกว่า)
            if (!participantsToSave.isEmpty()) {
                participantRepository.saveAll(participantsToSave);
            }
        }
    }
}