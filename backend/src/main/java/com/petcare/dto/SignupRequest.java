package com.petcare.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank
    @Size(min = 3, max = 50)
    private String name;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;
    
    private String role; // "user", "doctor" (admin created manually usually)

    // Optional fields for Doctor role
    private String specialization;
    private Integer experienceYears;
    private String clinicAddress;
    private Double consultationFee;
}
