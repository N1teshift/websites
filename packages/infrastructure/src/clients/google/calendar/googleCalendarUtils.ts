import { OAuth2Client, JWT } from 'google-auth-library';
import { google, calendar_v3 } from 'googleapis';
import { getServiceAccountCalendar } from '../auth/googleAuth';
import { handleGoogleError } from '../errorHandler';
import { createComponentLogger } from '@websites/infrastructure/logging';

const logger = createComponentLogger('GoogleCalendarUtils');

/**
 * Creates a new event in a specified Google Calendar.
 * 
 * @param auth - OAuth2Client or JWT for authentication
 * @param calendarId - The calendar ID (e.g., 'primary', email address)
 * @param event - The event data to create
 * @returns Promise resolving to the created event data
 */
export async function createGoogleCalendarEvent(
    auth: OAuth2Client | JWT, 
    calendarId: string, 
    event: calendar_v3.Schema$Event
): Promise<calendar_v3.Schema$Event> {
    const calendar = google.calendar({ version: 'v3', auth });

    try {
        logger.debug('Creating Google Calendar event', { calendarId, eventSummary: event.summary });
        
        const response = await calendar.events.insert({
            calendarId,
            requestBody: event,
        });
        
        logger.info('Successfully created Google Calendar event', { 
            eventId: response.data.id,
            summary: response.data.summary 
        });
        
        return response.data;
    } catch (error) {
        throw handleGoogleError(error, `createGoogleCalendarEvent:${calendarId}`);
    }
}

/**
 * Creates a new event in a predefined Google Calendar using service account authentication.
 * 
 * @param event - The event data to create
 * @returns Promise resolving to the created event data
 */
export async function createServiceAccountEvent(event: calendar_v3.Schema$Event): Promise<calendar_v3.Schema$Event> {
    try {
        logger.debug('Creating service account Google Calendar event', { eventSummary: event.summary });
        
        // Get the authenticated Google Calendar client using the service account
        const calendar = getServiceAccountCalendar();

        const response = await calendar.events.insert({
            calendarId: process.env.NEXT_PUBLIC_CALENDAR_EMAIL,
            requestBody: event,
        });
        
        logger.info('Successfully created service account Google Calendar event', { 
            eventId: response.data.id,
            summary: response.data.summary 
        });
        
        return response.data;
    } catch (error) {
        throw handleGoogleError(error, 'createServiceAccountEvent');
    }
}



