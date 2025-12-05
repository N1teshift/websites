import { NextApiRequest, NextApiResponse } from 'next';
import { createComponentLogger } from '@websites/infrastructure/logging';
import { checkMicrosoftAvailability } from '@/features/modules/calendar/api';

const logger = createComponentLogger('CheckAvailabilityMicrosoft', 'handler');

/**
 * API route handler for checking Microsoft Calendar availability.
 *
 * Expects a GET request with query parameters:
 * - startDateTime: ISO 8601 date string
 * - endDateTime: ISO 8601 date string
 * - calendarId (optional): Calendar ID, defaults to 'default'
 *
 * Returns availability status and busy time slots.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { startDateTime, endDateTime, calendarId } = req.query;

    if (!startDateTime || !endDateTime) {
      return res.status(400).json({ 
        error: 'Missing required parameters: startDateTime and endDateTime are required' 
      });
    }

    if (typeof startDateTime !== 'string' || typeof endDateTime !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid parameters: startDateTime and endDateTime must be strings' 
      });
    }

    logger.info('Checking Microsoft Calendar availability', { 
      startDateTime, 
      endDateTime, 
      calendarId: calendarId as string || 'default' 
    });

    const result = await checkMicrosoftAvailability(
      startDateTime,
      endDateTime,
      typeof calendarId === 'string' ? calendarId : 'default'
    );

    logger.info('Microsoft Calendar availability check completed', { 
      isAvailable: result.isAvailable,
      busyCount: result.busy.length
    });

    res.status(200).json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to check Microsoft Calendar availability', 
      error instanceof Error ? error : new Error(errorMessage));
    
    res.status(500).json({
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
}




