package com.petcare.dto;

import lombok.Data;

@Data
public class SendMeetLinkRequest {
    /** Optional: override the stored meet link with a new one (e.g. from Google Calendar) */
    private String meetLink;
    /** Optional: prescription / pre-consult note to include in the email */
    private String prescriptionNote;
}
