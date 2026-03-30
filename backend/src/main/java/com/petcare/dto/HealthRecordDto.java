package com.petcare.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class HealthRecordDto {
    private Long id;
    private Long petId;
    private String recordType;
    private String description;
    private LocalDate date;
    private String provider;
    private Double weight;
    private Integer activityLevel;
    private Integer calories;
    private String vaccineName;
    private LocalDate nextDueDate;
    private String precautions;
    private String diagnosis;
    private String treatment;
}
