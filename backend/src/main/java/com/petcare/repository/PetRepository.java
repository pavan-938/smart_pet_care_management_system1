package com.petcare.repository;

import com.petcare.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByOwnerId(Long ownerId);
    boolean existsByOwnerId(Long ownerId);
}
