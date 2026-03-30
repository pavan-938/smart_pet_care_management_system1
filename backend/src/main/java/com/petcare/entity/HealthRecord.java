package com.petcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "health_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    private String recordType; // VACCINATION, CHECKUP, SURGERY, etc.
    private String description;
    private LocalDate date;
    private String provider; // Vet or Clinic name
    private Double weight; // Weight at the time of record
    private Integer activityLevel; // 1-10 scale
    private Integer calories; // Daily calorie intake

    @Column(columnDefinition = "TEXT")
    private String diagnosis;
    @Column(columnDefinition = "TEXT")
    private String treatment;

    // For vaccinations
    private String vaccineName;
    private LocalDate nextDueDate;
    private String precautions;
}
