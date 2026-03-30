package com.petcare.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReminderDto {
    private Long id;
    private Long petId;
    private String title;
    private String description;
    private LocalDateTime reminderDate;
    private boolean completed;
}
