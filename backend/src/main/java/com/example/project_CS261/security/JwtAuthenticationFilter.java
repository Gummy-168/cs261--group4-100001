package com.example.project_CS261.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

import com.example.project_CS261.model.User;
import com.example.project_CS261.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails; // Import UserDetails (เผื่อไว้ แต่เราใช้ User)
import java.util.Optional; // 4. Import Optional

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository; // 5. เพิ่ม UserRepository

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) { // 6. แก้ Constructor
        this.jwtService = jwtService;
        this.userRepository = userRepository; // 7. เพิ่มการฉีด
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // Skip JWT validation for public endpoints
        String requestPath = request.getRequestURI();
        if (requestPath.startsWith("/api/auth/login") ||
            requestPath.startsWith("/swagger-ui") ||
            requestPath.startsWith("/v3/api-docs") ||
            requestPath.startsWith("/api/events/cards") ||
            requestPath.startsWith("/api/images")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check Authorization header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);

        try {
            username = jwtService.extractUsername(jwt);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // ดึง User ทั้งอ็อบเจ็กต์จาก DB
                Optional<User> userOptional = userRepository.findByUsername(username);

                if (userOptional.isPresent() && jwtService.validateToken(jwt)) {

                    User user = userOptional.get(); // ได้อ็อบเจ็กต์ User แล้ว

                    // 9. ⭐️⭐️⭐️ สร้าง Token โดยยัด "อ็อบเจ็กต์ User" เข้าไปแทน "String username" ⭐️⭐️⭐️
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user, // <-- ใส่ "user" (อ็อบเจ็กต์) เป็น Principal
                            null,
                            new ArrayList<>() // หรือ user.getAuthorities() ถ้าคุณทำ Role
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            logger.error("JWT validation error: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
