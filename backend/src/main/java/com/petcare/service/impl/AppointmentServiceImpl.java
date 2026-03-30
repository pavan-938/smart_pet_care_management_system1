package com.petcare.service.impl;

import com.petcare.dto.AppointmentDto;
import com.petcare.entity.Appointment;
import com.petcare.entity.Doctor;
import com.petcare.entity.Pet;
import com.petcare.entity.User;
import com.petcare.repository.AppointmentRepository;
import com.petcare.repository.DoctorRepository;
import com.petcare.repository.PetRepository;
import com.petcare.repository.UserRepository;
import com.petcare.service.AppointmentService;
import com.petcare.exception.ResourceNotFoundException;
import com.petcare.exception.AppException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.petcare.service.EmailService emailService;

    @Override
    public List<AppointmentDto> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDto> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDto> getAppointmentsByDoctorEmail(String email) {
        Doctor doctor = doctorRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor record not found for email: " + email));
        return getAppointmentsByDoctor(doctor.getId());
    }

    @Override
    public List<AppointmentDto> getAppointmentsByPet(Long petId) {
        return appointmentRepository.findByPetId(petId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDto> getAppointmentsByUserEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return appointmentRepository.findByPetOwnerId(user.getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentDto getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
        return convertToDto(appointment);
    }

    @Override
    @Transactional
    public AppointmentDto bookAppointment(AppointmentDto dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user context lost."));

        Pet pet = petRepository.findById(dto.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet profile not found."));

        if (!pet.getOwner().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new AppException("Access Denied: You can only book for your own pets.", HttpStatus.FORBIDDEN);
        }

        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Specified Veterinarian is not available."));

        if (doctor.getStatus() != Doctor.Status.APPROVED) {
            throw new AppException("Clinical Access Denied: This provider is not currently authorized for new appointments.", HttpStatus.FORBIDDEN);
        }

        // Clinical availability check
        List<Appointment> existing = appointmentRepository.findByDoctorIdAndDateTime(doctor.getId(), dto.getDateTime());
        if (!existing.isEmpty()) {
            throw new AppException("Scheduling Conflict: This time slot is already reserved.", HttpStatus.CONFLICT);
        }

        Appointment appointment = new Appointment();
        appointment.setPet(pet);
        appointment.setDoctor(doctor);
        appointment.setDateTime(dto.getDateTime());
        appointment.setReason(dto.getReason());
        appointment.setStatus(Appointment.Status.PENDING);

        Appointment saved = appointmentRepository.save(appointment);

        // Professional Notification
        String subject = "📅 Action Required: Pending Appointment for " + pet.getName();
        String body = String.format(
                "Dear %s,\n\nYour clinical consultation for %s with Dr. %s has been received.\n\n" +
                        "Scheduled Time: %s\n" +
                        "Location: %s\n" +
                        "Status: PENDING AUTHORIZATION\n\n" +
                        "Our team will review the request and confirm your slot shortly. Thank you for choosing Smart Pet Care.\n\n"
                        +
                        "Best regards,\nSmart Pet Care Registration Office",
                user.getName(), pet.getName(), doctor.getUser().getName(), appointment.getDateTime(),
                doctor.getClinicAddress() != null ? doctor.getClinicAddress() : "Smart Pet Care Central");
        emailService.sendEmail(user.getEmail(), subject, body);

        return convertToDto(saved);
    }

    @Override
    @Transactional
    public AppointmentDto updateStatus(Long id, String status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appointment.getDoctor().getStatus() != Doctor.Status.APPROVED) {
            throw new AppException("Action Prohibited: Your medical credentials are still under administrative review.", HttpStatus.FORBIDDEN);
        }

        Appointment.Status oldStatus = appointment.getStatus();
        Appointment.Status newStatus = Appointment.Status.valueOf(status);
        appointment.setStatus(newStatus);

        Appointment saved = appointmentRepository.save(appointment);

        if (newStatus != oldStatus) {
            String userEmail = appointment.getPet().getOwner().getEmail();
            String userName = appointment.getPet().getOwner().getName();
            String petName = appointment.getPet().getName();
            String doctorName = appointment.getDoctor().getUser().getName();

            String subject = "Appointment Status Updated: " + petName;
            String body = "";

            if (newStatus == Appointment.Status.CONFIRMED) {
                body = String.format(
                        "Hi %s,\n\nGreat news! Your appointment for %s with Dr. %s on %s has been CONFIRMED.\n\n" +
                                "We look forward to seeing you!\n\nBest regards,\nSmart Pet Care Team",
                        userName, petName, doctorName, appointment.getDateTime());
            } else if (newStatus == Appointment.Status.COMPLETED) {
                body = "Clinical session completed for " + petName;
            } else if (newStatus == Appointment.Status.CANCELLED) {
                body = "Appointment cancelled for " + petName;
            }

            if (!body.isEmpty()) {
                emailService.sendEmail(userEmail, subject, body);
            }
        }

        return convertToDto(saved);
    }

    @Override
    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }

    @Override
    public void cancelAppointment(Long id) {
        updateStatus(id, "CANCELLED");
    }

    @Override
    @Transactional
    public AppointmentDto rescheduleAppointment(Long id, String newDateTime) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        LocalDateTime dateTime = LocalDateTime.parse(newDateTime);

        // Conflict check for new time
        List<Appointment> existing = appointmentRepository.findByDoctorIdAndDateTime(appointment.getDoctor().getId(),
                dateTime);
        if (!existing.isEmpty()) {
            throw new AppException("Conflict: The new time slot is already taken.", HttpStatus.CONFLICT);
        }

        appointment.setDateTime(dateTime);
        appointment.setStatus(Appointment.Status.PENDING);

        Appointment saved = appointmentRepository.save(appointment);

        String userEmail = appointment.getPet().getOwner().getEmail();
        emailService.sendEmail(userEmail, "Appointment Rescheduled",
                "Your appointment has been moved to " + newDateTime);

        return convertToDto(saved);
    }

    @Override
    public List<AppointmentDto> getUpcomingAppointments(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusDays(1);

        List<Appointment> appointments;
        if (user.getRole() == User.Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByUserEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor record not found"));
            appointments = appointmentRepository.findByDoctorId(doctor.getId());
        } else {
            appointments = appointmentRepository.findByPetOwnerId(user.getId());
        }

        return appointments.stream()
                .filter(a -> a.getDateTime().isAfter(now) && a.getDateTime().isBefore(tomorrow))
                .filter(a -> a.getStatus() == Appointment.Status.PENDING
                        || a.getStatus() == Appointment.Status.CONFIRMED)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Long> getAnalytics() {
        List<Appointment> all = appointmentRepository.findAll();
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", (long) all.size());
        stats.put("pending", all.stream().filter(a -> a.getStatus() == Appointment.Status.PENDING).count());
        stats.put("confirmed", all.stream().filter(a -> a.getStatus() == Appointment.Status.CONFIRMED).count());
        stats.put("completed", all.stream().filter(a -> a.getStatus() == Appointment.Status.COMPLETED).count());
        stats.put("cancelled", all.stream().filter(a -> a.getStatus() == Appointment.Status.CANCELLED).count());
        return stats;
    }

    private AppointmentDto convertToDto(Appointment appointment) {
        AppointmentDto dto = new AppointmentDto();
        dto.setId(appointment.getId());
        dto.setPetId(appointment.getPet().getId());
        dto.setPetName(appointment.getPet().getName());
        dto.setDoctorId(appointment.getDoctor().getId());
        dto.setDoctorName(appointment.getDoctor().getUser().getName());
        dto.setDateTime(appointment.getDateTime());
        dto.setStatus(appointment.getStatus());
        dto.setReason(appointment.getReason());
        dto.setPetType(appointment.getPet().getSpecies());
        dto.setPetBreed(appointment.getPet().getBreed());
        dto.setPetAge(appointment.getPet().getAge());
        dto.setOwnerName(appointment.getPet().getOwner().getName());
        return dto;
    }
}