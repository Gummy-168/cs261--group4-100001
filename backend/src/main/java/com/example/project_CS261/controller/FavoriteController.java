package com.example.project_CS261.controller;

import com.example.project_CS261.dto.FavoriteDTO;
import com.example.project_CS261.model.Favorite;
import com.example.project_CS261.service.FavoriteService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "http://localhost:5173")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @PostMapping
    public Favorite addFavorite(@RequestBody FavoriteDTO dto) {
        return favoriteService.addFavorite(dto.getUserId(), dto.getActivityId());
    }

    @GetMapping("/{userId}")
    public List<Favorite> getFavoritesByUser(@PathVariable Long userId) {
        return favoriteService.getFavoritesByUser(userId);
    }

    @DeleteMapping
    public void removeFavorite(@RequestBody FavoriteDTO dto) {
        favoriteService.removeFavorite(dto.getUserId(), dto.getActivityId());
    }
}
