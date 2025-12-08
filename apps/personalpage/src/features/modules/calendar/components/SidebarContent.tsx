import React from "react";
import EventDetails from "./EventDetails";
import EventCreationForm from "./EventCreationForm";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";
import {
  EventDetails as EventDetailsType,
  RegistrationMethod,
  CalendarEventClickInfo,
  CalendarSlotSelectInfo,
  CalendarEventInput,
} from "../types";

interface SidebarContentProps {
  selectedEvent: CalendarEventClickInfo | null;
  selectedSlot: CalendarSlotSelectInfo | null;
  handleGuestEventCreated: (success: boolean, details?: EventDetailsType) => void;
  events: CalendarEventInput[];
  setRegistrationMethod: (method: RegistrationMethod) => void;
  setEventDetails: (details: EventDetailsType) => void;
}

/**
 * Dynamically renders content in the sidebar based on user selection.
 *
 * If an event is selected, it displays `EventDetails`.
 * If a time slot is selected, it displays `EventCreationForm`.
 * Otherwise, it shows a message indicating nothing is selected.
 */
export default function SidebarContent({
  selectedEvent,
  selectedSlot,
  handleGuestEventCreated,
  events,
  setRegistrationMethod,
  setEventDetails,
}: SidebarContentProps) {
  const { t } = useFallbackTranslation();

  if (selectedEvent) {
    return <EventDetails event={selectedEvent} />;
  } else if (selectedSlot) {
    return (
      <EventCreationForm
        startTime={selectedSlot.start}
        onGuestEventCreated={handleGuestEventCreated}
        events={events}
        setRegistrationMethod={setRegistrationMethod}
        setEventDetails={setEventDetails}
      />
    );
  } else {
    return (
      <h1 className="text-text-primary text-xl font-bold">
        {t("no_event_selected_or_slot_selected")}
      </h1>
    );
  }
}
