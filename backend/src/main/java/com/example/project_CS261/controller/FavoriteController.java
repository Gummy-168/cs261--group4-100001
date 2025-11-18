package com.example.project_CS261.controller;

import com.example.project_CS261.dto.FavoriteDTO;
import com.example.project_CS261.model.Favorite;
import com.example.project_CS261.model.User;
import com.example.project_CS261.repository.UserRepository;
import com.example.project_CS261.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
     * ดึง user ที่ล็อกอินอยู่จาก SecurityContext
     */
    private User getLoggedInUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            return null;
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    // --------------------------------------------------------------------
    // 1) เพิ่ม Favorite แบบ PathVariable: POST /api/favorites/{eventId}
    // --------------------------------------------------------------------
    @PostMapping("/{eventId}")
    @Operation(summary = "Add favorite (by PathVariable)",
            description = "Add an event to user's favorites (requires authentication)")
    public ResponseEntity<?> addFavorite(@PathVariable Long eventId) {
        User user = getLoggedInUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "กรุณาล็อกอิน"));
        }

        try {
            Favorite favorite = favoriteService.addFavorite(user.getId(), eventId);
            return ResponseEntity.ok(favorite);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // --------------------------------------------------------------------
    // 2) เพิ่ม Favorite แบบ RequestBody (legacy): POST /api/favorites
    // --------------------------------------------------------------------
    @PostMapping
    @Operation(summary = "Add favorite (by RequestBody)",
            description = "DEPRECATED: Add an event via RequestBody to support old frontend calls.")
    public ResponseEntity<?> addFavoriteLegacy(@RequestBody FavoriteDTO dto) {
        User user = getLoggedInUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "กรุณาล็อกอิน"));
        }

        try {
            Favorite favorite = favoriteService.addFavorite(user.getId(), dto.getEventId());
            return ResponseEntity.ok(favorite);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // --------------------------------------------------------------------
    // 3) ดึงรายการ Favorite ของ user: GET /api/favorites/{userId}
    // --------------------------------------------------------------------
    @GetMapping("/{userId}")
    @Operation(summary = "Get user favorites",
            description = "Get all favorite events for a user (requires authentication)")
    public ResponseEntity<?> getFavoritesByUser(@PathVariable Long userId) {
        User user = getLoggedInUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "กรุณาล็อกอิน"));
        }

        try {
            // ใช้ user ที่ล็อกอินจริง ๆ ไม่ได้ใช้ userId จาก path
            List<Favorite> favorites = favoriteService.getFavoritesByUser(user.getId());
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // --------------------------------------------------------------------
    // 4) ลบ Favorite แบบ PathVariable: DELETE /api/favorites/{eventId}
    // --------------------------------------------------------------------
    @DeleteMapping("/{eventId}")
    @Operation(summary = "Remove favorite",
            description = "Remove an event from user's favorites (requires authentication)")
    public ResponseEntity<?> removeFavorite(@PathVariable Long eventId) {
        User user = getLoggedInUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "กรุณาล็อกอิน"));
        }

        try {
            favoriteService.removeFavorite(user.getId(), eventId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // --------------------------------------------------------------------
    // 5) ลบ Favorite แบบ RequestBody (legacy): DELETE /api/favorites
    //    ถ้า frontend เก่า ๆ ยังยิง DELETE /api/favorites อยู่
    // --------------------------------------------------------------------
    @DeleteMapping
    @Operation(summary = "Remove favorite (by RequestBody)",
            description = "DEPRECATED: Remove favorite via RequestBody for old frontend calls.")
    public ResponseEntity<?> removeFavoriteLegacy(@RequestBody FavoriteDTO dto) {
        User user = getLoggedInUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "กรุณาล็อกอิน"));
        }

        try {
            favoriteService.removeFavorite(user.getId(), dto.getEventId());
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
