package com.petcare.dto;

import com.petcare.entity.Appointment.Status;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentDto {
    private Long id;

    @NotNull(message = "Pet ID is required")
    private Long petId;

    private String petName;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    private String doctorName;

    @NotNull(message = "Appointment date and time is required")
    @Future(message = "Appointment must be in the future")
    private LocalDateTime dateTime;

    private Status status;

    private String reason;
    private String petType;
    private String petBreed;
    private Integer petAge;
    private String ownerName;
}
