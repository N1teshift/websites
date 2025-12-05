/**
 * Firebase API Client Module
 *
 * Self-contained module for Firebase API interactions.
 * Can be copied to other projects with minimal configuration.
 */

// Configuration
export * from './config';

// Error handling
export * from './errorHandler';

// Storage service
export * from './storageService';

// Image service
export * from './imageService';

// Firestore utilities
export * from './firestoreUtils';

// Service layer
export { createFirebaseStorageService } from './storageService';
export { createImageService } from './imageService';
