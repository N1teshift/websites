export * from './admin';
export * from './client';
export * from './config';
export * from './helpers';
export * from './errorHandler';

// Re-export Firebase Storage services
export * from './storage';

// Re-export commonly used instances for backward compatibility
export { 
  getFirestoreInstance as db, 
  getStorageInstance as storage, 
  getAnalyticsInstance, 
  initializeFirebaseApp 
} from './client';


