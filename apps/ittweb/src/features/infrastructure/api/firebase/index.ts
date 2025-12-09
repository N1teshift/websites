// Re-export from centralized Firebase package
// Server-only functions are imported from /admin, client-safe functions from main barrel
export {
  initializeFirebaseAdmin,
  getFirestoreAdmin,
  getStorageAdmin,
  getStorageBucketName,
  getAdminTimestamp,
  // Note: isServerSide is exported from @websites/infrastructure/utils to avoid duplicate exports
} from "@websites/infrastructure/firebase/admin";

export {
  initializeFirebaseApp,
  getFirestoreInstance,
  getStorageInstance,
  getAnalyticsInstance,
  getFirebaseClientConfig,
  validateFirebaseClientConfig,
  withFirestore,
  getDocument,
  getCollectionSnapshot,
  handleFirebaseError,
  FirebaseErrorType,
  type FirebaseError,
  type FirebaseClientConfig,
  app,
  db,
  storage,
  analytics,
} from "@websites/infrastructure/firebase";
