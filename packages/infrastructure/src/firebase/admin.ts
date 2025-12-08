// This file is server-only and should never be imported in client-side code
// Note: We use webpack externals configuration instead of 'server-only' package
// because 'server-only' is designed for App Router, not Pages Router

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore, Timestamp as AdminTimestamp } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';
import { createComponentLogger } from '../logging';

const logger = createComponentLogger('firebase.admin');

let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminStorage: Storage | null = null;
let storageBucketName: string | undefined;

/**
 * Initialize Firebase Admin SDK (server-side only)
 * Uses service account credentials from environment variables or Application Default Credentials
 */
export function initializeFirebaseAdmin(): App {
  if (adminApp) {
    return adminApp;
  }

  // Check if Firebase Admin is already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
    return adminApp;
  }

  // Try to initialize with service account credentials from environment
  const serviceAccountKey = 
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY_MAIN ||
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY_TESTRESULTS ||
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  
  // Try to get project ID from env vars first, then extract from service account JSON
  let projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  
  // If we have a service account key but no project ID, try to extract it from the JSON
  if (serviceAccountKey && !projectId) {
    try {
      const credentials = JSON.parse(serviceAccountKey);
      if (credentials.project_id) {
        projectId = credentials.project_id;
        logger.debug('Extracted project_id from service account JSON', { projectId });
      }
    } catch {
      // If parsing fails, we'll handle it below
    }
  }
  
  if (!storageBucketName) {
    storageBucketName =
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      process.env.FIREBASE_STORAGE_BUCKET ||
      process.env.FIREBASE_DATABASE_URL ||
      process.env.FIREBASE_DATABASE_URL_MAIN ||
      process.env.FIREBASE_DATABASE_URL_TESTRESULTS ||
      (projectId ? `${projectId}.appspot.com` : undefined);
  }

  if (serviceAccountKey && projectId) {
    try {
      // Parse the service account key (can be JSON string)
      // If it's a file path, it should be loaded separately
      const credentials = JSON.parse(serviceAccountKey);

      adminApp = initializeApp({
        credential: cert(credentials),
        projectId,
        storageBucket: storageBucketName,
        databaseURL: process.env.FIREBASE_DATABASE_URL || 
                     process.env.FIREBASE_DATABASE_URL_MAIN || 
                     process.env.FIREBASE_DATABASE_URL_TESTRESULTS,
      });
      return adminApp;
    } catch (error) {
      logger.warn('Failed to initialize Firebase Admin with service account, falling back to Application Default Credentials', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      // Fall through to Application Default Credentials
    }
  }

  // Fall back to Application Default Credentials (works in Firebase environments)
  try {
    adminApp = initializeApp({
      projectId,
      storageBucket: storageBucketName,
      databaseURL: process.env.FIREBASE_DATABASE_URL || process.env.FIREBASE_DATABASE_URL_MAIN,
    });
    return adminApp;
  } catch (error) {
    throw new Error(
      `Firebase Admin initialization failed: ${error instanceof Error ? error.message : String(error)}. ` +
      'Please set FIREBASE_SERVICE_ACCOUNT_KEY or use Application Default Credentials.'
    );
  }
}

/**
 * Get Firestore Admin instance (server-side only)
 * This bypasses security rules and should only be used in API routes
 */
export function getFirestoreAdmin(): Firestore {
  if (!adminDb) {
    const app = initializeFirebaseAdmin();
    adminDb = getFirestore(app);
  }
  return adminDb;
}

/**
 * Get Firebase Storage Admin instance (server-side only)
 */
export function getStorageAdmin(): Storage {
  if (!adminStorage) {
    const app = initializeFirebaseAdmin();
    adminStorage = getStorage(app);
  }
  return adminStorage;
}

/**
 * Get the configured default storage bucket name
 */
export function getStorageBucketName(): string | undefined {
  if (!storageBucketName) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    storageBucketName =
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      process.env.FIREBASE_STORAGE_BUCKET ||
      (projectId ? `${projectId}.appspot.com` : undefined);
  }
  return storageBucketName;
}

/**
 * Check if we're running on the server
 */
export function isServerSide(): boolean {
  return typeof window === 'undefined';
}

/**
 * Get Admin Timestamp utility
 */
export function getAdminTimestamp() {
  return AdminTimestamp;
}


