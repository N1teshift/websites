import { apiRequest } from '../../apiRequest';
import { getMicrosoftConfig, validateMicrosoftConfig } from '../config';
import { handleMicrosoftError } from '../errorHandler';
import { getAccessToken } from '../auth/microsoftAuth';

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
      
      const response = await apiRequest<{ value: unknown[] }>(endpoint, 'GET', undefined, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });
      
      return response.value || [];
    } catch (error) {
      throw handleMicrosoftError(error, endpoint);
    }
  }

  /**
   * Create a calendar event
   */
  async createCalendarEvent(_calendarId: string = 'default', eventData: Record<string, unknown>): Promise<unknown> {
    const endpoint = `${this.config.graphApiUrl}/users/${process.env.USER_PRINCIPAL_NAME}/events`;
    
    try {
      const accessToken = await getAccessToken();
      
      const response = await apiRequest<unknown>(endpoint, 'POST', eventData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });
      
      return response;
    } catch (error) {
      throw handleMicrosoftError(error, 'createCalendarEvent');
    }
  }

  /**
   * Update a calendar event
   */
  async updateCalendarEvent(calendarId: string, eventId: string, eventData: Record<string, unknown>): Promise<unknown> {
    const endpoint = `${this.config.graphApiUrl}/users/${process.env.USER_PRINCIPAL_NAME}/events/${eventId}`;
    
    try {
      const accessToken = await getAccessToken();
      
      const response = await apiRequest<unknown>(endpoint, 'PATCH', eventData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });
      
      return response;
    } catch (error) {
      throw handleMicrosoftError(error, 'updateCalendarEvent');
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteCalendarEvent(calendarId: string, eventId: string): Promise<void> {
    const endpoint = `${this.config.graphApiUrl}/users/${process.env.USER_PRINCIPAL_NAME}/events/${eventId}`;
    
    try {
      const accessToken = await getAccessToken();
      
      await apiRequest<void>(endpoint, 'DELETE', undefined, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });
    } catch (error) {
      throw handleMicrosoftError(error, 'deleteCalendarEvent');
    }
  }

  /**
   * Get user profile from Microsoft Graph
   */
  async getUserProfile(): Promise<unknown> {
    const endpoint = `${this.config.graphApiUrl}/me`;
    
    try {
      const accessToken = await getAccessToken();
      
      const response = await apiRequest<unknown>(endpoint, 'GET', undefined, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });
      
      return response;
    } catch (error) {
      throw handleMicrosoftError(error, 'getUserProfile');
    }
  }

  /**
   * Get user's calendars
   */
  async getCalendars(): Promise<unknown[]> {
    const endpoint = `${this.config.graphApiUrl}/me/calendars`;
    
    try {
      const accessToken = await getAccessToken();
      
      const response = await apiRequest<{ value: unknown[] }>(endpoint, 'GET', undefined, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });
      
      return response.value || [];
    } catch (error) {
      throw handleMicrosoftError(error, 'getCalendars');
    }
  }

  /**
   * Get OneDrive files
   */
  async getOneDriveFiles(_folderPath: string = '/'): Promise<unknown[]> {
    const endpoint = `${this.config.graphApiUrl}/me/drive/root/children`;
    
    try {
      const accessToken = await getAccessToken();
      
      const response = await apiRequest<{ value: unknown[] }>(endpoint, 'GET', undefined, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });
      
      return response.value || [];
    } catch (error) {
      throw handleMicrosoftError(error, 'getOneDriveFiles');
    }
  }

  /**
   * Get Teams messages
   */
  async getTeamsMessages(teamId: string, channelId: string): Promise<unknown[]> {
    const endpoint = `${this.config.graphApiUrl}/teams/${teamId}/channels/${channelId}/messages`;
    
    try {
      const accessToken = await getAccessToken();
      
      const response = await apiRequest<{ value: unknown[] }>(endpoint, 'GET', undefined, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });
      
      return response.value || [];
    } catch (error) {
      throw handleMicrosoftError(error, 'getTeamsMessages');
    }
  }

  /**
   * Send Teams message
   */
  async sendTeamsMessage(teamId: string, channelId: string, message: string): Promise<unknown> {
    const endpoint = `${this.config.graphApiUrl}/teams/${teamId}/channels/${channelId}/messages`;
    
    try {
      const accessToken = await getAccessToken();
      
      const response = await apiRequest<unknown>(endpoint, 'POST', { body: { content: message } }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });
      
      return response;
    } catch (error) {
      throw handleMicrosoftError(error, 'sendTeamsMessage');
    }
  }

  /**
   * Check calendar availability using calendarView API
   */
  async checkAvailability(
    calendarId: string = 'default',
    startDateTime: string,
    endDateTime: string
  ): Promise<{ busy: Array<{ start: string; end: string }> }> {
    const endpoint = `${this.config.graphApiUrl}/users/${process.env.USER_PRINCIPAL_NAME}/calendarView`;
    
    try {
      const accessToken = await getAccessToken();
      
      const url = new URL(endpoint);
      url.searchParams.append('startDateTime', startDateTime);
      url.searchParams.append('endDateTime', endDateTime);
      url.searchParams.append('$select', 'start,end');
      
      const response = await apiRequest<{ value: Array<{ start: { dateTime: string }; end: { dateTime: string } }> }>(
        url.toString(),
        'GET',
        undefined,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          }
        }
      );
      
      return {
        busy: response.value.map(event => ({
          start: event.start.dateTime,
          end: event.end.dateTime
        }))
      };
    } catch (error) {
      throw handleMicrosoftError(error, 'checkAvailability');
    }
  }
}

/**
 * Create a new Microsoft Calendar client instance
 */
export function createMicrosoftCalendarClient(): MicrosoftCalendarClient {
  return new MicrosoftCalendarClient();
}



