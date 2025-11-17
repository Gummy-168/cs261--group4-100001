package com.example.project_CS261.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod; // ⭐️ ต้องมี Import นี้

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // --------------------------------------------------------------------
                        // 1. ENDPOINTS สาธารณะ (ไม่ต้อง Login)
                        // --------------------------------------------------------------------

                        // การ Login
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/admin/login").permitAll()

                        // Swagger Docs
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-resources/**", "/swagger-ui.html").permitAll()

                        // การ "ดู" (GET) ข้อมูลสาธารณะ
                        .requestMatchers(HttpMethod.GET, "/api/events", "/api/events/{id}", "/api/events/cards/**", "/api/events/search/**", "/api/events/category/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/events/popularity/**").permitAll()
                        // ⭐️ นี่คือข้อที่ทำให้รูปแสดงได้: อนุญาตให้ "ทุกคน" (GET) ดูรูปได้
                        .requestMatchers(HttpMethod.GET, "/api/images/**", "/images/**", "/static/**").permitAll()

                        // --------------------------------------------------------------------
                        // 2. USER ENDPOINTS (ต้อง Login ด้วย Token ผู้ใช้ทั่วไป)
                        // --------------------------------------------------------------------
                        .requestMatchers("/api/favorites/**").authenticated()
                        .requestMatchers("/api/participants/**").authenticated()
                        .requestMatchers("/api/notifications/**").authenticated()
                        .requestMatchers("/api/feedback/**").authenticated()

                        // --------------------------------------------------------------------
                        // 3. ADMIN ENDPOINTS (ต้องมี Role "ADMIN")
                        // --------------------------------------------------------------------
                        // ⭐️ [แก้ไข] เปลี่ยนจาก .permitAll() เป็น .hasRole("ADMIN") ทั้งหมด
                        .requestMatchers(HttpMethod.POST, "/api/events").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/events/{id}").hasRole("ADMIN") // ⭐️ [เพิ่ม] การแก้ไข (PUT) ก็ควรเป็น Admin
                        .requestMatchers(HttpMethod.DELETE, "/api/events/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/admin/events/{eventId}/participants/upload").hasRole("ADMIN")

                        // ⭐️⭐️⭐️ [จุดที่แก้ปัญหา] เพิ่มกฎสำหรับ Admin อัพโหลด/ลบรูป ⭐️⭐️⭐️
                        .requestMatchers(HttpMethod.POST, "/api/images/upload").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/images/**").hasRole("ADMIN")

                        // ⭐️ [เปิดใช้งาน] กฎสำหรับ Admin ที่เหลือ
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // --------------------------------------------------------------------
                        // 4. กฎข้อสุดท้าย
                        // --------------------------------------------------------------------
                        // Request อื่นๆ ที่ไม่เข้าเงื่อนไขข้างบนเลย ต้อง Login (เช่น /api/user/me)
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ✅ Allow specific origins for security
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:5173",      // Vite dev server
                "http://localhost:3000",      // Alternative React port
                "http://127.0.0.1:5173",      // Alternative localhost
                "https://*.vercel.app",       // Vercel deployment
                "https://*.netlify.app"       // Netlify deployment
        ));

        // ✅ Allow necessary HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));

        // ✅ Allow all headers
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // ✅ Expose Authorization header to frontend
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));

        // ✅ Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);

        // ✅ Cache preflight requests for 1 hour
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}