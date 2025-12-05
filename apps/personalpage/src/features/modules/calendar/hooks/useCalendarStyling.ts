import { useCallback } from "react";
import { CalendarEventDisplay } from "../types";

const TEMPORARY_COLORS: Record<string, { background: string; border: string }> = {
    google: { background: "#4285f4", border: "#3367d6" },
    microsoft: { background: "#00a1f1", border: "#0078d4" },
    guest: { background: "#34a853", border: "#2d8a3e" },
};

export const useCalendarStyling = (
    clickedEventId: string | null,
    selectedSlotId: string | null
) => {
    const eventStyleGetter = useCallback((event: CalendarEventDisplay) => {
        const isClicked = event.id === clickedEventId;
        const isTemporary = event.isTemporary;
        const colorSet = isTemporary && event.registrationMethod
            ? TEMPORARY_COLORS[event.registrationMethod]
            : null;

        const backgroundColor = colorSet?.background ?? "var(--brand-primary)";
        const borderColor = colorSet?.border ?? "var(--brand-primary)";

        return {
            className: isTemporary ? "temporary-event" : "",
            style: {
                backgroundColor,
                borderRadius: "4px",
                color: "white",
                border: isTemporary ? `2px dashed ${borderColor}` : "none",
                transform: isClicked ? "scale(1.05)" : "scale(1)",
                transition: "transform 0.2s ease",
            },
        };
    }, [clickedEventId]);

    const dayPropGetter = useCallback((date: Date) => {
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        return {
            className: isToday ? "rbc-day-bg-today" : "",
            style: {
                backgroundColor: isToday ? "var(--calendar-today-bg)" : "transparent",
            },
        };
    }, []);

    const slotPropGetter = useCallback((date: Date) => {
        const isSelected = selectedSlotId && date.toISOString() === selectedSlotId;

        return {
            className: isSelected ? "selected-slot-highlight" : "",
            style: {
                backgroundColor: isSelected ? "var(--brand-light)" : "transparent",
            },
        };
    }, [selectedSlotId]);

    return {
        eventStyleGetter,
        dayPropGetter,
        slotPropGetter,
    };
};




