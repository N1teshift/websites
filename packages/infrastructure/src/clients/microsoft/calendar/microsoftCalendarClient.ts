import { getMicrosoftConfig, validateMicrosoftConfig } from '../config';
import { handleMicrosoftError } from '../errorHandler';
import { getAccessToken } from '../auth/microsoftAuth';
import { createComponentLogger } from '@websites/infrastructure/logging';

const logger = createComponentLogger('MicrosoftCalendarClient');

/**
 * Generic HTTP request helper using fetch
 */
async function httpRequest<T = unknown>(
  url: string,
  method: string = 'GET',
  body?: unknown,
  headers?: Record<string, string>
): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

/**
 * Microsoft Calendar API Client
 * 
 * Provides methods to interact with Microsoft Graph Calendar API using the existing token service.
 */
export class MicrosoftCalendarClient {
  private config: ReturnType<typeof getMicrosoftConfig>;

  constructor() {
    this.config = getMicrosoftConfig();
    const errors = validateMicrosoftConfig(this.config);
    if (errors.length > 0) {
      throw new Error(`Microsoft configuration errors: ${errors.join(', ')}`);
    }
  }

  /**
   * Get calendar events from Microsoft Graph
   */
  async getCalendarEvents(_calendarId: string = 'default', _options: Record<string, unknown> = {}): Promise<unknown[]> {
    const endpoint = `${this.config.graphApiUrl}/users/${process.env.USER_PRINCIPAL_NAME}/events`;
    
    try {
      const accessToken = await getAccessToken();
      
      const response = await httpRequest<{ value: unknown[] }>(endpoint, 'GET', undefined, {
        Authorization: `Bearer ${accessToken}`,
      });
      
      return response.value || [];
    } catch (error) {
      throw handleMicrosoftError(error, 'getCalendarEvents');
    }
  }

  /**
   * Create a new calendar event
   */
  async createEvent(eventData: Record<string, unknown>): Promise<unknown> {
    const endpoint = `${this.config.graphApiUrl}/users/${process.env.USER_PRINCIPAL_NAME}/events`;
    
    try {
      const accessToken = await getAccessToken();
      
      const response = await httpRequest<unknown>(endpoint, 'POST', eventData, {
        Authorization: `Bearer ${accessToken}`,
      });
      
      return response;
    } catch (error) {
      throw handleMicrosoftError(error, 'createEvent');
    }
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(eventId: string, eventData: Record<string, unknown>): Promise<unknown> {
    const endpoint = `${this.config.graphApiUrl}/users/${process.env.USER_PRINCIPAL_NAME}/events/${eventId}`;
    
    try {
      const accessToken = await getAccessToken();
      
      const response = await httpRequest<unknown>(endpoint, 'PATCH', eventData, {
        Authorization: `Bearer ${accessToken}`,
      });
      
      return response;
    } catch (error) {
      throw handleMicrosoftError(error, 'updateEvent');
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId: string): Promise<void> {
    const endpoint = `${this.config.graphApiUrl}/users/${process.env.USER_PRINCIPAL_NAME}/events/${eventId}`;
    
    try {
      const accessToken = await getAccessToken();
      
      await httpRequest<void>(endpoint, 'DELETE', undefined, {
        Authorization: `Bearer ${accessToken}`,
      });
    } catch (error) {
      throw handleMicrosoftError(error, 'deleteEvent');
    }
  }

  /**
   * Get a specific calendar event by ID
   */
  async getEvent(eventId: string): Promise<unknown> {
    const endpoint = `${this.config.graphApiUrl}/users/${process.env.USER_PRINCIPAL_NAME}/events/${eventId}`;
    
    try {
      const accessToken = await getAccessToken();
      
      const response = await httpRequest<unknown>(endpoint, 'GET', undefined, {
        Authorization: `Bearer ${accessToken}`,
      });
      
      return response;
    } catch (error) {
      throw handleMicrosoftError(error, 'getEvent');
    }
  }

  /**
   * Get calendar list
   */
  async getCalendars(): Promise<unknown[]> {
    const endpoint = `${this.config.graphApiUrl}/users/${process.env.USER_PRINCIPAL_NAME}/calendars`;
    
    try {
      const accessToken = await getAccessToken();
      
      const response = await httpRequest<{ value: unknown[] }>(endpoint, 'GET', undefined, {
        Authorization: `Bearer ${accessToken}`,
      });
      
      return response.value || [];
    } catch (error) {
      throw handleMicrosoftError(error, 'getCalendars');
    }
  }

  /**
   * Get events from a specific calendar
   */
  async getCalendarEventsByCalendar(calendarId: string): Promise<unknown[]> {
    const endpoint = `${this.config.graphApiUrl}/users/${process.env.USER_PRINCIPAL_NAME}/calendars/${calendarId}/events`;
    
    try {
      const accessToken = await getAccessToken();
      
      const response = await httpRequest<{ value: unknown[] }>(endpoint, 'GET', undefined, {
        Authorization: `Bearer ${accessToken}`,
      });
      
      return response.value || [];
    } catch (error) {
      throw handleMicrosoftError(error, 'getCalendarEventsByCalendar');
    }
  }

  /**
   * Get events in a date range
   */
  async getEventsInRange(startDateTime: string, endDateTime: string): Promise<unknown[]> {
    const endpoint = `${this.config.graphApiUrl}/users/${process.env.USER_PRINCIPAL_NAME}/calendarView`;
    const params = new URLSearchParams({
      startDateTime,
      endDateTime,
    });
    
    try {
      const accessToken = await getAccessToken();
      
      const response = await httpRequest<{ value: unknown[] }>(`${endpoint}?${params.toString()}`, 'GET', undefined, {
        Authorization: `Bearer ${accessToken}`,
      });
      
      return response.value || [];
    } catch (error) {
      throw handleMicrosoftError(error, 'getEventsInRange');
    }
  }

  /**
   * Send a calendar event invitation
   */
  async sendInvitation(eventId: string, message: string): Promise<unknown> {
    const endpoint = `${this.config.graphApiUrl}/users/${process.env.USER_PRINCIPAL_NAME}/events/${eventId}/sendMail`;
    
    try {
      const accessToken = await getAccessToken();
      
      const response = await httpRequest<unknown>(endpoint, 'POST', { body: { content: message } }, {
        Authorization: `Bearer ${accessToken}`,
      });
      
      return response;
    } catch (error) {
      throw handleMicrosoftError(error, 'sendInvitation');
    }
  }

  /**
   * Check calendar availability (free/busy)
   */
  async checkAvailability(
    startTime: string,
    endTime: string,
    attendees?: string[]
  ): Promise<Array<{ start: string; end: string }>> {
    const endpoint = `${this.config.graphApiUrl}/users/${process.env.USER_PRINCIPAL_NAME}/calendar/getSchedule`;
    
    try {
      const accessToken = await getAccessToken();
      
      const requestBody = {
        schedules: attendees || [process.env.USER_PRINCIPAL_NAME || ''],
        startTime: {
          dateTime: startTime,
          timeZone: 'UTC',
        },
        endTime: {
          dateTime: endTime,
          timeZone: 'UTC',
        },
        availabilityViewInterval: 60,
      };
      
      const response = await httpRequest<{ value: Array<{ scheduleItems: Array<{ start: { dateTime: string }; end: { dateTime: string } }> }> }>(
        endpoint,
        'POST',
        requestBody,
        {
          Authorization: `Bearer ${accessToken}`,
        }
      );
      
      if (!response.value || response.value.length === 0) {
        return [];
      }
      
      return {
        busy: response.value.map((schedule: any) => ({
          start: schedule.scheduleItems?.[0]?.start?.dateTime || startTime,
          end: schedule.scheduleItems?.[0]?.end?.dateTime || endTime,
        })),
      } as any;
    } catch (error) {
      throw handleMicrosoftError(error, 'checkAvailability');
    }
  }
}

/**
 * Factory function to create a Microsoft Calendar Client instance
 */
export function createMicrosoftCalendarClient(): MicrosoftCalendarClient {
  return new MicrosoftCalendarClient();
}
