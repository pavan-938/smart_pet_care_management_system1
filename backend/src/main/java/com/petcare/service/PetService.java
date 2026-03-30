package com.petcare.service;

import com.petcare.dto.PetDto;
import com.petcare.entity.Pet;
import java.util.List;

public interface PetService {
    List<PetDto> getAllPets();

    List<PetDto> getPetsByOwner(Long ownerId);

    List<PetDto> getPetsByOwnerEmail(String email);

    PetDto getPetById(Long id);

    Pet savePet(Pet pet);

    PetDto addPet(PetDto petDto, String ownerEmail);

    void deletePet(Long id);

    long getCount();
}
