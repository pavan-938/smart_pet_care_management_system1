package com.petcare.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PetDto {
    private Long id;
    private Long ownerId;
    private String ownerName;
    @NotBlank(message = "Pet name is required")
    private String name;

    @NotBlank(message = "Species is required")
    private String species;

    private String breed;

    @Min(0)
    private Integer age;

    private String gender;

    @DecimalMin("0.0")
    private Double weight;

    private String details;
}
