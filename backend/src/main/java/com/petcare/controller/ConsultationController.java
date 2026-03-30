package com.petcare.controller;

import com.petcare.dto.ConsultationDto;
import com.petcare.dto.SendMeetLinkRequest;
import com.petcare.security.UserDetailsImpl;
import com.petcare.service.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping("/request")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ConsultationDto> requestConsultation(
            @RequestBody ConsultationDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(consultationService.requestConsultation(dto, userDetails.getEmail()));
    }

    @PutMapping("/{id}/accept")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ConsultationDto> acceptConsultation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(consultationService.acceptConsultation(id, userDetails.getEmail()));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ConsultationDto> rejectConsultation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(consultationService.rejectConsultation(id, userDetails.getEmail()));
    }

    /**
     * Doctor manually sends (or resends) the Google Meet link + optional prescription note
     * to the patient via email. Also updates the stored meet link if a new one is supplied.
     */
    @PostMapping("/{id}/send-link")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> sendMeetLink(
            @PathVariable Long id,
            @RequestBody SendMeetLinkRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            consultationService.sendMeetLinkToUser(id, request, userDetails.getEmail());
            return ResponseEntity.ok("Meet link sent successfully to the patient.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<ConsultationDto>> getUserConsultations(@PathVariable Long userId) {
        return ResponseEntity.ok(consultationService.getUserConsultations(userId));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<ConsultationDto>> getMyConsultations(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(consultationService.getUserConsultationsByEmail(userDetails.getEmail()));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('USER') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<ConsultationDto>> getDoctorConsultations(@PathVariable Long doctorId) {
        return ResponseEntity.ok(consultationService.getDoctorConsultations(doctorId));
    }
}
