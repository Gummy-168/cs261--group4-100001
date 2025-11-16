package com.example.project_CS261.controller;

import com.example.project_CS261.model.Favorite;
import com.example.project_CS261.service.FavoriteService;
// ⭐️ ----- [เอา DTO กลับมา] ----- ⭐️
import com.example.project_CS261.dto.FavoriteDTO;
import com.example.project_CS261.model.User;
import com.example.project_CS261.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.Map;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@Tag(name = "Favorites", description = "Favorite Management API")
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final UserRepository userRepository;

    public FavoriteController(FavoriteService favoriteService, UserRepository userRepository) {
        this.favoriteService = favoriteService;
        this.userRepository = userRepository;
    }

    /**
     * Helper (อันเดิม)
     */
    private User getLoggedInUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return null;
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    // ⭐️ ----- [1. API ตัวใหม่ (ที่ถูกต้อง)] ----- ⭐️
    // (ตัวนี้เก็บไว้ เผื่อ Frontend แก้ตามในอนาคต)
    @PostMapping("/{eventId}")
    @Operation(summary = "Add favorite (by PathVariable)", description = "Add an event to user's favorites (requires authentication)")
    public ResponseEntity<?> addFavorite(@PathVariable Long eventId) {

        User user = getLoggedInUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "กรุณาล็อกอิน"));
        }
        try {
            Favorite favorite = favoriteService.addFavorite(user.getId(), eventId);
            return ResponseEntity.ok(favorite);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ⭐️ ----- [2. API ตัวเก่า (ที่ Frontend เรียก)] ----- ⭐️
    // (เราเพิ่มตัวนี้กลับมา เพื่อแก้ NoResourceFoundException)
    @PostMapping
    @Operation(summary = "Add favorite (by RequestBody)", description = "DEPRECATED: Add an event via RequestBody to support old frontend calls.")
    public ResponseEntity<?> addFavoriteLegacy(@RequestBody FavoriteDTO dto) {

        User user = getLoggedInUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "กรุณาล็อกอิน"));
        }

        try {
            // เราใช้ user.getId() (แก้ null)
            // แต่เรา "จำใจ" ต้องใช้ dto.getEventId() (ที่เรารู้ว่ามันบั๊กเป็น 1 ตลอด)
            Favorite favorite = favoriteService.addFavorite(user.getId(), dto.getEventId());
            return ResponseEntity.ok(favorite);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    /**
     * Method นี้ ถูกต้องแล้ว
     */
    @GetMapping("/{userId}")
    @Operation(summary = "Get user favorites", description = "Get all favorite events for a user (requires authentication)")
    public ResponseEntity<?> getFavoritesByUser(@PathVariable Long userId) {

        User user = getLoggedInUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "กรุณาล็อกอิน"));
        }
        try {
            List<Favorite> favorites = favoriteService.getFavoritesByUser(user.getId());
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Method นี้ ถูกต้องแล้ว
     */
    @DeleteMapping("/{eventId}")
    @Operation(summary = "Remove favorite", description = "Remove an event from user's favorites (requires authentication)")
    public ResponseEntity<?> removeFavorite(@PathVariable Long eventId) {

        User user = getLoggedInUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "กรุณาล็อกอิน"));
        }
        try {
            favoriteService.removeFavorite(user.getId(), eventId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}