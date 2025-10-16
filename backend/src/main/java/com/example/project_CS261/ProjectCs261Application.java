package com.example.project_CS261;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class ProjectCs261Application {
    public static void main(String[] args) {
        SpringApplication.run(ProjectCs261Application.class, args);
    }
}