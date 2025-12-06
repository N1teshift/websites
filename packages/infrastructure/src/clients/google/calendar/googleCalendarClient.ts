import { getGoogleConfig, validateGoogleConfig } from '../config';
import { handleGoogleError } from '../errorHandler';
import { getServiceAccountCalendar } from '../auth/googleAuth';

/**
 * Google Calendar API Client
 * 
 * Provides methods to interact with Google Calendar API using the existing Google Calendar service.
 */
export class GoogleCalendarClient {
  private config: ReturnType<typeof getGoogleConfig>;

  constructor() {
    this.config = getGoogleConfig();
    const errors = validateGoogleConfig(this.config);
    if (errors.length > 0) {
      throw new Error(`Google configuration errors: ${errors.join(', ')}`);
    }
  }

  /**
   * Get calendar events
   */
  async getCalendarEvents(calendarId: string = 'primary', options: Record<string, unknown> = {}): Promise<unknown[]> {
    try {
      const calendar = getServiceAccountCalendar();
      
      const response = await calendar.events.list({
        calendarId: process.env.NEXT_PUBLIC_CALENDAR_EMAIL || calendarId,
        timeMin: new Date().toISOString(),
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 150,
        ...options
      });
      
      return response.data.items || [];
    } catch (error) {
      throw handleGoogleError(error, 'getCalendarEvents');
    }
  }

  /**
   * Create a calendar event
   */
  async createCalendarEvent(calendarId: string = 'primary', eventData: Record<string, unknown>): Promise<unknown> {
    try {
      const calendar = getServiceAccountCalendar();
      
      const response = await calendar.events.insert({
        calendarId: process.env.NEXT_PUBLIC_CALENDAR_EMAIL || calendarId,
        requestBody: eventData
      });
      
      return response.data;
    } catch (error) {
      throw handleGoogleError(error, 'createCalendarEvent');
    }
  }

  /**
   * Update a calendar event
   */
  async updateCalendarEvent(calendarId: string, eventId: string, eventData: Record<string, unknown>): Promise<unknown> {
    try {
      const calendar = getServiceAccountCalendar();
      
      const response = await calendar.events.update({
        calendarId: process.env.NEXT_PUBLIC_CALENDAR_EMAIL || calendarId,
        eventId,
        requestBody: eventData
      });
      
      return response.data;
    } catch (error) {
      throw handleGoogleError(error, 'updateCalendarEvent');
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteCalendarEvent(calendarId: string, eventId: string): Promise<void> {
    try {
      const calendar = getServiceAccountCalendar();
      
      await calendar.events.delete({
        calendarId: process.env.NEXT_PUBLIC_CALENDAR_EMAIL || calendarId,
        eventId
      });
    } catch (error) {
      throw handleGoogleError(error, 'deleteCalendarEvent');
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(): Promise<unknown> {
    try {
      const calendar = getServiceAccountCalendar();
      
      const response = await calendar.calendarList.list();
      return response.data;
    } catch (error) {
      throw handleGoogleError(error, 'getUserProfile');
    }
  }

  /**
   * Get list of calendars
   */
  async getCalendars(): Promise<unknown[]> {
    try {
      const calendar = getServiceAccountCalendar();
      
      const response = await calendar.calendarList.list();
      return response.data.items || [];
    } catch (error) {
      throw handleGoogleError(error, 'getCalendars');
    }
  }

  /**
   * Check calendar availability using Freebusy API
   */
  async checkAvailability(
    calendarId: string = 'primary',
    timeMin: string,
    timeMax: string
  ): Promise<{ busy: Array<{ start: string; end: string }> }> {
    try {
      const calendar = getServiceAccountCalendar();
      const targetCalendarId = process.env.NEXT_PUBLIC_CALENDAR_EMAIL || calendarId;
      
      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin,
          timeMax,
          items: [{ id: targetCalendarId }]
        }
      });
      
      const calendarData = response.data.calendars?.[targetCalendarId];
      const busy = (calendarData?.busy || [])
        .filter((period): period is { start: string; end: string } => 
          typeof period.start === 'string' && typeof period.end === 'string'
        );
      
      return {
        busy
      };
    } catch (error) {
      throw handleGoogleError(error, 'checkAvailability');
    }
  }

  /**
   * Get Google Drive files
   */
  async getDriveFiles(_query?: string): Promise<unknown[]> {
    try {
      // For now, return empty array as Drive API integration would need separate setup
      // This could be extended to use Google Drive API with proper authentication
      return [];
    } catch (error) {
      throw handleGoogleError(error, 'getDriveFiles');
    }
  }
}

/**
 * Create a new Google Calendar client instance
 */
export function createGoogleCalendarClient(): GoogleCalendarClient {
  return new GoogleCalendarClient();
}



