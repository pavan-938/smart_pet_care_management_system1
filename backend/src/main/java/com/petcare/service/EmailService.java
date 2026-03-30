package com.petcare.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final String TEAM_SIGNATURE = "<br><p>Best regards,<br>Smart Pet Care Team</p>";

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@petcare.com}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String body) {
        if (mailSender != null) {
            try {
                jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
                org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(message, true);
                helper.setFrom(fromEmail);
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(body, true);
                mailSender.send(message);
                System.out.println("Email sent to " + to);
            } catch (Exception e) {
                System.err.println("Failed to send email: " + e.getMessage());
            }
        } else {
            System.out.println("----- EMAIL SIMULATION -----");
            System.out.println("To: " + to);
            System.out.println("Subject: " + subject);
            System.out.println("Body: " + body);
            System.out.println("----------------------------");
        }
    }

    public void sendConsultationRequestToDoctor(
            String to,
            String doctorName,
            String userName,
            String userEmail,
            String petName,
            String petType,
            String date,
            String time) {
        String subject = "New Video Consultation Request: " + petName;
        String body = "<h2>Hello Dr. " + doctorName + ",</h2>" +
                "<p>A video consultation request has been submitted for <strong>" + petName + "</strong> (" + petType + ").</p>" +
                "<p><strong>Pet owner:</strong> " + userName + " (" + userEmail + ")</p>" +
                "<p><strong>Date:</strong> " + date + "</p>" +
                "<p><strong>Time:</strong> " + time + "</p>" +
                "<p>Please review and accept this request from your doctor dashboard to generate the Google Meet invite.</p>" +
                TEAM_SIGNATURE;
        sendEmail(to, subject, body);
    }

    public void sendConsultationRequestConfirmationToUser(
            String to,
            String userName,
            String doctorName,
            String petName,
            String date,
            String time) {
        String subject = "Consultation Request Submitted: " + petName;
        String body = "<h2>Hello " + userName + ",</h2>" +
                "<p>Your video consultation request for <strong>" + petName + "</strong> has been sent to <strong>Dr. " + doctorName + "</strong>.</p>" +
                "<p><strong>Date:</strong> " + date + "</p>" +
                "<p><strong>Time:</strong> " + time + "</p>" +
                "<p>The Google Meet link will be emailed to your registered address after the doctor accepts the request.</p>" +
                TEAM_SIGNATURE;
        sendEmail(to, subject, body);
    }

    public void sendConsultationAcceptedToUser(
            String to,
            String userName,
            String doctorName,
            String petName,
            String date,
            String time,
            String meetLink) {
        String subject = "Consultation Confirmed: " + petName;
        String body = "<h2>Hello " + userName + ",</h2>" +
                "<p>Your video consultation for <strong>" + petName + "</strong> has been accepted by <strong>Dr. " + doctorName + "</strong>.</p>" +
                "<p><strong>Date:</strong> " + date + "</p>" +
                "<p><strong>Time:</strong> " + time + "</p>" +
                "<p><strong>Google Meet Link:</strong> <a href=\"" + meetLink + "\">Join Meeting</a></p>" +
                "<p>This invite is also sent to your registered email address so you receive it in the correct mailbox.</p>" +
                TEAM_SIGNATURE;
        sendEmail(to, subject, body);
    }

    public void sendConsultationAcceptedToDoctor(
            String to,
            String doctorName,
            String userName,
            String userEmail,
            String petName,
            String date,
            String time,
            String meetLink) {
        String subject = "Consultation Accepted: " + petName;
        String body = "<h2>Hello Dr. " + doctorName + ",</h2>" +
                "<p>You accepted the video consultation request for <strong>" + petName + "</strong>.</p>" +
                "<p><strong>Pet owner:</strong> " + userName + " (" + userEmail + ")</p>" +
                "<p><strong>Date:</strong> " + date + "</p>" +
                "<p><strong>Time:</strong> " + time + "</p>" +
                "<p><strong>Google Meet Link:</strong> <a href=\"" + meetLink + "\">Open Meeting</a></p>" +
                TEAM_SIGNATURE;
        sendEmail(to, subject, body);
    }

    public void sendConsultationRejectedToUser(
            String to,
            String userName,
            String doctorName,
            String petName,
            String date,
            String time) {
        String subject = "Consultation Update: " + petName;
        String body = "<h2>Hello " + userName + ",</h2>" +
                "<p>Your video consultation request for <strong>" + petName + "</strong> on " + date + " at " + time +
                " was not accepted by <strong>Dr. " + doctorName + "</strong>.</p>" +
                "<p>Please choose another slot or doctor if you still need a consultation.</p>" +
                TEAM_SIGNATURE;
        sendEmail(to, subject, body);
    }
}
