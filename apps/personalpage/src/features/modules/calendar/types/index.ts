export interface CalendarEventInput {
    id?: string;
    title: string;
    start: string | Date;
    end: string | Date;
    isTemporary?: boolean;
    registrationMethod?: "google" | "microsoft" | "guest" | null;
    classNames?: string[];
    backgroundColor?: string;
    borderColor?: string;
}

export interface CalendarEventDisplay {
    id?: string;
    title: string;
    start: Date;
    end: Date;
    isTemporary?: boolean;
    registrationMethod?: "google" | "microsoft" | "guest" | null;
}

export interface SharedEventDetails {
    summary: string;
    startDateTime: string; // ISO 8601 format
    endDateTime: string; // ISO 8601 format
    attendees?: { email: string; name?: string }[];
    language?: string;
    phoneNumber?: string;
}

export interface MicrosoftEvent {
    subject: string;
    start: {
        dateTime: string; // ISO 8601 format
        timeZone: string; // IANA time zone identifier
    };
    end: {
        dateTime: string; // ISO 8601 format
        timeZone: string; // IANA time zone identifier
    };
    attendees?: Array<{
        emailAddress: {
            address: string;
            name: string;
        };
        type: string;
    }>;
    isOnlineMeeting: boolean;
    onlineMeetingProvider: string;
}

export interface GraphEvent {
    id: string;
    summary: string;
    start: {
        dateTime: string; // ISO 8601 format
        timeZone: string; // IANA time zone identifier
    };
    end: {
        dateTime: string; // ISO 8601 format
        timeZone: string; // IANA time zone identifier
    };
}

export type RegistrationMethod = "google" | "microsoft" | "guest" | null;

export interface EventDetails {
    duration: number; // Duration of the event in minutes
    startTime: string; // ISO 8601 format
    email?: string;
}

export interface RegistrationInfo {
    method: RegistrationMethod;
    duration: number;
    startTime: string;
}

export interface TemporaryEvent extends CalendarEventInput {
    isTemporary: true;
    registrationMethod: RegistrationMethod;
    createdAt?: number;
    confirmationDeadline?: number;
}

// Types for calendar event interactions (replacing FullCalendar types)
export interface CalendarEventClickInfo {
    event: {
        id?: string;
        start: Date;
        end: Date;
        title: string;
    };
}

export interface CalendarSlotSelectInfo {
    start: Date;
    end: Date;
}

export interface AvailabilityCheckResult {
  isAvailable: boolean;
  busy: Array<{ start: string; end: string }>;
}

export interface BookingOptions {
  calendarId?: string;
  startDateTime: string;
  endDateTime: string;
  summary: string;
  description?: string;
  attendees?: Array<{ email: string; name?: string }>;
}



