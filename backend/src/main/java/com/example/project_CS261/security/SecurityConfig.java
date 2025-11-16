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
import org.springframework.http.HttpMethod;

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
                .csrf(csrf -> csrf.disable())                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints - ไม่ต้อง login
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/admin/login").permitAll()  // Admin login ต้อง public

                        // Events - Public (ดูได้ไม่ต้อง login)
                        .requestMatchers("/api/events", "/api/events/{id}", "/api/events/cards/**", "/api/events/search/**", "/api/events/category/**").permitAll()

                        // Favorite user ดูได้
                        .requestMatchers("/api/favorites/**").authenticated()

                        // Images - Public
                        .requestMatchers("/api/images/**", "/images/**", "/static/**").permitAll()

                        // Swagger UI - Public
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-resources/**", "/swagger-ui.html").permitAll()

                        // Event Popularity - Public
                        .requestMatchers("/api/events/popularity/**").permitAll()


                        // ทางด่วน Admin
                        .requestMatchers(HttpMethod.POST, "/api/events").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/events/{id}").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/admin/events/{eventId}/participants/upload").permitAll()


                        // Protected endpoints - ต้อง login
                        // Favorites
                        .requestMatchers("/api/favorites/**").authenticated()

                        // Participants
                        .requestMatchers("/api/participants/**").authenticated()

                        // Notifications
                        .requestMatchers("/api/notifications/**").authenticated()

                        // Feedback
                        .requestMatchers("/api/feedback/**").authenticated()

                        // Admin endpoints - ต้องเป็น Admin (Coming soon)
                        // .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // All other requests require authentication
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