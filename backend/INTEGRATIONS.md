# Integrations Setup

## SMTP email

Set these environment variables before starting the backend:

```powershell
$env:MAIL_HOST="smtp.gmail.com"
$env:MAIL_PORT="587"
$env:MAIL_USERNAME="your-email@gmail.com"
$env:MAIL_PASSWORD="your-gmail-app-password"
$env:MAIL_SMTP_AUTH="true"
$env:MAIL_SMTP_STARTTLS="true"
```

Notes:

- For Gmail, `MAIL_PASSWORD` should be an App Password, not your normal Gmail password.
- If `MAIL_HOST` is empty, the app stays in email simulation mode.

## Google Calendar and Google Meet

Set these environment variables before starting the backend:

```powershell
$env:GOOGLE_CALENDAR_ENABLED="true"
$env:GOOGLE_CALENDAR_SERVICE_ACCOUNT_KEY_PATH="C:\path\to\service-account.json"
$env:GOOGLE_CALENDAR_CALENDAR_ID="primary"
$env:GOOGLE_CALENDAR_DELEGATED_USER_EMAIL="calendar-owner@your-domain.com"
```

Notes:

- The backend creates the Calendar event on `GOOGLE_CALENDAR_CALENDAR_ID`.
- The doctor and pet owner are added as attendees, so Google can send invitation emails to their own mailboxes.
- If you use a service account for a Google Workspace domain, `GOOGLE_CALENDAR_DELEGATED_USER_EMAIL` should be a real Workspace user with Calendar access.
- If you are not using domain-wide delegation, share the organizer calendar with the service account and set `GOOGLE_CALENDAR_CALENDAR_ID` to that calendar.
- If Google Calendar is not configured, the app falls back to a mock Meet link.

## Start example

```powershell
$env:MAIL_HOST="smtp.gmail.com"
$env:MAIL_PORT="587"
$env:MAIL_USERNAME="your-email@gmail.com"
$env:MAIL_PASSWORD="your-gmail-app-password"
$env:GOOGLE_CALENDAR_ENABLED="true"
$env:GOOGLE_CALENDAR_SERVICE_ACCOUNT_KEY_PATH="C:\path\to\service-account.json"
$env:GOOGLE_CALENDAR_CALENDAR_ID="primary"
$env:GOOGLE_CALENDAR_DELEGATED_USER_EMAIL="calendar-owner@your-domain.com"
mvn -q spring-boot:run -DskipTests
```
