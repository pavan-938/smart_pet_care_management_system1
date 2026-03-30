package com.petcare.dto;

import com.petcare.entity.Consultation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationDto {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long doctorId;
    private String doctorName;
    private String petName;
    private String petType;
    private String problemDescription;
    private String meetingLink;
    private LocalDateTime meetingTime;
    private Consultation.Status status;
    private LocalDateTime createdAt;
}
