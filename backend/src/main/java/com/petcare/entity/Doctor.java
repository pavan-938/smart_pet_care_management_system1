package com.petcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String specialization;

    // Availability could be a complex object, implementing as String for simplicity
    // (e.g., "Mon-Fri 9AM-5PM")
    private String availability;

    private Double consultationFee;

    private Integer experienceYears;
    private String qualification;
    private Double rating = 4.5; // Default rating for new doctors

    @Column(length = 1000)
    private String bio;

    private String imageUrl;

    private String clinicAddress;
    
    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    public enum Status {
        PENDING, APPROVED, REJECTED
    }
}
