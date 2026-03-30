package com.petcare.service;

import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.ConferenceData;
import com.google.api.services.calendar.model.ConferenceSolutionKey;
import com.google.api.services.calendar.model.CreateConferenceRequest;
import com.google.api.services.calendar.model.*;
import com.petcare.exception.AppException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class GoogleCalendarService {
    @Value("${google.calendar.calendar-id:primary}")
    private String organizerCalendarId;

    @Autowired(required = false)
    private Calendar googleCalendar;

    public String createGoogleMeetLink(String summary, LocalDateTime startTime, String userEmail, String doctorEmail) {
        if (googleCalendar == null) {
            // Generate a valid Google Meet room code in the required xxx-xxxx-xxx (3-4-3) lowercase-letter format
            String chars = "abcdefghijklmnopqrstuvwxyz";
            java.util.Random rnd = new java.util.Random();
            StringBuilder seg1 = new StringBuilder();
            StringBuilder seg2 = new StringBuilder();
            StringBuilder seg3 = new StringBuilder();
            for (int i = 0; i < 3; i++) seg1.append(chars.charAt(rnd.nextInt(chars.length())));
            for (int i = 0; i < 4; i++) seg2.append(chars.charAt(rnd.nextInt(chars.length())));
            for (int i = 0; i < 3; i++) seg3.append(chars.charAt(rnd.nextInt(chars.length())));
            String mockLink = "https://meet.google.com/" + seg1 + "-" + seg2 + "-" + seg3;
            System.out.println("[INFO] Google Calendar not configured. Returning mock Meet link: " + mockLink);
            return mockLink;
        }
        try {
            String timeZone = ZoneId.systemDefault().getId();
            Event event = new Event()
                    .setSummary(summary)
                    .setDescription("Pet consultation via Smart Pet Care Management System");

            java.util.Date startDate = java.util.Date.from(startTime.atZone(ZoneId.systemDefault()).toInstant());
            java.util.Date endDate = java.util.Date.from(startTime.plusMinutes(30).atZone(ZoneId.systemDefault()).toInstant());

            DateTime start = new DateTime(startDate);
            event.setStart(new EventDateTime().setDateTime(start).setTimeZone(timeZone));

            DateTime end = new DateTime(endDate);
            event.setEnd(new EventDateTime().setDateTime(end).setTimeZone(timeZone));

            // Conference data for Google Meet
            ConferenceSolutionKey conferenceSolutionKey = new ConferenceSolutionKey().setType("hangoutsMeet");
            CreateConferenceRequest createConferenceRequest = new CreateConferenceRequest()
                    .setRequestId(UUID.randomUUID().toString())
                    .setConferenceSolutionKey(conferenceSolutionKey);
            ConferenceData conferenceData = new ConferenceData().setCreateRequest(createConferenceRequest);
            event.setConferenceData(conferenceData);

            // Add attendees
            event.setAttendees(Arrays.asList(
                    new EventAttendee().setEmail(userEmail),
                    new EventAttendee().setEmail(doctorEmail)
            ));

            Event createdEvent = googleCalendar.events().insert(organizerCalendarId, event)
                    .setConferenceDataVersion(1)
                    .setSendUpdates("all")
                    .execute();

            String hangoutLink = extractMeetLink(createdEvent);
            if (hangoutLink == null || hangoutLink.isBlank()) {
                throw new AppException(
                        "Google Calendar did not return a valid Meet link. The consultation was not accepted.",
                        HttpStatus.BAD_GATEWAY);
            }
            return hangoutLink;
        } catch (IOException e) {
            throw new AppException(
                    "Failed to create the Google Meet link. Please verify the Google Calendar configuration and try again.",
                    HttpStatus.BAD_GATEWAY);
        }
    }

    private String extractMeetLink(Event createdEvent) {
        if (createdEvent.getHangoutLink() != null && !createdEvent.getHangoutLink().isBlank()) {
            return createdEvent.getHangoutLink();
        }

        ConferenceData conferenceData = createdEvent.getConferenceData();
        if (conferenceData == null || conferenceData.getEntryPoints() == null) {
            return null;
        }

        List<EntryPoint> entryPoints = conferenceData.getEntryPoints();
        for (EntryPoint entryPoint : entryPoints) {
            if ("video".equalsIgnoreCase(entryPoint.getEntryPointType()) && entryPoint.getUri() != null) {
                return entryPoint.getUri();
            }
        }

        return null;
    }
}
