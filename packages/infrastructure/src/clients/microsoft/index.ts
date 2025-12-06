/**
 * Microsoft API Client Module
 * 
 * Self-contained module for Microsoft API interactions.
 * Can be copied to other projects with minimal configuration.
 */

// Configuration
export * from './config';

// Error handling
export * from './errorHandler';

// Authentication services
export * from './auth/microsoftAuth';

// Calendar services
export * from './calendar/microsoftCalendarClient';
export * from './calendar/microsoftCalendarUtils';



