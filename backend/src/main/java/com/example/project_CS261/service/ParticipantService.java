package com.example.project_CS261.service;

import com.example.project_CS261.dto.ParticipantRequest;
import com.example.project_CS261.model.EventParticipant;
import com.example.project_CS261.repository.EventParticipantRepository;
import com.example.project_CS261.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Service
public class ParticipantService {

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
}