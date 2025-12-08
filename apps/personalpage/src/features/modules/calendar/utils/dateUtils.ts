import { CalendarEventInput } from "../types";

/**
 * Date utility functions for calendar operations
 */

export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
};

/**
 * Formats a date using consistent formatting options
 */
export const formatDateTime = (date: Date): string =>
  date.toLocaleString(undefined, DATE_FORMAT_OPTIONS);

/**
 * Calculates end time based on start time and duration in minutes
 */
export const calculateEndTime = (startTime: Date, durationMinutes: number): Date =>
  new Date(startTime.getTime() + durationMinutes * 60000);

/**
 * Calculates the available time gap before the next event
 */
export const getAvailableGap = (slotStart: Date, events: CalendarEventInput[]): number => {
  let availableGap = Infinity;

  for (const event of events) {
    const eventStart = new Date(event.start as string);

    if (eventStart > slotStart) {
      const gapInMilliseconds = eventStart.getTime() - slotStart.getTime();
      const gapInMinutes = gapInMilliseconds / (1000 * 60);

      if (gapInMinutes < availableGap) {
        availableGap = gapInMinutes;
      }
    }
  }

  return availableGap;
};
