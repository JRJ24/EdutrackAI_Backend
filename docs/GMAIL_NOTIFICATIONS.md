# Optional Gmail delivery for EduTrack notifications

EduTrack notifications remain stored in the application first. Gmail is an optional additional delivery channel and a Gmail failure never prevents the in-app notification from being created.

## Configuration

Use a dedicated Gmail account or an account approved for the demo. Enable 2-Step Verification in that Google account and create an **App Password**. Do not commit the password.

Add these values to the backend `.env`:

```env
EMAIL_NOTIFICATIONS_ENABLED=true
GMAIL_SMTP_USER=your-account@gmail.com
GMAIL_APP_PASSWORD=your-google-app-password
```

Restart the backend after changing the environment.

## What sends email

- An immediate notification created through the Notifications service/Admin can also be delivered by Gmail when the channel is enabled.
- Adaptive high-priority alerts use the same notification service and therefore can also be delivered by Gmail.
- Future-dated Admin notifications remain stored in EduTrack; this implementation does not run a persistent email queue for future scheduled delivery.

## Safety

If the variables are absent, disabled or Gmail rejects the credentials, EduTrack logs the email-channel failure and continues normally. Student academic processing, Pulse and in-app notifications do not depend on Gmail.
