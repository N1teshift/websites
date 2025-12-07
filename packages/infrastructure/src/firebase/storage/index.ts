/**
 * Firebase Storage API Client Module
 *
 * Self-contained module for Firebase Storage API interactions.
 * Can be used across multiple projects in the monorepo.
 */

// Configuration
export * from './config';

// Error handling
export * from './errorHandler';

// Storage service
export * from './storageService';

// Image service
export * from './imageService';

// Service layer
export { createFirebaseStorageService } from './storageService';
export { createImageService } from './imageService';
