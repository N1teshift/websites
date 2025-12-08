/**
 * Re-export date-fns functions and locales for consistent usage across apps
 *
 * Usage:
 * import { format, parseISO } from '@websites/infrastructure/date-fns';
 * import { enUS, ru } from '@websites/infrastructure/date-fns/locale';
 */

// Re-export all date-fns functions
export * from "date-fns";

// Re-export locales
export * as locale from "date-fns/locale";
