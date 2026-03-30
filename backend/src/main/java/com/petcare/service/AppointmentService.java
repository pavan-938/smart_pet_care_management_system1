package com.petcare.service;

import com.petcare.dto.AppointmentDto;
import java.util.List;

public interface AppointmentService {
    List<AppointmentDto> getAllAppointments();

    List<AppointmentDto> getAppointmentsByDoctor(Long doctorId);

    List<AppointmentDto> getAppointmentsByDoctorEmail(String email);

    List<AppointmentDto> getAppointmentsByPet(Long petId);

    List<AppointmentDto> getAppointmentsByUserEmail(String email);

    AppointmentDto getAppointmentById(Long id);

    AppointmentDto bookAppointment(AppointmentDto appointmentDto, String userEmail);

    AppointmentDto updateStatus(Long id, String status);

    void deleteAppointment(Long id);

    void cancelAppointment(Long id);

    AppointmentDto rescheduleAppointment(Long id, String newDateTime);

    List<AppointmentDto> getUpcomingAppointments(String email);

    java.util.Map<String, Long> getAnalytics();
}
