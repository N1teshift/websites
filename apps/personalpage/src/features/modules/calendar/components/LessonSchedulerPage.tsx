import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";

import {
    useCalendarData, useEventFetching, useOAuthSuccessHandler,
    useEventSuccessHandler, useCalendarEventHandlers
} from "../hooks";
import { LessonSchedulerLayout } from "./LessonSchedulerLayout";
import { getSuccessMessageKey } from "../utils/eventRegistrationUtils";
import { RegistrationMethod, EventDetails } from "../types";

import { CalendarEventClickInfo, CalendarSlotSelectInfo } from "../types";
import ToastNotification from "@websites/ui";

export default function LessonSchedulerPage() {
    // Calendar events data and operations
    const { events, fetchEvents, clearEventsCache, addTemporaryEvent, removeTemporaryEventById } = useCalendarData();
    // Next.js router for navigation
    const router = useRouter();
    // Reference to the calendar component instance
    const calendarRef = useRef<any>(null);
    // Controls success message visibility
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [confirmationErrorKey, setConfirmationErrorKey] = useState<string | null>(null);
    // Currently selected calendar event
    const [selectedEvent, setSelectedEvent] = useState<CalendarEventClickInfo | null>(null);
    // Currently selected time slot
    const [selectedSlot, setSelectedSlot] = useState<CalendarSlotSelectInfo | null>(null);
    // Selected registration method (Google/Microsoft)
    const [registrationMethod, setRegistrationMethod] = useState<RegistrationMethod>(null);
    // Details of the event being created/edited
    const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
    
    // Use refs to store the latest values to avoid infinite re-renders
    const eventDetailsRef = useRef<EventDetails | null>(null);
    const registrationMethodRef = useRef<RegistrationMethod>(null);
    
    // Update refs when values change
    useEffect(() => {
        eventDetailsRef.current = eventDetails;
    }, [eventDetails]);
    
    useEffect(() => {
        registrationMethodRef.current = registrationMethod;
    }, [registrationMethod]);
    
    // Event success handler
    const { handleEventCreationSuccess, isProcessingSuccess } = useEventSuccessHandler({
        addTemporaryEvent,
        removeTemporaryEventById,
        clearEventsCache,
        fetchEvents,
        setShowSuccessMessage,
        eventDetails,
        registrationMethod,
        setConfirmationErrorKey
    });
    
    // Fetch events when component mounts or query changes
    useEventFetching({
        routerQuery: router.query,
        fetchEvents,
        isProcessingSuccess
    });

    // Handle OAuth success flow from URL parameters
    useOAuthSuccessHandler({
        routerQuery: router.query,
        handleEventCreationSuccess,
        setRegistrationMethod,
        setEventDetails
    });

    // Calendar event handlers
    const { handleSelectSlot, handleEventClick, handleGuestEventCreated } = useCalendarEventHandlers({
        setSelectedSlot,
        setSelectedEvent,
        setRegistrationMethod,
        setEventDetails,
        handleEventCreationSuccess,
        addTemporaryEvent
    });

    // Get success message key based on registration method
    const successMessageKey = eventDetails ? getSuccessMessageKey(registrationMethod) : "";

    return (
        <>
            {confirmationErrorKey && (
                <ToastNotification
                    messageKey={confirmationErrorKey}
                    visible={true}
                    type="error"
                    duration={6000}
                    onClose={() => setConfirmationErrorKey(null)}
                />
            )}
            <LessonSchedulerLayout
                showSuccessMessage={showSuccessMessage}
                successMessageKey={successMessageKey}
                events={events}
                selectedEvent={selectedEvent}
                selectedSlot={selectedSlot}
                calendarRef={calendarRef}
                handleSelectSlot={handleSelectSlot}
                handleEventClick={handleEventClick}
                handleGuestEventCreated={handleGuestEventCreated}
                setRegistrationMethod={setRegistrationMethod}
                setEventDetails={setEventDetails}
            />
        </>
    );
}



