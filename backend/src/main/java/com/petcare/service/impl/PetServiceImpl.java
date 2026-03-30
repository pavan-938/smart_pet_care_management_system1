package com.petcare.service.impl;

import com.petcare.dto.PetDto;
import com.petcare.entity.Pet;
import com.petcare.entity.User;
import com.petcare.exception.ResourceNotFoundException;
import com.petcare.repository.PetRepository;
import com.petcare.repository.UserRepository;
import com.petcare.service.PetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PetServiceImpl implements PetService {

    private final PetRepository petRepository;
    private final UserRepository userRepository;

    @Override
    public List<PetDto> getAllPets() {
        return petRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<PetDto> getPetsByOwner(Long ownerId) {
        return petRepository.findByOwnerId(ownerId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<PetDto> getPetsByOwnerEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Personal account for '" + email + "' was not found."));
        return petRepository.findByOwnerId(user.getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public PetDto getPetById(Long id) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Pet record with ID " + id + " does not exist in our database."));
        return convertToDto(pet);
    }

    @Override
    public Pet savePet(Pet pet) {
        return petRepository.save(pet);
    }

    @Override
    public PetDto addPet(PetDto petDto, String ownerEmail) {
        User user = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Authentication error: Owner session invalid."));

        Pet pet = new Pet();
        pet.setName(petDto.getName());
        pet.setSpecies(petDto.getSpecies());
        pet.setBreed(petDto.getBreed());
        pet.setAge(petDto.getAge());
        pet.setGender(petDto.getGender());
        pet.setWeight(petDto.getWeight());
        pet.setDetails(petDto.getDetails());
        pet.setOwner(user);

        Pet savedPet = petRepository.save(pet);
        return convertToDto(savedPet);
    }

    @Override
    public void deletePet(Long id) {
        if (!petRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete: Pet record not found.");
        }
        petRepository.deleteById(id);
    }

    @Override
    public long getCount() {
        return petRepository.count();
    }

    private PetDto convertToDto(Pet pet) {
        PetDto dto = new PetDto();
        dto.setId(pet.getId());
        if (pet.getOwner() != null) {
            dto.setOwnerId(pet.getOwner().getId());
            dto.setOwnerName(pet.getOwner().getName());
        }
        dto.setName(pet.getName());
        dto.setSpecies(pet.getSpecies());
        dto.setBreed(pet.getBreed());
        dto.setAge(pet.getAge());
        dto.setGender(pet.getGender());
        dto.setWeight(pet.getWeight());
        dto.setDetails(pet.getDetails());
        return dto;
    }
}
