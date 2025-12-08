import React from "react";
import { SuccessMessage } from "@websites/ui";
import { Calendar, SidebarContent } from "@calendar/components/index";
import {
  EventDetails,
  RegistrationMethod,
  CalendarEventInput,
  CalendarEventClickInfo,
  CalendarSlotSelectInfo,
} from "@calendar/types";

interface LessonSchedulerLayoutProps {
  showSuccessMessage: boolean;
  successMessageKey: string;
  events: CalendarEventInput[];
  selectedEvent: CalendarEventClickInfo | null;
  selectedSlot: CalendarSlotSelectInfo | null;
  calendarRef: React.RefObject<any>;
  handleSelectSlot: (slotInfo: CalendarSlotSelectInfo) => void;
  handleEventClick: (event: CalendarEventClickInfo) => void;
  handleGuestEventCreated: (success: boolean, details?: EventDetails) => void;
  setRegistrationMethod: (method: RegistrationMethod) => void;
  setEventDetails: (details: EventDetails | null) => void;
}

export const LessonSchedulerLayout: React.FC<LessonSchedulerLayoutProps> = ({
  showSuccessMessage,
  successMessageKey,
  events,
  selectedEvent,
  selectedSlot,
  calendarRef,
  handleSelectSlot,
  handleEventClick,
  handleGuestEventCreated,
  setRegistrationMethod,
  setEventDetails,
}) => {
  return (
    <>
      <SuccessMessage visible={showSuccessMessage} messageKey={successMessageKey} />
      <div className="flex w-full h-[calc(100vh-200px)]">
        <div className="w-2/3 bg-surface-card pr-4 overflow-hidden">
          <Calendar
            events={events}
            onSelectSlot={handleSelectSlot}
            onEventClick={handleEventClick}
            clickedEventId={selectedEvent?.event.id || null}
            calendarRef={calendarRef}
          />
        </div>
        <div className="w-1/3 bg-surface-card border border-border-default text-text-primary shadow-md rounded-md p-4 overflow-y-auto">
          <SidebarContent
            selectedEvent={selectedEvent}
            selectedSlot={selectedSlot}
            handleGuestEventCreated={handleGuestEventCreated}
            events={events}
            setRegistrationMethod={setRegistrationMethod}
            setEventDetails={setEventDetails}
          />
        </div>
      </div>
    </>
  );
};
