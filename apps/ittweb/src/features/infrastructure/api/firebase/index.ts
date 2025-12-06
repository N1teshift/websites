// Re-export from centralized Firebase package
// Exclude isServerSide to avoid conflict with utils export
export {
  initializeFirebaseAdmin,
  getFirestoreAdmin,
  getStorageAdmin,
  getStorageBucketName,
  getAdminTimestamp,
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
} from '@websites/infrastructure/firebase';


