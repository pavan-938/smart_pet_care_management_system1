package com.petcare.service;

import com.petcare.dto.ConsultationDto;
import com.petcare.dto.SendMeetLinkRequest;
import com.petcare.dto.SendMeetLinkRequest;
import com.petcare.entity.Consultation;
import com.petcare.entity.Doctor;
import com.petcare.entity.User;
import com.petcare.exception.AppException;
import com.petcare.repository.ConsultationRepository;
import com.petcare.repository.DoctorRepository;
import com.petcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsultationService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");

    private final ConsultationRepository consultationRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final GoogleCalendarService googleCalendarService;
    private final EmailService emailService;

    @Transactional
    public ConsultationDto requestConsultation(ConsultationDto dto, String requesterEmail) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (!user.getEmail().equalsIgnoreCase(requesterEmail)) {
            throw new AppException("You can only request a consultation for your own account.", HttpStatus.FORBIDDEN);
        }

        Consultation consultation = new Consultation();
        consultation.setUser(user);
        consultation.setDoctor(doctor);
        consultation.setPetName(dto.getPetName());
        consultation.setPetType(dto.getPetType());
        consultation.setProblemDescription(dto.getProblemDescription());
        consultation.setMeetingTime(dto.getMeetingTime());
        consultation.setStatus(Consultation.Status.PENDING);

        Consultation saved = consultationRepository.save(consultation);
        String dateStr = consultation.getMeetingTime().format(DATE_FORMATTER);
        String timeStr = consultation.getMeetingTime().format(TIME_FORMATTER);

        emailService.sendConsultationRequestToDoctor(
                doctor.getUser().getEmail(),
                doctor.getUser().getName(),
                user.getName(),
                user.getEmail(),
                consultation.getPetName(),
                consultation.getPetType(),
                dateStr,
                timeStr
        );

        emailService.sendConsultationRequestConfirmationToUser(
                user.getEmail(),
                user.getName(),
                doctor.getUser().getName(),
                consultation.getPetName(),
                dateStr,
                timeStr
        );

        return mapToDto(saved);
    }

    @Transactional
    public ConsultationDto acceptConsultation(Long id, String doctorEmail) {
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultation not found"));

        validateDoctorAccess(consultation, doctorEmail);
        ensurePendingStatus(consultation);

        String summary = "Consultation for " + consultation.getPetName() + " with Dr. " + consultation.getDoctor().getUser().getName();
        String meetLink = googleCalendarService.createGoogleMeetLink(
                summary,
                consultation.getMeetingTime(),
                consultation.getUser().getEmail(),
                consultation.getDoctor().getUser().getEmail()
        );

        if (meetLink == null || meetLink.isBlank()) {
            throw new AppException("A valid Google Meet link could not be generated for this consultation.", HttpStatus.BAD_GATEWAY);
        }

        consultation.setStatus(Consultation.Status.ACCEPTED);
        consultation.setMeetingLink(meetLink);
        Consultation saved = consultationRepository.save(consultation);

        String dateStr = consultation.getMeetingTime().format(DATE_FORMATTER);
        String timeStr = consultation.getMeetingTime().format(TIME_FORMATTER);

        emailService.sendConsultationAcceptedToUser(
                consultation.getUser().getEmail(),
                consultation.getUser().getName(),
                consultation.getDoctor().getUser().getName(),
                consultation.getPetName(),
                dateStr,
                timeStr,
                meetLink
        );

        emailService.sendConsultationAcceptedToDoctor(
                consultation.getDoctor().getUser().getEmail(),
                consultation.getDoctor().getUser().getName(),
                consultation.getUser().getName(),
                consultation.getUser().getEmail(),
                consultation.getPetName(),
                dateStr,
                timeStr,
                meetLink
        );

        return mapToDto(saved);
    }

    @Transactional
    public ConsultationDto rejectConsultation(Long id, String doctorEmail) {
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultation not found"));

        validateDoctorAccess(consultation, doctorEmail);
        ensurePendingStatus(consultation);

        consultation.setStatus(Consultation.Status.REJECTED);
        Consultation saved = consultationRepository.save(consultation);

        String dateStr = consultation.getMeetingTime().format(DATE_FORMATTER);
        String timeStr = consultation.getMeetingTime().format(TIME_FORMATTER);

        emailService.sendConsultationRejectedToUser(
                consultation.getUser().getEmail(),
                consultation.getUser().getName(),
                consultation.getDoctor().getUser().getName(),
                consultation.getPetName(),
                dateStr,
                timeStr
        );

        return mapToDto(saved);
    }

    @Transactional
    public void sendMeetLinkToUser(Long consultationId, SendMeetLinkRequest request, String doctorEmail) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new RuntimeException("Consultation not found"));

        validateDoctorAccess(consultation, doctorEmail);

        if (consultation.getStatus() == Consultation.Status.REJECTED) {
            throw new AppException("Cannot send a meet link for a rejected consultation.", HttpStatus.BAD_REQUEST);
        }

        String providedLink = request != null ? request.getMeetLink() : null;
        if (providedLink != null && !providedLink.isBlank()) {
            consultation.setMeetingLink(providedLink.trim());
        }

        if (consultation.getMeetingLink() == null || consultation.getMeetingLink().isBlank()) {
            throw new AppException("Meet link is missing. Accept consultation or provide a meet link.", HttpStatus.BAD_REQUEST);
        }

        if (consultation.getStatus() == Consultation.Status.PENDING) {
            consultation.setStatus(Consultation.Status.ACCEPTED);
        }

        consultationRepository.save(consultation);

        String dateStr = consultation.getMeetingTime().format(DATE_FORMATTER);
        String timeStr = consultation.getMeetingTime().format(TIME_FORMATTER);
        String note = request != null && request.getPrescriptionNote() != null ? request.getPrescriptionNote().trim() : "";

        String subject = "Consultation Meet Link: " + consultation.getPetName();
        String body = "<h2>Hello " + consultation.getUser().getName() + ",</h2>"
                + "<p>Dr. " + consultation.getDoctor().getUser().getName()
                + " has shared your Google Meet link for <strong>" + consultation.getPetName() + "</strong>.</p>"
                + "<p><strong>Date:</strong> " + dateStr + "</p>"
                + "<p><strong>Time:</strong> " + timeStr + "</p>"
                + "<p><strong>Google Meet Link:</strong> <a href=\"" + consultation.getMeetingLink()
                + "\">Join Meeting</a></p>"
                + (!note.isBlank() ? "<p><strong>Doctor Note:</strong> " + note + "</p>" : "");

        emailService.sendEmail(consultation.getUser().getEmail(), subject, body);
    }

    public List<ConsultationDto> getUserConsultations(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return consultationRepository.findByUser(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ConsultationDto> getUserConsultationsByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Consultation> list = consultationRepository.findByUser(user);
        System.out.println("[DEBUG] Found " + list.size() + " consultations for user: " + email);
        list.forEach(c -> System.out.println("  - ID: " + c.getId() + ", Status: " + c.getStatus() + ", Has Link: " + (c.getMeetingLink() != null && !c.getMeetingLink().isBlank())));
        return list.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ConsultationDto> getDoctorConsultations(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        return consultationRepository.findByDoctor(doctor).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private void validateDoctorAccess(Consultation consultation, String doctorEmail) {
        String assignedDoctorEmail = consultation.getDoctor().getUser().getEmail();
        if (!assignedDoctorEmail.equalsIgnoreCase(doctorEmail)) {
            throw new AppException("Only the assigned doctor can update this consultation.", HttpStatus.FORBIDDEN);
        }
    }

    private void ensurePendingStatus(Consultation consultation) {
        if (consultation.getStatus() != Consultation.Status.PENDING) {
            throw new AppException("This consultation has already been processed.", HttpStatus.BAD_REQUEST);
        }
    }

    private ConsultationDto mapToDto(Consultation c) {
        return new ConsultationDto(
                c.getId(),
                c.getUser().getId(),
                c.getUser().getName(),
                c.getUser().getEmail(),
                c.getDoctor().getId(),
                c.getDoctor().getUser().getName(),
                c.getPetName(),
                c.getPetType(),
                c.getProblemDescription(),
                c.getMeetingLink(),
                c.getMeetingTime(),
                c.getStatus(),
                c.getCreatedAt()
        );
    }
}
