import { GoogleCalendarClient } from "@websites/infrastructure/clients/google";
import { MicrosoftCalendarClient } from "@websites/infrastructure/clients/microsoft";
import { createComponentLogger } from "@websites/infrastructure/logging";
import { AvailabilityCheckResult, BookingOptions } from "../types";

const logger = createComponentLogger("CalendarAPI");

/**
 * Check Google Calendar availability for a time range
 */
export async function checkGoogleAvailability(
  startDateTime: string,
  endDateTime: string,
  calendarId: string = "primary"
): Promise<AvailabilityCheckResult> {
  try {
    logger.debug("Checking Google Calendar availability", {
      startDateTime,
      endDateTime,
      calendarId,
    });

    const googleClient = new GoogleCalendarClient();
    const result = await googleClient.checkAvailability(calendarId, startDateTime, endDateTime);

    const isAvailable = result.busy.length === 0;

    logger.info("Google Calendar availability checked", {
      isAvailable,
      busyCount: result.busy.length,
    });

    return {
      isAvailable,
      busy: result.busy,
    };
  } catch (error) {
    logger.error(
      "Error checking Google Calendar availability",
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Check Microsoft Calendar availability for a time range
 */
export async function checkMicrosoftAvailability(
  startDateTime: string,
  endDateTime: string,
  calendarId: string = "default"
): Promise<AvailabilityCheckResult> {
  try {
    logger.debug("Checking Microsoft Calendar availability", {
      startDateTime,
      endDateTime,
      calendarId,
    });

    const microsoftClient = new MicrosoftCalendarClient();
    const result = await microsoftClient.checkAvailability(startDateTime, endDateTime);

    const isAvailable = result.length === 0;

    logger.info("Microsoft Calendar availability checked", {
      isAvailable,
      busyCount: result.length,
    });

    return {
      isAvailable,
      busy: result,
    };
  } catch (error) {
    logger.error(
      "Error checking Microsoft Calendar availability",
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Book a time slot in Google Calendar
 */
export async function bookGoogleCalendar(options: BookingOptions): Promise<unknown> {
  try {
    logger.debug("Booking Google Calendar event", {
      startDateTime: options.startDateTime,
      summary: options.summary,
    });

    const googleClient = new GoogleCalendarClient();
    const calendarId = options.calendarId || "primary";

    const eventData = {
      summary: options.summary,
      description: options.description,
      start: {
        dateTime: options.startDateTime,
        timeZone: process.env.NEXT_PUBLIC_CALENDAR_TIMEZONE || "Europe/Vilnius",
      },
      end: {
        dateTime: options.endDateTime,
        timeZone: process.env.NEXT_PUBLIC_CALENDAR_TIMEZONE || "Europe/Vilnius",
      },
      attendees: options.attendees?.map((attendee) => ({
        email: attendee.email,
        displayName: attendee.name,
      })),
    };

    const result = await googleClient.createCalendarEvent(calendarId, eventData);

    logger.info("Google Calendar event booked successfully", {
      eventId: (result as Record<string, unknown>)?.id,
    });

    return result;
  } catch (error) {
    logger.error(
      "Error booking Google Calendar event",
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Book a time slot in Microsoft Calendar
 */
export async function bookMicrosoftCalendar(options: BookingOptions): Promise<unknown> {
  try {
    logger.debug("Booking Microsoft Calendar event", {
      startDateTime: options.startDateTime,
      summary: options.summary,
    });

    const microsoftClient = new MicrosoftCalendarClient();

    const eventData = {
      subject: options.summary,
      body: {
        contentType: "HTML",
        content: options.description || "",
      },
      start: {
        dateTime: options.startDateTime,
        timeZone: process.env.NEXT_PUBLIC_CALENDAR_TIMEZONE || "Europe/Vilnius",
      },
      end: {
        dateTime: options.endDateTime,
        timeZone: process.env.NEXT_PUBLIC_CALENDAR_TIMEZONE || "Europe/Vilnius",
      },
      attendees: options.attendees?.map((attendee) => ({
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

    const result = await microsoftClient.createEvent(eventData);

    logger.info("Microsoft Calendar event booked successfully", {
      eventId: (result as Record<string, unknown>)?.id,
    });

    return result;
  } catch (error) {
    logger.error(
      "Error booking Microsoft Calendar event",
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}
