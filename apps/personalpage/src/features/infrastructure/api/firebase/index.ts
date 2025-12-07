/**
 * Firebase API Client Module
 * 
 * Self-contained module for Firebase API interactions.
 * Can be copied to other projects with minimal configuration.
 */

// Server-side utilities
export * from './firestoreUtils';
export * from './firestoreService';

// Service layer
export { firestoreService } from './firestoreService';
