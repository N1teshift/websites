import { useMemo, useCallback } from "react";
import { CalendarEventDisplay, CalendarEventInput } from "../types";

export const useCalendarEvents = (
  events: CalendarEventInput[],
  translate: (key: string) => string
): CalendarEventDisplay[] => {
  return useMemo(
    () =>
      events.map((event) => ({
        id: event.id,
        title: event.title === "occupied" ? translate("occupied") : event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        isTemporary: event.isTemporary,
        registrationMethod: event.registrationMethod,
      })),
    [events, translate]
  );
};

export const useSlotOverlapChecker = (calendarEvents: CalendarEventDisplay[]) => {
  return useCallback(
    (slotStart: Date, slotEnd: Date) => {
      for (const event of calendarEvents) {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);

        if (
          (slotStart >= eventStart && slotStart < eventEnd) ||
          (slotEnd > eventStart && slotEnd <= eventEnd) ||
          (slotStart <= eventStart && slotEnd >= eventEnd)
        ) {
          return true;
        }
      }
      return false;
    },
    [calendarEvents]
  );
};
