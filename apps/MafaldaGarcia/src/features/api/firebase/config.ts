/**
 * Firebase-specific configuration
 * Contains only Firebase-related environment variables and settings
 */

export interface FirebaseConfig {
  projectId: string;
  serviceAccountKey: string;
  storageBucket?: string;
}

/**
 * Get Firebase configuration from environment variables
 */
export function getFirebaseConfig(): FirebaseConfig {
  return {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  };
}

/**
 * Validate Firebase configuration
 */
export function validateFirebaseConfig(config: FirebaseConfig): string[] {
  const errors: string[] = [];

  if (!config.projectId) {
    errors.push('FIREBASE_PROJECT_ID is required');
  }
  if (!config.serviceAccountKey) {
    errors.push('GOOGLE_SERVICE_ACCOUNT_KEY is required for Firebase');
  }
  if (!config.storageBucket) {
    errors.push('FIREBASE_STORAGE_BUCKET is required for image storage');
  }

  return errors;
}
