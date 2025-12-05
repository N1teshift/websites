import { useState, useCallback } from 'react';
import { createComponentLogger } from '@websites/infrastructure/logging';
import { apiRequest } from '@/features/infrastructure/api';
import { AvailabilityCheckResult } from '../types';

/**
 * Custom hook for checking calendar availability.
 * 
 * Provides functions to check availability for Google and Microsoft calendars
 * before booking a time slot.
 */
export function useAvailabilityCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [lastResult, setLastResult] = useState<AvailabilityCheckResult | null>(null);
  const logger = createComponentLogger('AvailabilityCheck');

  /**
   * Check Google Calendar availability
   */
  const checkGoogleAvailability = useCallback(async (
    startDateTime: string,
    endDateTime: string,
    calendarId: string = 'primary'
  ): Promise<AvailabilityCheckResult> => {
    setIsChecking(true);
    try {
      logger.debug('Checking Google Calendar availability', { startDateTime, endDateTime, calendarId });
      
      const result = await apiRequest<AvailabilityCheckResult>(
        `/api/calendar/check-availability-google?startDateTime=${encodeURIComponent(startDateTime)}&endDateTime=${encodeURIComponent(endDateTime)}&calendarId=${encodeURIComponent(calendarId)}`,
        'GET'
      );
      
      setLastResult(result);
      logger.info('Google Calendar availability checked', { 
        isAvailable: result.isAvailable,
        busyCount: result.busy.length
      });
      
      return result;
    } catch (error) {
      logger.error('Error checking Google Calendar availability', 
        error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      setIsChecking(false);
    }
  }, [logger]);

  /**
   * Check Microsoft Calendar availability
   */
  const checkMicrosoftAvailability = useCallback(async (
    startDateTime: string,
    endDateTime: string,
    calendarId: string = 'default'
  ): Promise<AvailabilityCheckResult> => {
    setIsChecking(true);
    try {
      logger.debug('Checking Microsoft Calendar availability', { startDateTime, endDateTime, calendarId });
      
      const result = await apiRequest<AvailabilityCheckResult>(
        `/api/calendar/check-availability-microsoft?startDateTime=${encodeURIComponent(startDateTime)}&endDateTime=${encodeURIComponent(endDateTime)}&calendarId=${encodeURIComponent(calendarId)}`,
        'GET'
      );
      
      setLastResult(result);
      logger.info('Microsoft Calendar availability checked', { 
        isAvailable: result.isAvailable,
        busyCount: result.busy.length
      });
      
      return result;
    } catch (error) {
      logger.error('Error checking Microsoft Calendar availability', 
        error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      setIsChecking(false);
    }
  }, [logger]);

  return {
    checkGoogleAvailability,
    checkMicrosoftAvailability,
    isChecking,
    lastResult
  };
}




