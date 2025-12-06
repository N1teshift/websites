# Firebase Module

**API Reference for `@websites/infrastructure/firebase`**

## Overview

The Firebase module provides both server-side (Admin SDK) and client-side Firebase integration with Firestore, Storage, and Analytics.

## Installation

```typescript
import { getFirestoreAdmin, getFirestoreInstance } from '@websites/infrastructure/firebase';
```

## API Reference

### Server-Side (Admin SDK)

#### `getFirestoreAdmin(): Firestore`

Gets Firestore Admin instance (server-side only).

**Returns:** Firestore Admin instance

**Example:**
```typescript
import { getFirestoreAdmin } from '@websites/infrastructure/firebase';

const db = getFirestoreAdmin();
const doc = await db.collection('users').doc('user123').get();
```

#### `initializeFirebaseAdmin(): App`

Initializes Firebase Admin SDK (server-side only).

**Returns:** Firebase Admin App instance

**Note:** Automatically called when using `getFirestoreAdmin()`

### Client-Side

#### `getFirestoreInstance(): Firestore`

Gets Firestore client instance (works client and server).

**Returns:** Firestore client instance

**Example:**
```typescript
import { getFirestoreInstance } from '@websites/infrastructure/firebase';

const db = getFirestoreInstance();
const doc = await db.collection('users').doc('user123').get();
```

#### `initializeFirebaseApp(): FirebaseApp`

Initializes Firebase client app (singleton pattern).

**Returns:** Firebase App instance

**Note:** Automatically called when using `getFirestoreInstance()`

### Storage

#### `getStorageInstance(): FirebaseStorage`

Gets Firebase Storage instance.

**Returns:** Storage instance

**Example:**
```typescript
import { getStorageInstance } from '@websites/infrastructure/firebase';

const storage = getStorageInstance();
const ref = storage.ref('images/photo.jpg');
```

### Analytics

#### `getAnalyticsInstance(): Analytics | null`

Gets Firebase Analytics instance (client-side only).

**Returns:** Analytics instance or null if not supported

### Helpers

#### `withFirestore<T>(serverFn, clientFn): Promise<T>`

Execute function with appropriate Firestore instance (server or client).

**Parameters:**
- `serverFn` - Function to execute with admin SDK
- `clientFn` - Function to execute with client SDK

**Returns:** Result from executed function

**Example:**
```typescript
import { withFirestore } from '@websites/infrastructure/firebase';

const data = await withFirestore(
  async (adminDb) => {
    // Server-side: use admin SDK
    return await adminDb.collection('users').get();
  },
  async (db) => {
    // Client-side: use client SDK
    return await db.collection('users').get();
  }
);
```

## Environment Variables

### Required

**Server-Side:**
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Service account JSON key (as string)
- `FIREBASE_DATABASE_URL` - Firestore database URL
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID

**Client-Side:**
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Storage bucket name
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID

### Optional

- `FIREBASE_SERVICE_ACCOUNT_KEY_MAIN` - Alternative service account key
- `FIREBASE_DATABASE_URL_MAIN` - Alternative database URL
- `FIREBASE_STORAGE_BUCKET` - Storage bucket name (server-side)

## Usage Examples

### Server-Side Firestore

```typescript
import { getFirestoreAdmin } from '@websites/infrastructure/firebase';

export async function getUserData(userId: string) {
  const db = getFirestoreAdmin();
  const doc = await db.collection('users').doc(userId).get();
  
  if (!doc.exists) {
    return null;
  }
  
  return doc.data();
}
```

### Client-Side Firestore

```typescript
import { getFirestoreInstance } from '@websites/infrastructure/firebase';

export async function fetchUserData(userId: string) {
  const db = getFirestoreInstance();
  const doc = await db.collection('users').doc(userId).get();
  
  if (!doc.exists) {
    return null;
  }
  
  return doc.data();
}
```

### Storage Operations

```typescript
import { getStorageInstance } from '@websites/infrastructure/firebase';

const storage = getStorageInstance();
const ref = storage.ref('uploads/file.jpg');

// Upload
await ref.put(file);

// Download URL
const url = await ref.getDownloadURL();
```

### Error Handling

```typescript
import { getFirestoreAdmin } from '@websites/infrastructure/firebase';
import { createComponentLogger } from '@websites/infrastructure/logging';

const logger = createComponentLogger('UserService');

try {
  const db = getFirestoreAdmin();
  await db.collection('users').doc(userId).set(data);
} catch (error) {
  logger.error('Failed to save user', error as Error, { userId });
  throw error;
}
```

## Best Practices

1. **Use Admin SDK server-side** - Always use `getFirestoreAdmin()` in API routes
2. **Use Client SDK client-side** - Use `getFirestoreInstance()` in components
3. **Handle errors gracefully** - Wrap Firestore operations in try-catch
4. **Use withFirestore helper** - For code that works both server and client
5. **Initialize once** - Firebase is initialized automatically (singleton pattern)

## Related Documentation

- [Getting Started Guide](../../docs/guides/getting-started.md) - Environment setup
- [Error Handling Guide](../../docs/guides/error-handling.md) - Error handling patterns
