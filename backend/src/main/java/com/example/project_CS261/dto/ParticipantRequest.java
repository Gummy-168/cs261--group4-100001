package com.example.project_CS261.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ParticipantRequest {
    private String username;
    private String studentName;
    private String email;

    public ParticipantRequest() {}

    public ParticipantRequest(String username, String studentName, String email) {
        this.username = username;
        this.studentName = studentName;
        this.email = email;
    }

}
