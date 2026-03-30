package com.petcare.util;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ServiceAccountCredentials;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.GeneralSecurityException;
import java.util.List;

@Configuration
public class GoogleCalendarConfig {
    @Value("${google.calendar.enabled:false}")
    private boolean googleCalendarEnabled;

    @Value("${google.calendar.application-name:Smart Pet Care Management System}")
    private String applicationName;

    @Value("${google.calendar.service-account-key-path:}")
    private String serviceAccountKeyPath;

    @Value("${google.calendar.delegated-user-email:}")
    private String delegatedUserEmail;

    @Bean
    public Calendar googleCalendar() {
        if (!googleCalendarEnabled || serviceAccountKeyPath == null || serviceAccountKeyPath.isBlank()) {
            System.out.println("[INFO] Google Calendar running in MOCK mode. Set google.calendar.* properties to enable real invites.");
            return null;
        }

        try (InputStream credentialsStream = Files.newInputStream(Path.of(serviceAccountKeyPath))) {
            GoogleCredentials credentials = GoogleCredentials.fromStream(credentialsStream)
                    .createScoped(List.of(CalendarScopes.CALENDAR));

            if (!delegatedUserEmail.isBlank() && credentials instanceof ServiceAccountCredentials serviceAccountCredentials) {
                credentials = serviceAccountCredentials.createDelegated(delegatedUserEmail);
            }

            return new Calendar.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    GsonFactory.getDefaultInstance(),
                    new HttpCredentialsAdapter(credentials))
                    .setApplicationName(applicationName)
                    .build();
        } catch (IOException | GeneralSecurityException ex) {
            System.err.println("[WARN] Failed to initialize Google Calendar client. Falling back to MOCK mode. Reason: " + ex.getMessage());
            return null;
        }
    }
}
