/**
 * Firebase Storage API Client Module
 *
 * Self-contained module for Firebase Storage interactions.
 * Provides image and storage services for managing Firebase Storage files.
 */

// Storage service
export * from './storageService';

// Image service
export * from './imageService';

// Service layer
export { createFirebaseStorageService } from './storageService';
export { createImageService } from './imageService';
