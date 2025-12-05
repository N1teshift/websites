/**
 * Firebase-specific configuration
 * Contains only Firebase-related environment variables and settings
 */

export interface FirebaseConfig {
  projectId: string;
  serviceAccountKey: string;
  databaseUrl?: string;
}

/**
 * Get Firebase configuration from environment variables
 */
export function getFirebaseConfig(): FirebaseConfig {
  return {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '',
    databaseUrl: process.env.FIREBASE_DATABASE_URL,
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

  return errors;
}



