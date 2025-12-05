/**
 * API utilities module
 *
 * This module provides shared utilities for API interactions.
 * Individual API clients are self-contained and can be copied independently.
 */

// Core API utilities (client-safe)
export { apiRequest, fetchData, saveData } from './apiRequest';

// Service modules (client-safe)
export * from './openai';

// Note: Firebase, Google, Microsoft APIs, route handlers, and services are server-side only 
// and should be imported directly from their respective modules when needed on the server side.



