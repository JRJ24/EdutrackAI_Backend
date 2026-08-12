# Gmail delivery and verified academic alerts

EduTrack keeps in-app notifications as the source of truth. Gmail is an additional delivery channel so important academic changes can reach the student even when the app is closed.

## Configuration

Use a dedicated Gmail account for EduTrack. Enable 2-Step Verification and create a Google **App Password**. Never commit that password.

```env
EMAIL_NOTIFICATIONS_ENABLED=true
GMAIL_SMTP_USER=your-edutrack-account@gmail.com
GMAIL_APP_PASSWORD=your-google-app-password
BACKEND_PUBLIC_URL=http://localhost:5000
FRONTEND_PUBLIC_URL=http://localhost:5173
ADAPTIVE_ENGINE_INTERVAL_MINUTES=60
```

Restart the backend after changing the environment.

## Email verification

- New accounts receive a branded verification email automatically.
- Existing unverified accounts receive the verification email when they log in.
- The verification link expires after two hours and marks `User.emailVerified=true`.
- Academic notification emails are only sent to verified addresses. A false/unowned email therefore never becomes an active alert channel.
- `POST /api/auth/resend-verification` lets an authenticated user request another verification email.

## Automatic academic events

The Admin does not need to manually write routine alerts. EduTrack creates in-app notifications and sends branded email automatically when relevant:

- an active evaluation is within three days;
- a student-created important date/deadline is within three days;
- the student has not studied a subject for at least five days;
- a recently completed quiz is below 60%;
- the adaptive engine reaches high academic priority.

Evaluation changes and student deadlines trigger the proactive check immediately. The scheduler also runs a sweep shortly after backend startup and then every hour by default. Dedupe windows prevent the same alert from being sent repeatedly within the same day.

## Email presentation

Messages use a responsive HTML template with EduTrack identity, a concrete academic explanation and a direct action button such as **Ver mi siguiente paso** or **Volver a practicar**. A text version is included as a fallback for email clients that do not render HTML.

## Safety

A Gmail outage or bad SMTP credential never blocks Pulse, risk analysis or the in-app notification. Scheduled Admin notifications are still stored in EduTrack; there is no persistent external mail queue for future scheduled delivery.
