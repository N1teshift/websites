import { SharedEventDetails } from "../types";

/** Transforms shared event details into the format required for the Google Calendar API (user context). */
export function transformToGoogleEvent(event: SharedEventDetails) {
  return {
    summary: event.summary,
    start: {
      dateTime: event.startDateTime,
    },
    end: {
      dateTime: event.endDateTime,
    },
    attendees: event.attendees?.map((attendee) => ({
      email: attendee.email,
      displayName: attendee.name,
    })),
  };
}

/** Transforms shared event details into the format required for the Google Calendar API (service account context). */
export function transformToGoogleServiceAccountEvent(event: SharedEventDetails) {
  // Create description with guest information if available
  let description = "";
  if (event.attendees && event.attendees.length > 0) {
    const attendee = event.attendees[0];
    description = `Guest Information:\n`;
    description += `Name: ${attendee.name || "Not provided"}\n`;
    description += `Email: ${attendee.email}\n`;
    if (event.phoneNumber) {
      description += `Phone: ${event.phoneNumber}\n`;
    }
  }

  return {
    summary: event.summary,
    start: {
      dateTime: event.startDateTime,
    },
    end: {
      dateTime: event.endDateTime,
    },
    description: description || undefined,
  };
}

/** Transforms shared event details into the format required for the Microsoft Graph API. */
export function transformToMicrosoftEvent(event: SharedEventDetails) {
  return {
    subject: event.summary,
    start: {
      dateTime: event.startDateTime,
      timeZone: process.env.NEXT_PUBLIC_CALENDAR_TIMEZONE || "UTC", // Adjust as needed
    },
    end: {
      dateTime: event.endDateTime,
      timeZone: process.env.NEXT_PUBLIC_CALENDAR_TIMEZONE || "UTC", // Adjust as needed
    },
    attendees: event.attendees?.map((attendee) => ({
      emailAddress: {
        address: attendee.email,
        name: attendee.name || "",
      },
      type: "required",
    })),
    isOnlineMeeting: true,
    onlineMeetingProvider:
      process.env.NEXT_PUBLIC_CALENDAR_ONLINE_MEETING_PROVIDER || "teamsForBusiness",
  };
}
