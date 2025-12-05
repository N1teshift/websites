import { useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { createTemporaryEvent, parseRegistrationInfoFromUrl } from "@calendar/utils/eventRegistrationUtils";
import { RegistrationMethod, EventDetails, TemporaryEvent, CalendarEventClickInfo, CalendarSlotSelectInfo, AvailabilityCheckResult } from "@calendar/types";
import { ParsedUrlQuery } from "querystring";
import { createComponentLogger } from "@websites/infrastructure/logging";
import { apiRequest } from "@websites/infrastructure/api";

const CONFIRMATION_TIMEOUT_MS = 30_000;
const CONFIRMATION_POLL_INTERVAL_MS = 4_000;
const SUCCESS_MESSAGE_DURATION_MS = 5_000;

interface UseCalendarEventHandlersProps {
    setSelectedSlot: (slot: CalendarSlotSelectInfo | null) => void;
    setSelectedEvent: (event: CalendarEventClickInfo | null) => void;
    setRegistrationMethod: (method: RegistrationMethod) => void;
    setEventDetails: (details: EventDetails | null) => void;
    handleEventCreationSuccess: () => void;
    addTemporaryEvent: (event: TemporaryEvent) => void;
}

/** Hook for handling calendar event slot selection, event clicks, and guest event creation. */
export const useCalendarEventHandlers = ({
    setSelectedSlot,
    setSelectedEvent,
    setRegistrationMethod,
    setEventDetails,
    handleEventCreationSuccess,
    addTemporaryEvent
}: UseCalendarEventHandlersProps) => {
    
    const handleSelectSlot = useCallback((slotInfo: CalendarSlotSelectInfo) => {
        setSelectedSlot(slotInfo);
        setSelectedEvent(null);
    }, [setSelectedSlot, setSelectedEvent]);

    const handleEventClick = useCallback((event: CalendarEventClickInfo) => {
        setSelectedEvent(event);
    }, [setSelectedEvent]);

    const handleGuestEventCreated = useCallback((success: boolean, details?: EventDetails) => {
        if (success && details) {
            setRegistrationMethod("guest");
            setEventDetails(details);
            // Create temporary event immediately with the correct details
            const tempEvent = createTemporaryEvent(details, "guest");
            addTemporaryEvent(tempEvent);
            setSelectedSlot(null); // Clear the selected slot to return to "no selection" state
            // Trigger success handling to fetch the actual event
            handleEventCreationSuccess();
        }
    }, [setRegistrationMethod, setEventDetails, addTemporaryEvent, setSelectedSlot, handleEventCreationSuccess]);

    return {
        handleSelectSlot,
        handleEventClick,
        handleGuestEventCreated
    };
};

interface UseEventSuccessHandlerProps {
    addTemporaryEvent: (event: TemporaryEvent) => void;
    removeTemporaryEventById: (tempEventId: string) => void;
    clearEventsCache: () => void;
    fetchEvents: (force?: boolean) => void;
    setShowSuccessMessage: (show: boolean) => void;
    eventDetails: EventDetails | null;
    registrationMethod: RegistrationMethod;
    setConfirmationErrorKey: (key: string | null) => void;
}

/** Hook for handling event creation success: manages temp event, cache, and success message. */
export const useEventSuccessHandler = ({
    addTemporaryEvent,
    removeTemporaryEventById,
    clearEventsCache,
    fetchEvents,
    setShowSuccessMessage,
    eventDetails,
    registrationMethod,
    setConfirmationErrorKey
}: UseEventSuccessHandlerProps) => {
    const router = useRouter();
    const isProcessingSuccess = useRef(false);
    const confirmationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const loggerRef = useRef(createComponentLogger('CalendarInteractions'));
    const logger = loggerRef.current;

    const clearConfirmationTimer = () => {
        if (confirmationTimeoutRef.current) {
            clearTimeout(confirmationTimeoutRef.current);
            confirmationTimeoutRef.current = null;
        }
    };

    const scheduleHideSuccessMessage = () => {
        if (hideMessageTimeoutRef.current) {
            clearTimeout(hideMessageTimeoutRef.current);
        }
        hideMessageTimeoutRef.current = setTimeout(() => {
            setShowSuccessMessage(false);
            isProcessingSuccess.current = false;
        }, SUCCESS_MESSAGE_DURATION_MS);
    };

    const confirmEventPresence = useCallback((tempEvent: TemporaryEvent, details: EventDetails) => {
        const deadline = Date.now() + CONFIRMATION_TIMEOUT_MS;
        const startDateTime = new Date(details.startTime).toISOString();
        const endDateTime = new Date(new Date(details.startTime).getTime() + details.duration * 60 * 1000).toISOString();

        const poll = async () => {
            try {
                const params = new URLSearchParams({
                    startDateTime,
                    endDateTime
                });
                const result = await apiRequest<AvailabilityCheckResult>(`/api/calendar/check-availability-google?${params.toString()}`, 'GET');
                if (!result.isAvailable) {
                    logger.info("Google Calendar reports slot as occupied. Confirming event creation.");
                    removeTemporaryEventById(tempEvent.id ?? '');
                    clearConfirmationTimer();
                    clearEventsCache();
                    await fetchEvents(true);
                    scheduleHideSuccessMessage();
                    return;
                }
            } catch (error) {
                const normalizedError = error instanceof Error ? error : new Error(String(error));
                logger.warn("Failed to confirm event presence, will retry", { error: normalizedError.message });
            }

            if (Date.now() >= deadline) {
                logger.warn("Event confirmation timed out");
                removeTemporaryEventById(tempEvent.id ?? '');
                clearConfirmationTimer();
                setConfirmationErrorKey("event_confirmation_timeout");
                setShowSuccessMessage(false);
                isProcessingSuccess.current = false;
                return;
            }

            confirmationTimeoutRef.current = setTimeout(poll, CONFIRMATION_POLL_INTERVAL_MS);
        };

        poll();
    }, [clearEventsCache, fetchEvents, removeTemporaryEventById, setConfirmationErrorKey, setShowSuccessMessage, logger]);
    
    const handleEventCreationSuccess = useCallback(() => {
        if (isProcessingSuccess.current) {
            logger.debug("Success handler already running, skipping");
            return;
        }
        
        logger.debug("Event creation success handler called");
        isProcessingSuccess.current = true;
        setShowSuccessMessage(true);
        setConfirmationErrorKey(null);
        
        // Clean up the URL to prevent re-triggering
        if (router.query.success === "true") {
            router.replace({
                pathname: router.pathname,
                query: {}
            }, undefined, { shallow: true });
        }
        
        // Only create temporary event for OAuth flows (guest events create their own)
        if (eventDetails && registrationMethod) {
            const tempEvent = createTemporaryEvent(eventDetails, registrationMethod);
            addTemporaryEvent(tempEvent);
            confirmEventPresence(tempEvent, eventDetails);
        } else {
            scheduleHideSuccessMessage();
        }
    }, [addTemporaryEvent, confirmEventPresence, eventDetails, registrationMethod, router, scheduleHideSuccessMessage, setConfirmationErrorKey, setShowSuccessMessage]);
    
    useEffect(() => {
        return () => {
            clearConfirmationTimer();
            if (hideMessageTimeoutRef.current) {
                clearTimeout(hideMessageTimeoutRef.current);
            }
        };
    }, []);
    
    return { handleEventCreationSuccess, isProcessingSuccess: isProcessingSuccess.current };
};

interface UseEventFetchingProps {
    routerQuery: ParsedUrlQuery;
    fetchEvents: () => void;
    isProcessingSuccess?: boolean;
}

interface UseOAuthSuccessHandlerProps {
    routerQuery: ParsedUrlQuery;
    handleEventCreationSuccess: () => void;
    setRegistrationMethod: (method: RegistrationMethod) => void;
    setEventDetails: (details: EventDetails | null) => void;
}

/** Fetches calendar events when the component mounts or query changes. */
export const useEventFetching = ({
    routerQuery,
    fetchEvents,
    isProcessingSuccess = false
}: UseEventFetchingProps) => {
    const fetchEventsRef = useRef(fetchEvents);
    fetchEventsRef.current = fetchEvents;
    
    useEffect(() => {
        const logger = createComponentLogger('CalendarInteractions');
        
        // Don't fetch events if we're in the middle of a success flow
        if (routerQuery.success === "true" || isProcessingSuccess) {
            logger.debug("Skipping fetchEvents during success flow");
            return;
        }
        
        // Only fetch on initial mount or when query changes (but not when clearing success)
        const hasQueryParams = Object.keys(routerQuery).length > 0;
        if (hasQueryParams && !routerQuery.success) {
            logger.debug("useEffect triggered, router.query:", routerQuery);
            fetchEventsRef.current();
        } else if (!hasQueryParams) {
            // Initial load
            logger.debug("Initial load, fetching events");
            fetchEventsRef.current();
        }
    }, [routerQuery, isProcessingSuccess]);
};

/** Handles OAuth success flow by parsing URL parameters and setting registration details. */
export const useOAuthSuccessHandler = ({
    routerQuery,
    handleEventCreationSuccess,
    setRegistrationMethod,
    setEventDetails
}: UseOAuthSuccessHandlerProps) => {
    const handleEventCreationSuccessRef = useRef(handleEventCreationSuccess);
    const setRegistrationMethodRef = useRef(setRegistrationMethod);
    const setEventDetailsRef = useRef(setEventDetails);
    
    handleEventCreationSuccessRef.current = handleEventCreationSuccess;
    setRegistrationMethodRef.current = setRegistrationMethod;
    setEventDetailsRef.current = setEventDetails;
    
    useEffect(() => {
        const logger = createComponentLogger('CalendarInteractions');
        
        if (routerQuery.success === "true") {
            logger.debug("Detected success=true, calling handleEventCreationSuccess");
            
            // Parse registration info from URL for OAuth flows
            const registrationInfo = parseRegistrationInfoFromUrl(routerQuery);
            if (registrationInfo) {
                logger.debug("Registration info from URL", {
                    method: registrationInfo.method,
                    duration: registrationInfo.duration,
                    startTime: registrationInfo.startTime
                });
                setRegistrationMethodRef.current(registrationInfo.method);
                setEventDetailsRef.current({
                    duration: registrationInfo.duration,
                    startTime: registrationInfo.startTime
                });
            }
            
            // Add a small delay to ensure state updates are processed
            setTimeout(() => {
                handleEventCreationSuccessRef.current();
            }, 100);
        }
    }, [routerQuery]);
};



