package com.petcare.scheduler;

import com.petcare.entity.Appointment;
import com.petcare.entity.HealthRecord;
import com.petcare.repository.AppointmentRepository;
import com.petcare.repository.HealthRecordRepository;
import com.petcare.repository.ReminderRepository;
import com.petcare.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class ReminderScheduler {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private HealthRecordRepository healthRecordRepository;

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private EmailService emailService;

    // Run every hour to check for upcoming appointments (24h ahead)
    @Scheduled(fixedRate = 3600000)
    public void sendAppointmentReminders() {
        LocalDateTime now = LocalDateTime.now();
        // Check for appointments occurring tomorrow (in 24-48 hours window)
        LocalDateTime targetStart = now.plusDays(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime targetEnd = now.plusDays(1).withHour(23).withMinute(59).withSecond(59).withNano(999999999);

        System.out.println("Scheduler: Checking for appointments between " + targetStart + " and " + targetEnd);

        List<Appointment> upcoming = appointmentRepository.findByStatusAndReminderSentFalseAndDateTimeBetween(
                Appointment.Status.CONFIRMED, targetStart, targetEnd);

        for (Appointment apt : upcoming) {
            String userEmail = apt.getPet().getOwner().getEmail();
            String userName = apt.getPet().getOwner().getName();
            String petName = apt.getPet().getName();
            String doctorName = apt.getDoctor().getUser().getName();
            String time = apt.getDateTime().format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a"));

            // 1. Send Professional Email
            String subject = "🔔 Reminder: Appointment for " + petName + " Tomorrow!";
            String body = String.format(
                    "Hi %s,\n\nThis is a friendly reminder that you have an appointment scheduled for %s with Dr. %s tomorrow, %s.\n\n"
                            +
                            "Location: Smart Pet Care Clinic\n\nPlease arrive 10 minutes early. We look forward to seeing you and %s!\n\n"
                            +
                            "Best regards,\nSmart Pet Care Team",
                    userName, petName, doctorName, time, petName);

            emailService.sendEmail(userEmail, subject, body);

            // 2. Create In-App Notification (Reminder entity)
            com.petcare.entity.Reminder reminder = new com.petcare.entity.Reminder();
            reminder.setPet(apt.getPet());
            reminder.setTitle("Upcoming Appointment Tomorrow");
            reminder.setDescription("Appointment with Dr. " + doctorName + " for " + petName + " at "
                    + apt.getDateTime().toLocalTime());
            reminder.setReminderDate(LocalDateTime.now());
            reminder.setCompleted(false);
            reminderRepository.save(reminder);

            // 3. Mark appointment so we don't remind again
            apt.setReminderSent(true);
            appointmentRepository.save(apt);
        }

        if (!upcoming.isEmpty()) {
            System.out.println("Scheduler: Processed " + upcoming.size() + " reminder(s).");
        }
    }

    // Run every day at 8 AM to check for upcoming vaccinations (due in 3 days)
    @Scheduled(cron = "0 0 8 * * *")
    public void sendVaccineReminders() {
        LocalDate targetDate = LocalDate.now().plusDays(3);
        System.out.println("Scheduler: Checking for vaccinations due on " + targetDate);

        List<HealthRecord> records = healthRecordRepository.findByNextDueDate(targetDate);

        for (HealthRecord record : records) {
            String userEmail = record.getPet().getOwner().getEmail();
            String userName = record.getPet().getOwner().getName();
            String petName = record.getPet().getName();
            String vaccineName = record.getVaccineName();

            String subject = "Vaccination Reminder: " + petName + " needs " + vaccineName;
            String body = String.format(
                    "Hi %s,\n\nThis is an automated reminder that %s is due for their %s vaccination on %s.\n\n" +
                            "Please book an appointment soon to keep your pet healthy!\n\n" +
                            "Best regards,\nSmart Pet Care Team",
                    userName, petName, vaccineName, targetDate.toString());

            emailService.sendEmail(userEmail, subject, body);

            // Create In-App Notification
            com.petcare.entity.Reminder reminder = new com.petcare.entity.Reminder();
            reminder.setPet(record.getPet());
            reminder.setTitle("Vaccination Due Soon");
            reminder.setDescription(petName + " is due for " + vaccineName + " on " + targetDate);
            reminder.setReminderDate(LocalDateTime.now());
            reminder.setCompleted(false);
            reminderRepository.save(reminder);

            System.out.println("Sent vaccine reminder (Email + In-App) to " + userEmail + " for " + petName);
        }
    }
}
