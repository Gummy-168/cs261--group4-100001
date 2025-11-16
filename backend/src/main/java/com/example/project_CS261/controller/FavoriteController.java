package com.example.project_CS261.controller;

import com.example.project_CS261.model.Favorite;
import com.example.project_CS261.model.User;
import com.example.project_CS261.service.FavoriteService;
import com.example.project_CS261.dto.FavoriteDTO; // DTO ยังต้องใช้สำหรับ POST
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@Tag(name = "Favorites", description = "Favorite Management API")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @PostMapping
    @Operation(summary = "Add favorite", description = "Add an event to user's favorites (requires authentication)")
    public ResponseEntity<Favorite> addFavorite(@RequestBody FavoriteDTO dto,
                                                @AuthenticationPrincipal User user) {

        Favorite favorite = favoriteService.addFavorite(user.getId(), dto.getEventId());
        return ResponseEntity.ok(favorite);
    }

    @GetMapping
    @Operation(summary = "Get current user's favorites", description = "Get all favorite events for the *currently logged-in* user")
    public ResponseEntity<List<Favorite>> getFavoritesByUser(@AuthenticationPrincipal User user) {

        List<Favorite> favorites = favoriteService.getFavoritesByUser(user.getId());
        return ResponseEntity.ok(favorites);
    }

    @DeleteMapping("/{eventId}") // 1. แก้ไขตรงนี้: เพิ่ม /{eventId}
    @Operation(summary = "Remove favorite", description = "Remove an event from user's favorites (requires authentication)")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable Long eventId,         // 2. แก้ไขตรงนี้: รับ eventId จาก Path
            @AuthenticationPrincipal User user  // 3. แก้ไขตรงนี้: ยังคงรับ user จาก Token
    ) {

        // 4. แก้ไขตรงนี้: ใช้ eventId ที่ได้จาก Path
        favoriteService.removeFavorite(user.getId(), eventId);
        return ResponseEntity.noContent().build();
    }
}