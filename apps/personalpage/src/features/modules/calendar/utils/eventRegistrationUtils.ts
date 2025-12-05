import { ParsedUrlQuery } from "querystring";
import { RegistrationMethod, EventDetails, RegistrationInfo, TemporaryEvent } from "../types";

/** Parses registration info from URL query parameters for OAuth flows. */
export const parseRegistrationInfoFromUrl = (query: ParsedUrlQuery): RegistrationInfo | null => {
    if (!query.registrationInfo) return null;
    
    try {
        const registrationInfo = JSON.parse(decodeURIComponent(query.registrationInfo as string));
        return {
            method: registrationInfo.method,
            duration: registrationInfo.duration,
            startTime: registrationInfo.startTime
        };
    } catch (error) {
        console.error("Error parsing registration info:", error);
        return null;
    }
};

/** Maps registration method to success message translation key. */
export const getSuccessMessageKey = (registrationMethod: RegistrationMethod): string => {
    switch (registrationMethod) {
        case "google":
            return "success_google";
        case "microsoft":
            return "success_microsoft";
        case "guest":
            return "success_guest";
        default:
            return "";
    }
};

/** Creates a temporary event to show immediately after successful event creation. */
export const createTemporaryEvent = (
    eventDetails: EventDetails,
    registrationMethod: RegistrationMethod
): TemporaryEvent => {
    const startTime = new Date(eventDetails.startTime);
    const endTime = new Date(startTime.getTime() + eventDetails.duration * 60 * 1000);
    const createdAt = Date.now();
    
    return {
        id: `temp-${Date.now()}`, // Unique temporary ID
        title: "occupied", // Translation key - will be translated by useCalendarEvents hook
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        isTemporary: true,
        registrationMethod,
        createdAt,
        confirmationDeadline: createdAt + 30_000,
        // Add visual styling for temporary events
        classNames: ['temporary-event'],
        backgroundColor: registrationMethod === 'google' ? '#4285f4' : 
                       registrationMethod === 'microsoft' ? '#00a1f1' : '#34a853',
        borderColor: registrationMethod === 'google' ? '#3367d6' : 
                    registrationMethod === 'microsoft' ? '#0078d4' : '#2d8a3e'
    };
};

 



