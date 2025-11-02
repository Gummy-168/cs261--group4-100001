package com.example.project_CS261.controller;

import com.example.project_CS261.dto.FavoriteDTO;
import com.example.project_CS261.model.Favorite;
import com.example.project_CS261.service.FavoriteService;
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

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @PostMapping
    @Operation(summary = "Add favorite", description = "Add an event to user's favorites (requires authentication)")
    public ResponseEntity<Favorite> addFavorite(@RequestBody FavoriteDTO dto) {
        Favorite favorite = favoriteService.addFavorite(dto.getUserId(), dto.getEventId());
        return ResponseEntity.ok(favorite);
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get user favorites", description = "Get all favorite events for a user (requires authentication)")
    public ResponseEntity<List<Favorite>> getFavoritesByUser(@PathVariable Long userId) {
        List<Favorite> favorites = favoriteService.getFavoritesByUser(userId);
        return ResponseEntity.ok(favorites);
    }

    @DeleteMapping
    @Operation(summary = "Remove favorite", description = "Remove an event from user's favorites (requires authentication)")
    public ResponseEntity<Void> removeFavorite(@RequestBody FavoriteDTO dto) {
        favoriteService.removeFavorite(dto.getUserId(), dto.getEventId());
        return ResponseEntity.noContent().build();
    }
}
