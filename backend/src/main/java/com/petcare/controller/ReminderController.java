package com.petcare.controller;

import com.petcare.dto.ReminderDto;
import com.petcare.service.ReminderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    @Autowired
    private ReminderService reminderService;

    @GetMapping("/pet/{petId}")
    @PreAuthorize("hasRole('USER')")
    public List<ReminderDto> getRemindersByPet(@PathVariable Long petId) {
        return reminderService.getRemindersByPet(petId);
    }

    @GetMapping("/pet/{petId}/pending")
    @PreAuthorize("hasRole('USER')")
    public List<ReminderDto> getPendingRemindersByPet(@PathVariable Long petId) {
        return reminderService.getPendingRemindersByPet(petId);
    }

    @GetMapping("/my-reminders")
    @PreAuthorize("hasRole('USER')")
    public List<ReminderDto> getMyReminders(@AuthenticationPrincipal UserDetails userDetails) {
        return reminderService.getMyPendingReminders(userDetails.getUsername());
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> addReminder(@RequestBody ReminderDto reminderDto) {
        ReminderDto saved = reminderService.addReminder(reminderDto);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> markAsCompleted(@PathVariable Long id) {
        ReminderDto updated = reminderService.markAsCompleted(id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deleteReminder(@PathVariable Long id) {
        reminderService.deleteReminder(id);
        return ResponseEntity.ok().build();
    }
}
