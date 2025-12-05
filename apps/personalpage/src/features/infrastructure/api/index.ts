/**
 * API utilities module
 *
 * Personalpage-specific API utilities and wrappers.
 * For centralized infrastructure, import directly from @websites/infrastructure
 */

// Route handlers with personalpage auth config
export * from './routeHandlers';

// Core API utilities (client-safe) - app-specific axios wrapper
export { apiRequest, fetchData, saveData } from './apiRequest';



