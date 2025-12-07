/**
 * Firebase Storage configuration
 * Contains Firebase Storage-specific environment variables and settings
 */

import { getStorageBucketName } from '../admin';

export interface FirebaseStorageConfig {
  projectId: string;
  serviceAccountKey: string;
  storageBucket?: string;
}

/**
 * Get Firebase Storage configuration from environment variables
 * Supports both MafaldaGarcia-style and infrastructure-style env vars
 */
export function getFirebaseStorageConfig(): FirebaseStorageConfig {
  return {
    projectId: 
      process.env.FIREBASE_PROJECT_ID || 
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 
      '',
    serviceAccountKey: 
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY || 
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY_MAIN ||
      '',
    storageBucket: 
      process.env.FIREBASE_STORAGE_BUCKET ||
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      getStorageBucketName() ||
      undefined,
  };
}

/**
 * Validate Firebase Storage configuration
 */
export function validateFirebaseStorageConfig(config: FirebaseStorageConfig): string[] {
  const errors: string[] = [];

  if (!config.projectId) {
    errors.push('FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID is required');
  }
  if (!config.serviceAccountKey) {
    errors.push('GOOGLE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_KEY is required for Firebase Storage');
  }
  if (!config.storageBucket) {
    errors.push('FIREBASE_STORAGE_BUCKET or NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is required for image storage');
  }

  return errors;
}
