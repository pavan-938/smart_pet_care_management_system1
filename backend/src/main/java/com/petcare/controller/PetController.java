package com.petcare.controller;

import com.petcare.dto.PetDto;
import com.petcare.entity.Pet;
import com.petcare.service.PetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/pets")
public class PetController {

    @Autowired
    private PetService petService;

    @GetMapping
    public List<PetDto> getAllPets() {
        return petService.getAllPets();
    }

    @GetMapping("/user/{userId}")
    public List<PetDto> getPetsByUser(@PathVariable Long userId) {
        return petService.getPetsByOwner(userId);
    }

    @GetMapping("/my-pets")
    @PreAuthorize("hasRole('USER')")
    public List<PetDto> getMyPets(@AuthenticationPrincipal UserDetails userDetails) {
        return petService.getPetsByOwnerEmail(userDetails.getUsername());
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> addPet(@Valid @RequestBody PetDto petDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        PetDto savedPet = petService.addPet(petDto, userDetails.getUsername());
        return ResponseEntity.ok(savedPet);
    }

    @GetMapping("/id/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('DOCTOR')")
    public ResponseEntity<PetDto> getPetById(@PathVariable Long id) {
        PetDto pet = petService.getPetById(id);
        return ResponseEntity.ok(pet);
    }
}
