/**
 * Microsoft API utilities
 * Re-exports from clients/microsoft for convenience
 */

export { createMSALClient } from '../clients/microsoft/auth/microsoftAuth';
export { getMicrosoftConfig } from '../clients/microsoft/config';
export { createMicrosoftEvent as createMicrosoftCalendarEvent } from '../clients/microsoft/calendar/microsoftCalendarUtils';
export type { MicrosoftEvent } from '../clients/microsoft/calendar/microsoftCalendarUtils';
export { createMicrosoftCalendarClient, MicrosoftCalendarClient } from '../clients/microsoft/calendar/microsoftCalendarClient';
