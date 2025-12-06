import { handleMicrosoftError } from '../errorHandler';
import { createComponentLogger } from '@websites/infrastructure/logging';
import { getAccessToken } from '../auth/microsoftAuth';
import { getMicrosoftConfig } from '../config';

// MicrosoftEvent type - apps should define this or import from their types
// For now, using a generic type
export interface MicrosoftEvent {
  id?: string;
  subject?: string;
  start?: { dateTime: string; timeZone?: string };
  end?: { dateTime: string; timeZone?: string };
  [key: string]: any;
}

const logger = createComponentLogger('MicrosoftCalendarUtils');

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
 * Creates a new event in the user's Microsoft Calendar using the Microsoft Graph API.
 * 
 * @param accessToken - The access token for Microsoft Graph API
 * @param event - The event data to create
 * @returns The created event
 */
export async function createMicrosoftEvent(
  event: MicrosoftEvent
): Promise<MicrosoftEvent> {
  logger.debug('Creating Microsoft calendar event', { subject: event.subject });
  
  try {
    const config = getMicrosoftConfig();
    const accessToken = await getAccessToken();
    const endpoint = `${config.graphApiUrl}/users/${process.env.USER_PRINCIPAL_NAME}/events`;
    
    const response = await httpRequest<MicrosoftEvent>(endpoint, 'POST', event, {
      Authorization: `Bearer ${accessToken}`,
    });
    
    logger.info('Microsoft calendar event created', { eventId: response.id });
    return response;
  } catch (error) {
    throw handleMicrosoftError(error, 'createMicrosoftEvent');
  }
}
