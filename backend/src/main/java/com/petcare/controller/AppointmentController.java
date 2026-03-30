package com.petcare.controller;

import com.petcare.dto.AppointmentDto;
import com.petcare.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<AppointmentDto> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    @GetMapping("/my-appointments")
    @PreAuthorize("hasRole('USER')")
    public List<AppointmentDto> getMyAppointments(@AuthenticationPrincipal UserDetails userDetails) {
        return appointmentService.getAppointmentsByUserEmail(userDetails.getUsername());
    }

    @GetMapping("/doctor/{doctorId}")
    public List<AppointmentDto> getAppointmentsByDoctor(@PathVariable Long doctorId) {
        return appointmentService.getAppointmentsByDoctor(doctorId);
    }

    @GetMapping("/my-appointments-doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public List<AppointmentDto> getMyDoctorAppointments(@AuthenticationPrincipal UserDetails userDetails) {
        return appointmentService.getAppointmentsByDoctorEmail(userDetails.getUsername());
    }

    @PostMapping("/book")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> bookAppointment(@RequestBody AppointmentDto appointmentDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            AppointmentDto booked = appointmentService.bookAppointment(appointmentDto, userDetails.getUsername());
            return ResponseEntity.ok(booked);
        } catch (com.petcare.exception.AppException e) {
            return ResponseEntity.status(e.getStatus()).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            AppointmentDto updated = appointmentService.updateStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.ok("Appointment cancelled successfully");
    }

    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> rescheduleAppointment(@PathVariable Long id, @RequestParam String dateTime) {
        try {
            AppointmentDto rescheduled = appointmentService.rescheduleAppointment(id, dateTime);
            return ResponseEntity.ok(rescheduled);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/upcoming")
    @PreAuthorize("hasRole('USER') or hasRole('DOCTOR')")
    public List<AppointmentDto> getUpcomingAppointments(@AuthenticationPrincipal UserDetails userDetails) {
        return appointmentService.getUpcomingAppointments(userDetails.getUsername());
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAnalytics() {
        return ResponseEntity.ok(appointmentService.getAnalytics());
    }
}