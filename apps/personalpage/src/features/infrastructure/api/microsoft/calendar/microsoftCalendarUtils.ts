import { apiRequest } from '../../apiRequest';
import { handleMicrosoftError } from '../errorHandler';
import { createComponentLogger } from '@websites/infrastructure/logging';
import { MicrosoftEvent } from '@/features/modules/calendar/types';

const logger = createComponentLogger('MicrosoftCalendarUtils');

/**
 * Creates a new event in the user's Microsoft Calendar using the Microsoft Graph API.
 * 
 * @param accessToken - The access token for Microsoft Graph API
 * @param event - The event data to create
 * @returns Promise resolving to the created event data
 */
export async function createMicrosoftCalendarEvent(accessToken: string, event: MicrosoftEvent): Promise<unknown> {
    const endpoint = 'https://graph.microsoft.com/v1.0/me/events';
    
    try {
        logger.debug('Creating Microsoft Calendar event', { eventSummary: event.subject });
        
        const response = await apiRequest<unknown>(endpoint, 'POST', event as unknown as Record<string, unknown>, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        });
        
        logger.info('Successfully created Microsoft Calendar event', { 
            eventId: (response as Record<string, unknown>)?.id,
            summary: (response as Record<string, unknown>)?.subject 
        });
        
        return response;
    } catch (error) {
        throw handleMicrosoftError(error, 'createMicrosoftCalendarEvent');
    }
}



