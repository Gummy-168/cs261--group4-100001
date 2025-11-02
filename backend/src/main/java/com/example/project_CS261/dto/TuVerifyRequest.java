package com.example.project_CS261.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TuVerifyRequest {
    @JsonProperty("UserName")
    private String userName;

    @JsonProperty("PassWord")
    private String passWord;
}
