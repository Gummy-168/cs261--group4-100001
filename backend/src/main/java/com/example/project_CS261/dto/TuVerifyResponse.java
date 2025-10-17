package com.example.project_CS261.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class TuVerifyResponse {
    private boolean status;
    private String message;
    private String type;
    private String username;
    @JsonProperty("displayname_th")
    private String displaynameTh;
    @JsonProperty("displayname_en")
    private String displaynameEn;
    private String email;
    private String department;
    private String faculty;
}
