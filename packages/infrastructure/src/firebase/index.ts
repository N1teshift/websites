// Client-safe exports only
// DO NOT export './admin' or './storage' here - they contain server-only code
// Server code should import directly from '@websites/infrastructure/firebase/admin'
// or '@websites/infrastructure/firebase/storage'

export * from "./client";
export * from "./config";
export * from "./helpers";
export * from "./errorHandler";

// Re-export commonly used instances for backward compatibility
export {
  getFirestoreInstance as db,
  getStorageInstance as storage,
  getAnalyticsInstance,
  initializeFirebaseApp,
} from "./client";
