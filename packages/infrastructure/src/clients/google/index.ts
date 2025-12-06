/**
 * Google API Client Module
 * 
 * Self-contained module for Google API interactions.
 * Can be copied to other projects with minimal configuration.
 */

// Configuration
export * from './config';

// Error handling
export * from './errorHandler';

// Authentication services
export * from './auth/googleAuth';

// Calendar services
export * from './calendar/googleCalendarClient';
export * from './calendar/googleCalendarUtils';



