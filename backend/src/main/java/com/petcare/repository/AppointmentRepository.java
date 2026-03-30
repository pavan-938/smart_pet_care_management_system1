package com.petcare.repository;

import com.petcare.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

        List<Appointment> findByDoctorId(Long doctorId);

        List<Appointment> findByPetId(Long petId);

        List<Appointment> findByPetOwnerId(Long ownerId);
        boolean existsByPetOwnerId(Long ownerId);

        List<Appointment> findByStatusAndReminderSentFalseAndDateTimeBetween(
                        Appointment.Status status,
                        LocalDateTime start,
                        LocalDateTime end);

        List<Appointment> findByStatusAndDateTimeBetween(
                        Appointment.Status status,
                        LocalDateTime start,
                        LocalDateTime end);

        List<Appointment> findByDoctorIdAndDateTime(Long doctorId, LocalDateTime dateTime);

        /** Monthly appointment counts: returns [monthNumber (1-12), count] */
        @Query("SELECT MONTH(a.dateTime), COUNT(a) FROM Appointment a " +
                        "WHERE a.dateTime >= :since GROUP BY MONTH(a.dateTime) ORDER BY MONTH(a.dateTime)")
        List<Object[]> countByMonth(LocalDateTime since);

        /** Appointment count per doctor */
        @Query("SELECT a.doctor.id, COUNT(a) FROM Appointment a GROUP BY a.doctor.id ORDER BY COUNT(a) DESC")
        List<Object[]> countByDoctor();
}
