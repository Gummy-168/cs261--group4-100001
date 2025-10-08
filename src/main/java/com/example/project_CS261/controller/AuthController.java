// ฟังก์ชัน login

package com.example.project_CS261.controller;

import com.example.project_CS261.dto.LoginRequest;
import com.example.project_CS261.dto.LoginResponse;
import com.example.project_CS261.model.User;
import com.example.project_CS261.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Optional<User> user = userRepository.findByEmail(loginRequest.getEmail());

        if (user.isPresent() && user.get().getPassword().equals(loginRequest.getPassword())) {
            LoginResponse response = new LoginResponse(
                    "Login successful",
                    user.get().getEmail(),
                    user.get().getName()
            );
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.badRequest().body("Invalid email or password");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }
}