# Detailed Infrastructure Centralization Implementation Guide

This guide provides step-by-step instructions for migrating infrastructure code from individual apps to the shared `@websites/infrastructure` package. Each phase is broken down into detailed substeps that can be followed independently.

## Prerequisites

Before starting any phase:

```bash
# Ensure you're in the monorepo root
cd c:\Users\user\source\repos\websites

# Install dependencies
pnpm install

# Verify current state
pnpm type-check
pnpm test
```

---

# Phase 1: Core API Infrastructure

**Goal:** Centralize API route handlers, query parsing, and Zod validation from ittweb.

## 1.1: Create Package Structure

### Step 1.1.1: Create directories
```bash
# From monorepo root
mkdir packages\infrastructure\src\api
mkdir packages\infrastructure\src\api\handlers
mkdir packages\infrastructure\src\api\parsing
mkdir packages\infrastructure\src\api\schemas
mkdir packages\infrastructure\src\api\zod
```

### Step 1.1.2: Create index files
```bash
# Create empty index files
New-Item packages\infrastructure\src\api\index.ts
New-Item packages\infrastructure\src\api\handlers\index.ts
New-Item packages\infrastructure\src\api\parsing\index.ts
New-Item packages\infrastructure\src\api\schemas\index.ts
New-Item packages\infrastructure\src\api\zod\index.ts
```

## 1.2: Extract Route Handlers

### Step 1.2.1: Copy routeHandlers.ts
```bash
# Copy from ittweb
Copy-Item apps\ittweb\src\features\infrastructure\api\handlers\routeHandlers.ts packages\infrastructure\src\api\handlers\
```

### Step 1.2.2: Adapt imports in routeHandlers.ts
Open `packages\infrastructure\src\api\handlers\routeHandlers.ts` and update:

**Find:** `from '@/features/infrastructure/logging'`  
**Replace:** `from '../../logging'`

**Find:** Any app-specific imports (e.g., `@/features/modules/...`)  
**Action:** Remove or make generic

### Step 1.2.3: Export from handlers/index.ts
```typescript
// packages/infrastructure/src/api/handlers/index.ts
export * from './routeHandlers';
```

## 1.3: Extract Query Parsers

### Step 1.3.1: Copy queryParser.ts
```bash
Copy-Item apps\ittweb\src\features\infrastructure\api\parsing\queryParser.ts packages\infrastructure\src\api\parsing\
```

### Step 1.3.2: Adapt imports
Open `packages\infrastructure\src\api\parsing\queryParser.ts`:

**Find:** `from '@/features/infrastructure/logging'`  
**Replace:** `from '../../logging'`

### Step 1.3.3: Export from parsing/index.ts
```typescript
// packages/infrastructure/src/api/parsing/index.ts
export * from './queryParser';
```

## 1.4: Extract Zod Validation

### Step 1.4.1: Copy zodValidation.ts
```bash
Copy-Item apps\ittweb\src\features\infrastructure\api\zod\zodValidation.ts packages\infrastructure\src\api\zod\
```

### Step 1.4.2: Export from zod/index.ts
```typescript
// packages/infrastructure/src/api/zod/index.ts
export * from './zodValidation';
```

## 1.5: Extract Common Schemas

### Step 1.5.1: Copy schemas.ts
```bash
Copy-Item apps\ittweb\src\features\infrastructure\api\schemas\schemas.ts packages\infrastructure\src\api\schemas\
```

### Step 1.5.2: Remove app-specific schemas
Open `packages\infrastructure\src\api\schemas\schemas.ts`:

- Keep only **generic** schemas (e.g., pagination, common CRUD patterns)
- Remove domain-specific schemas (they stay in apps)
- Document which schemas are generic vs app-specific

### Step 1.5.3: Export from schemas/index.ts
```typescript
// packages/infrastructure/src/api/schemas/index.ts
export * from './schemas';
```

## 1.6: Create Main API Export

### Step 1.6.1: Update packages/infrastructure/src/api/index.ts
```typescript
// packages/infrastructure/src/api/index.ts
export * from './handlers';
export * from './parsing';
export * from './schemas';
export * from './zod';
```

### Step 1.6.2: Update packages/infrastructure/src/index.ts
```typescript
// Add to existing exports
export * from './api';
```

### Step 1.6.3: Update package.json exports
```json
// packages/infrastructure/package.json
{
  "exports": {
    ".": "./src/index.ts",
    "./api": "./src/api/index.ts",
    "./i18n": "./src/i18n/index.ts",
    "./i18n/client": "./src/i18n/client.ts",
    "./logging": "./src/logging/index.ts"
  }
}
```

## 1.7: Add Tests

### Step 1.7.1: Create test directory
```bash
mkdir packages\infrastructure\src\api\__tests__
```

### Step 1.7.2: Copy relevant tests from ittweb
```bash
# If tests exist in ittweb
Copy-Item apps\ittweb\__tests__\infrastructure\api\* packages\infrastructure\src\api\__tests__\ -Recurse
```

### Step 1.7.3: Adapt test imports
Update all test files to use new import paths:

**Before:** `from '@/features/infrastructure/api'`  
**After:** `from '../index'` or `from '../handlers/routeHandlers'`

### Step 1.7.4: Run tests
```bash
cd packages\infrastructure
pnpm test
```

## 1.8: Update ittweb

### Step 1.8.1: Update imports in API routes
Find all files in `apps\ittweb\src\pages\api\**\*.ts`:

**Find:** `from '@/features/infrastructure/api'`  
**Replace:** `from '@websites/infrastructure/api'`

**Command to find files:**
```bash
cd apps\ittweb
grep -r "from '@/features/infrastructure/api'" src/pages/api/
```

### Step 1.8.2: Update imports in feature modules
Find all files using API infrastructure:

```bash
grep -r "from '@/features/infrastructure/api'" src/features/
```

Update each occurrence.

### Step 1.8.3: Test ittweb
```bash
cd apps\ittweb
pnpm type-check
pnpm test
pnpm build
```

## 1.9: Update personalpage

### Step 1.9.1: Check for similar patterns
```bash
cd apps\personalpage
grep -r "routeHandlers" src/
```

### Step 1.9.2: Replace with centralized version
If personalpage has its own route handlers, replace with:

```typescript
import { createApiHandler } from '@websites/infrastructure/api';
```

### Step 1.9.3: Test personalpage
```bash
cd apps\personalpage
pnpm type-check
pnpm test
pnpm build
```

## 1.10: Verify All Apps

### Step 1.10.1: Build all apps
```bash
# From monorepo root
pnpm build
```

### Step 1.10.2: Run all tests
```bash
pnpm test
```

### Step 1.10.3: Manual verification
```bash
# Start all dev servers
pnpm dev
```

Test API routes in:
- ittweb: Try uploading a replay, check analytics
- personalpage: Test any API endpoints

## 1.11: Cleanup

### Step 1.11.1: Remove old code from ittweb
```bash
cd apps\ittweb
# Only after verification passes!
Remove-Item src\features\infrastructure\api\handlers\routeHandlers.ts
Remove-Item src\features\infrastructure\api\parsing\queryParser.ts
Remove-Item src\features\infrastructure\api\zod\zodValidation.ts
```

### Step 1.11.2: Update ittweb README
Update `apps\ittweb\src\features\infrastructure\README.md` to reference the centralized package.

---

# Phase 2: Firebase Integration

**Goal:** Consolidate Firebase Admin SDK, client SDK, and Firestore helpers.

## 2.1: Create Package Structure

```bash
mkdir packages\infrastructure\src\firebase
New-Item packages\infrastructure\src\firebase\index.ts
```

## 2.2: Extract Firebase Admin

### Step 2.2.1: Copy admin setup from ittweb
```bash
Copy-Item apps\ittweb\src\features\infrastructure\api\firebase\admin.ts packages\infrastructure\src\firebase\
```

### Step 2.2.2: Copy admin setup from personalpage
```bash
# Check if personalpage has different admin setup
# If so, merge the best parts
Copy-Item apps\personalpage\src\features\infrastructure\api\firebase\firebaseClient.ts packages\infrastructure\src\firebase\admin-personalpage.ts
```

### Step 2.2.3: Consolidate admin.ts
Open `packages\infrastructure\src\firebase\admin.ts`:

1. Compare both implementations
2. Keep the most robust version
3. Add any missing features from the other
4. Ensure environment variable handling is flexible

**Example consolidated structure:**
```typescript
// packages/infrastructure/src/firebase/admin.ts
import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let firestoreInstance: Firestore | null = null;

export function getFirebaseAdmin(): App {
  if (adminApp) return adminApp;

  const apps = getApps();
  if (apps.length > 0) {
    adminApp = apps[0];
    return adminApp;
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
    || process.env.FIREBASE_SERVICE_ACCOUNT_KEY_MAIN
    || process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccount) {
    throw new Error('Firebase service account key not found');
  }

  adminApp = initializeApp({
    credential: cert(JSON.parse(serviceAccount)),
    databaseURL: process.env.FIREBASE_DATABASE_URL 
      || process.env.FIREBASE_DATABASE_URL_MAIN,
  });

  return adminApp;
}

export function getFirestoreAdmin(): Firestore {
  if (firestoreInstance) return firestoreInstance;
  
  const app = getFirebaseAdmin();
  firestoreInstance = getFirestore(app);
  return firestoreInstance;
}
```

## 2.3: Extract Firebase Client

### Step 2.3.1: Copy client setup
```bash
Copy-Item apps\ittweb\src\features\infrastructure\api\firebase\firebaseClient.ts packages\infrastructure\src\firebase\client.ts
```

### Step 2.3.2: Adapt for browser environment
Ensure client.ts works in browser:

```typescript
// packages/infrastructure/src/firebase/client.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

let clientApp: FirebaseApp | null = null;
let firestoreClient: Firestore | null = null;

export function getFirebaseClient(): FirebaseApp {
  if (clientApp) return clientApp;

  const apps = getApps();
  if (apps.length > 0) {
    clientApp = apps[0];
    return clientApp;
  }

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  clientApp = initializeApp(firebaseConfig);
  return clientApp;
}

export function getFirestoreClient(): Firestore {
  if (firestoreClient) return firestoreClient;
  
  const app = getFirebaseClient();
  firestoreClient = getFirestore(app);
  return firestoreClient;
}
```

## 2.4: Extract Firestore Helpers

### Step 2.4.1: Copy helpers from ittweb
```bash
Copy-Item apps\ittweb\src\features\infrastructure\api\firebase\firestoreHelpers.ts packages\infrastructure\src\firebase\helpers.ts
```

### Step 2.4.2: Make helpers environment-aware
Update helpers to work on both server and client:

```typescript
// packages/infrastructure/src/firebase/helpers.ts
import { getFirestoreAdmin } from './admin';
import { getFirestoreClient } from './client';

function getFirestore() {
  // Server-side
  if (typeof window === 'undefined') {
    return getFirestoreAdmin();
  }
  // Client-side
  return getFirestoreClient();
}

export async function getDocument(collection: string, docId: string) {
  const db = getFirestore();
  const docRef = db.collection(collection).doc(docId);
  const doc = await docRef.get();
  return doc.exists ? doc.data() : null;
}

export async function getCollectionSnapshot(collection: string) {
  const db = getFirestore();
  const snapshot = await db.collection(collection).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Add more helpers as needed
```

## 2.5: Create Error Handler

### Step 2.5.1: Create errorHandler.ts
```typescript
// packages/infrastructure/src/firebase/errorHandler.ts
import { logError } from '../logging';

export enum FirebaseErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN',
}

export interface FirebaseError {
  type: FirebaseErrorType;
  message: string;
  originalError: unknown;
  retryable: boolean;
}

export function handleFirebaseError(
  error: unknown,
  operation: string
): FirebaseError {
  const errorObj = error as any;
  
  let type = FirebaseErrorType.UNKNOWN;
  let retryable = false;

  if (errorObj?.code === 'permission-denied') {
    type = FirebaseErrorType.PERMISSION_DENIED;
  } else if (errorObj?.code === 'not-found') {
    type = FirebaseErrorType.NOT_FOUND;
  } else if (errorObj?.code === 'already-exists') {
    type = FirebaseErrorType.ALREADY_EXISTS;
  } else if (errorObj?.code === 'unavailable') {
    type = FirebaseErrorType.NETWORK;
    retryable = true;
  }

  const message = `Firebase ${operation} failed: ${errorObj?.message || 'Unknown error'}`;
  
  logError(error, message, { operation, type });

  return {
    type,
    message,
    originalError: error,
    retryable,
  };
}
```

## 2.6: Create Main Firebase Export

### Step 2.6.1: Update packages/infrastructure/src/firebase/index.ts
```typescript
// packages/infrastructure/src/firebase/index.ts
export * from './admin';
export * from './client';
export * from './helpers';
export * from './errorHandler';
```

### Step 2.6.2: Update packages/infrastructure/src/index.ts
```typescript
// Add to existing exports
export * from './firebase';
```

### Step 2.6.3: Update package.json exports
```json
{
  "exports": {
    ".": "./src/index.ts",
    "./api": "./src/api/index.ts",
    "./firebase": "./src/firebase/index.ts",
    "./i18n": "./src/i18n/index.ts",
    "./i18n/client": "./src/i18n/client.ts",
    "./logging": "./src/logging/index.ts"
  }
}
```

## 2.7: Add Tests

### Step 2.7.1: Create test files
```bash
mkdir packages\infrastructure\src\firebase\__tests__
New-Item packages\infrastructure\src\firebase\__tests__\admin.test.ts
New-Item packages\infrastructure\src\firebase\__tests__\helpers.test.ts
```

### Step 2.7.2: Write basic tests
```typescript
// packages/infrastructure/src/firebase/__tests__/helpers.test.ts
import { getDocument } from '../helpers';

// Mock Firebase
jest.mock('../admin');
jest.mock('../client');

describe('Firebase Helpers', () => {
  it('should get document', async () => {
    // Add test implementation
  });
});
```

### Step 2.7.3: Run tests
```bash
cd packages\infrastructure
pnpm test
```

## 2.8: Update ittweb

### Step 2.8.1: Find all Firebase imports
```bash
cd apps\ittweb
grep -r "from '@/features/infrastructure/api/firebase" src/
```

### Step 2.8.2: Replace imports
**Find:** `from '@/features/infrastructure/api/firebase/admin'`  
**Replace:** `from '@websites/infrastructure/firebase'`

**Find:** `from '@/features/infrastructure/api/firebase/firebaseClient'`  
**Replace:** `from '@websites/infrastructure/firebase'`

### Step 2.8.3: Test ittweb
```bash
pnpm type-check
pnpm test
pnpm build
```

## 2.9: Update personalpage

### Step 2.9.1: Find Firebase imports
```bash
cd apps\personalpage
grep -r "firebase" src/features/infrastructure/
```

### Step 2.9.2: Replace with centralized version
Update all Firebase imports to use `@websites/infrastructure/firebase`.

### Step 2.9.3: Test personalpage
```bash
pnpm type-check
pnpm test
pnpm build
```

## 2.10: Verify All Apps

```bash
# From monorepo root
pnpm build
pnpm test
```

## 2.11: Cleanup

```bash
# Remove old Firebase code from apps (after verification)
cd apps\ittweb
Remove-Item src\features\infrastructure\api\firebase -Recurse

cd apps\personalpage
Remove-Item src\features\infrastructure\api\firebase -Recurse
```

---

# Phase 3: Authentication & Authorization

**Goal:** Centralize OAuth, session management, and user services.

## 3.1: Create Package Structure

```bash
mkdir packages\infrastructure\src\auth
mkdir packages\infrastructure\src\auth\oauth
mkdir packages\infrastructure\src\auth\providers
New-Item packages\infrastructure\src\auth\index.ts
```

## 3.2: Extract OAuth Utilities

### Step 3.2.1: Copy OAuth from personalpage
```bash
Copy-Item apps\personalpage\src\features\infrastructure\auth\oauth.ts packages\infrastructure\src\auth\oauth\google.ts
```

### Step 3.2.2: Adapt imports
Open `packages\infrastructure\src\auth\oauth\google.ts`:

**Find:** App-specific imports  
**Replace:** With package imports

### Step 3.2.3: Create Microsoft OAuth
```bash
# If personalpage has Microsoft OAuth
Copy-Item apps\personalpage\src\features\infrastructure\auth\oauth-microsoft.ts packages\infrastructure\src\auth\oauth\microsoft.ts
```

### Step 3.2.4: Create oauth/index.ts
```typescript
// packages/infrastructure/src/auth/oauth/index.ts
export * from './google';
export * from './microsoft';
```

## 3.3: Extract Session Management

### Step 3.3.1: Copy session utilities
```bash
Copy-Item apps\personalpage\src\features\infrastructure\auth\session.ts packages\infrastructure\src\auth\
```

### Step 3.3.2: Make session utilities generic
Update to support multiple session strategies:

```typescript
// packages/infrastructure/src/auth/session.ts
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

export interface SessionData {
  userId: string;
  email?: string;
  [key: string]: any;
}

export function createSession(data: SessionData, expiresIn = '30d'): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  
  return jwt.sign(data, secret, { expiresIn });
}

export function verifySession(token: string): SessionData | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  
  try {
    return jwt.verify(token, secret) as SessionData;
  } catch {
    return null;
  }
}

export function getSession(req: NextApiRequest): SessionData | null {
  const token = req.cookies['auth-token'];
  if (!token) return null;
  return verifySession(token);
}

export function setSessionCookie(
  res: NextApiResponse,
  token: string,
  maxAge = 30 * 24 * 60 * 60 // 30 days
) {
  res.setHeader('Set-Cookie', [
    `auth-token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`,
  ]);
}

export function clearSessionCookie(res: NextApiResponse) {
  res.setHeader('Set-Cookie', [
    `auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`,
  ]);
}
```

## 3.4: Extract User Service

### Step 3.4.1: Copy user service
```bash
Copy-Item apps\personalpage\src\features\infrastructure\auth\userService.ts packages\infrastructure\src\auth\
```

### Step 3.4.2: Adapt to use centralized Firebase
```typescript
// packages/infrastructure/src/auth/userService.ts
import { getFirestoreAdmin } from '../firebase';

export interface User {
  id: string;
  googleId?: string;
  email?: string;
  nickname?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export async function getUserById(userId: string): Promise<User | null> {
  const db = getFirestoreAdmin();
  const doc = await db.collection('users').doc(userId).get();
  
  if (!doc.exists) return null;
  
  return {
    id: doc.id,
    ...doc.data(),
  } as User;
}

export async function createUser(userData: Partial<User>): Promise<User> {
  const db = getFirestoreAdmin();
  const userRef = db.collection('users').doc();
  
  const user: User = {
    id: userRef.id,
    createdAt: new Date(),
    lastLoginAt: new Date(),
    ...userData,
  };
  
  await userRef.set(user);
  return user;
}

export async function updateUser(
  userId: string,
  updates: Partial<User>
): Promise<void> {
  const db = getFirestoreAdmin();
  await db.collection('users').doc(userId).update({
    ...updates,
    lastLoginAt: new Date(),
  });
}
```

## 3.5: Create Auth Context

### Step 3.5.1: Copy AuthContext from personalpage
```bash
Copy-Item apps\personalpage\src\features\infrastructure\auth\AuthContext.tsx packages\infrastructure\src\auth\providers\
```

### Step 3.5.2: Adapt imports
Update to use package imports instead of app-specific paths.

### Step 3.5.3: Create providers/index.ts
```typescript
// packages/infrastructure/src/auth/providers/index.ts
export * from './AuthContext';
```

## 3.6: Create Main Auth Export

```typescript
// packages/infrastructure/src/auth/index.ts
export * from './oauth';
export * from './session';
export * from './userService';
export * from './providers';

export type { User } from './userService';
export type { SessionData } from './session';
```

## 3.7: Update Package Exports

```json
// packages/infrastructure/package.json
{
  "exports": {
    ".": "./src/index.ts",
    "./api": "./src/api/index.ts",
    "./auth": "./src/auth/index.ts",
    "./firebase": "./src/firebase/index.ts",
    "./i18n": "./src/i18n/index.ts",
    "./i18n/client": "./src/i18n/client.ts",
    "./logging": "./src/logging/index.ts"
  }
}
```

## 3.8: Add Dependencies

```bash
cd packages\infrastructure
pnpm add jsonwebtoken
pnpm add -D @types/jsonwebtoken
```

## 3.9: Update Apps

### Step 3.9.1: Update personalpage
```bash
cd apps\personalpage
grep -r "from '@/features/infrastructure/auth" src/
```

Replace all with `from '@websites/infrastructure/auth'`.

### Step 3.9.2: Update ittweb (if using auth)
Check if ittweb has auth code to migrate.

### Step 3.9.3: Test apps
```bash
# From monorepo root
pnpm build
pnpm test
```

## 3.10: Cleanup

```bash
cd apps\personalpage
Remove-Item src\features\infrastructure\auth -Recurse
```

---

# Phase 4: External API Clients

**Goal:** Centralize OpenAI, Google, Microsoft, and Email clients.

## 4.1: Create Package Structure

```bash
mkdir packages\infrastructure\src\clients
mkdir packages\infrastructure\src\clients\openai
mkdir packages\infrastructure\src\clients\google
mkdir packages\infrastructure\src\clients\microsoft
mkdir packages\infrastructure\src\clients\email
```

## 4.2: Extract OpenAI Client

### Step 4.2.1: Copy OpenAI files
```bash
Copy-Item apps\personalpage\src\features\infrastructure\api\openai\* packages\infrastructure\src\clients\openai\ -Recurse
```

### Step 4.2.2: Adapt imports
Update all imports to use package paths.

### Step 4.2.3: Create openai/index.ts
```typescript
// packages/infrastructure/src/clients/openai/index.ts
export * from './openaiClient';
export * from './types';
export * from './config';
export * from './errorHandler';
```

## 4.3: Extract Google Client

### Step 4.3.1: Copy Google files
```bash
Copy-Item apps\personalpage\src\features\infrastructure\api\google\* packages\infrastructure\src\clients\google\ -Recurse
```

### Step 4.3.2: Organize structure
```
google/
├── index.ts
├── auth.ts
├── calendar.ts
├── config.ts
├── errorHandler.ts
└── types.ts
```

### Step 4.3.3: Create google/index.ts
```typescript
// packages/infrastructure/src/clients/google/index.ts
export * from './auth';
export * from './calendar';
export * from './config';
export * from './errorHandler';
export * from './types';
```

## 4.4: Extract Microsoft Client

### Step 4.4.1: Copy Microsoft files
```bash
Copy-Item apps\personalpage\src\features\infrastructure\api\microsoft\* packages\infrastructure\src\clients\microsoft\ -Recurse
```

### Step 4.4.2: Create microsoft/index.ts
```typescript
// packages/infrastructure/src/clients/microsoft/index.ts
export * from './calendar';
export * from './config';
export * from './errorHandler';
export * from './types';
```

## 4.5: Extract Email Client

### Step 4.5.1: Copy email files
```bash
Copy-Item apps\personalpage\src\features\infrastructure\api\email\* packages\infrastructure\src\clients\email\ -Recurse
```

### Step 4.5.2: Create email/index.ts
```typescript
// packages/infrastructure/src/clients/email/index.ts
export * from './emailClient';
export * from './config';
export * from './types';
```

## 4.6: Create Main Clients Export

```typescript
// packages/infrastructure/src/clients/index.ts
export * from './openai';
export * from './google';
export * from './microsoft';
export * from './email';
```

## 4.7: Update Package Exports

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./api": "./src/api/index.ts",
    "./auth": "./src/auth/index.ts",
    "./clients": "./src/clients/index.ts",
    "./clients/openai": "./src/clients/openai/index.ts",
    "./clients/google": "./src/clients/google/index.ts",
    "./clients/microsoft": "./src/clients/microsoft/index.ts",
    "./clients/email": "./src/clients/email/index.ts",
    "./firebase": "./src/firebase/index.ts",
    "./i18n": "./src/i18n/index.ts",
    "./i18n/client": "./src/i18n/client.ts",
    "./logging": "./src/logging/index.ts"
  }
}
```

## 4.8: Add Dependencies

```bash
cd packages\infrastructure
pnpm add openai googleapis @microsoft/microsoft-graph-client @azure/msal-node nodemailer
pnpm add -D @types/nodemailer
```

## 4.9: Update Apps

```bash
cd apps\personalpage
grep -r "from '@/features/infrastructure/api/openai" src/
grep -r "from '@/features/infrastructure/api/google" src/
grep -r "from '@/features/infrastructure/api/microsoft" src/
grep -r "from '@/features/infrastructure/api/email" src/
```

Replace all with `@websites/infrastructure/clients/*`.

## 4.10: Test and Cleanup

```bash
# Test
pnpm build
pnpm test

# Cleanup
cd apps\personalpage
Remove-Item src\features\infrastructure\api\openai -Recurse
Remove-Item src\features\infrastructure\api\google -Recurse
Remove-Item src\features\infrastructure\api\microsoft -Recurse
Remove-Item src\features\infrastructure\api\email -Recurse
```

---

# Phase 5: Caching & Performance

**Goal:** Centralize SWR config, request cache, and analytics cache.

## 5.1: Create Package Structure

```bash
mkdir packages\infrastructure\src\cache
```

## 5.2: Extract SWR Configuration

### Step 5.2.1: Copy from ittweb
```bash
Copy-Item apps\ittweb\src\features\infrastructure\lib\cache\swrConfig.ts packages\infrastructure\src\cache\swr.ts
```

### Step 5.2.2: Adapt imports
Update to use package imports.

## 5.3: Extract Request Cache

### Step 5.3.1: Copy from ittweb
```bash
Copy-Item apps\ittweb\src\features\infrastructure\lib\cache\requestCache.ts packages\infrastructure\src\cache\request.ts
```

## 5.4: Extract Analytics Cache

### Step 5.4.1: Copy from ittweb
```bash
Copy-Item apps\ittweb\src\features\infrastructure\lib\cache\analyticsCache.ts packages\infrastructure\src\cache\firestore.ts
```

### Step 5.4.2: Adapt to use centralized Firebase
```typescript
// packages/infrastructure/src/cache/firestore.ts
import { getFirestoreAdmin } from '../firebase';

// Rest of implementation using getFirestoreAdmin()
```

## 5.5: Create Main Cache Export

```typescript
// packages/infrastructure/src/cache/index.ts
export * from './swr';
export * from './request';
export * from './firestore';
```

## 5.6: Update Package Exports

```json
{
  "exports": {
    // ... existing exports
    "./cache": "./src/cache/index.ts"
  }
}
```

## 5.7: Update Apps

```bash
cd apps\ittweb
grep -r "from '@/features/infrastructure/lib/cache" src/
```

Replace with `@websites/infrastructure/cache`.

## 5.8: Test and Cleanup

```bash
pnpm build
pnpm test

cd apps\ittweb
Remove-Item src\features\infrastructure\lib\cache -Recurse
```

---

# Phase 6: Utilities & Hooks

**Goal:** Centralize shared utilities and React hooks.

## 6.1: Create Package Structure

```bash
mkdir packages\infrastructure\src\hooks
mkdir packages\infrastructure\src\utils
mkdir packages\infrastructure\src\utils\object
mkdir packages\infrastructure\src\utils\time
mkdir packages\infrastructure\src\utils\accessibility
```

## 6.2: Extract Hooks

### Step 6.2.1: Copy hooks from ittweb
```bash
Copy-Item apps\ittweb\src\features\infrastructure\hooks\* packages\infrastructure\src\hooks\ -Recurse
```

### Step 6.2.2: Remove app-specific hooks
Keep only generic hooks like:
- `useFallbackTranslation` (already exists)
- `useDataFetch`
- `useAccessibility`

### Step 6.2.3: Create hooks/index.ts
```typescript
// packages/infrastructure/src/hooks/index.ts
export * from './translation';
export * from './data-fetch';
export * from './accessibility';
```

## 6.3: Extract Utilities

### Step 6.3.1: Copy object utilities
```bash
Copy-Item apps\ittweb\src\features\infrastructure\utils\object\* packages\infrastructure\src\utils\object\ -Recurse
```

### Step 6.3.2: Copy time utilities
```bash
Copy-Item apps\ittweb\src\features\infrastructure\utils\time\* packages\infrastructure\src\utils\time\ -Recurse
```

### Step 6.3.3: Copy accessibility utilities
```bash
Copy-Item apps\ittweb\src\features\infrastructure\utils\accessibility\* packages\infrastructure\src\utils\accessibility\ -Recurse
```

### Step 6.3.4: Create utils/index.ts
```typescript
// packages/infrastructure/src/utils/index.ts
export * from './object';
export * from './time';
export * from './accessibility';
```

## 6.4: Update Package Exports

```json
{
  "exports": {
    // ... existing exports
    "./hooks": "./src/hooks/index.ts",
    "./utils": "./src/utils/index.ts"
  }
}
```

## 6.5: Update Apps

```bash
cd apps\ittweb
grep -r "from '@/features/infrastructure/hooks" src/
grep -r "from '@/features/infrastructure/utils" src/
```

Replace with `@websites/infrastructure/hooks` and `@websites/infrastructure/utils`.

## 6.6: Test and Cleanup

```bash
pnpm build
pnpm test

cd apps\ittweb
Remove-Item src\features\infrastructure\hooks -Recurse
Remove-Item src\features\infrastructure\utils -Recurse
```

---

# Phase 7: Monitoring & Observability

**Goal:** Centralize performance monitoring and error tracking.

## 7.1: Create Package Structure

```bash
mkdir packages\infrastructure\src\monitoring
```

## 7.2: Extract Monitoring

### Step 7.2.1: Copy from ittweb
```bash
Copy-Item apps\ittweb\src\features\infrastructure\monitoring\* packages\infrastructure\src\monitoring\ -Recurse
```

### Step 7.2.2: Adapt imports
Update to use package imports.

### Step 7.2.3: Create monitoring/index.ts
```typescript
// packages/infrastructure/src/monitoring/index.ts
export * from './performance';
export * from './errorTracking';
```

## 7.3: Update Package Exports

```json
{
  "exports": {
    // ... existing exports
    "./monitoring": "./src/monitoring/index.ts"
  }
}
```

## 7.4: Update Apps

```bash
cd apps\ittweb
grep -r "from '@/features/infrastructure/monitoring" src/
```

Replace with `@websites/infrastructure/monitoring`.

## 7.5: Test and Cleanup

```bash
pnpm build
pnpm test

cd apps\ittweb
Remove-Item src\features\infrastructure\monitoring -Recurse
```

---

# Phase 8: Testing Infrastructure

**Goal:** Expand test-utils with mock factories and helpers.

## 8.1: Extract Test Utilities

### Step 8.1.1: Copy from ittweb
```bash
Copy-Item apps\ittweb\src\features\infrastructure\__tests__\utils\* packages\test-utils\src\ -Recurse
```

### Step 8.1.2: Copy from personalpage
```bash
Copy-Item apps\personalpage\src\features\infrastructure\__tests__\utils\* packages\test-utils\src\ -Recurse
```

## 8.2: Create Mock Factories

### Step 8.2.1: Create mocks directory
```bash
mkdir packages\test-utils\src\mocks
```

### Step 8.2.2: Create Firebase mocks
```typescript
// packages/test-utils/src/mocks/firebase.ts
export const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

export const mockFirebaseAdmin = {
  getFirestoreAdmin: jest.fn(() => mockFirestore),
};
```

### Step 8.2.3: Create API mocks
```typescript
// packages/test-utils/src/mocks/api.ts
import { NextApiRequest, NextApiResponse } from 'next';

export function createMockRequest(
  overrides?: Partial<NextApiRequest>
): NextApiRequest {
  return {
    method: 'GET',
    query: {},
    body: {},
    headers: {},
    cookies: {},
    ...overrides,
  } as NextApiRequest;
}

export function createMockResponse(): NextApiResponse {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  };
  return res;
}
```

## 8.3: Update Package Exports

```typescript
// packages/test-utils/src/index.ts
export * from './mocks/firebase';
export * from './mocks/api';
export * from './helpers';
```

## 8.4: Update Apps

Update all test files in apps to use `@websites/test-utils`.

## 8.5: Test

```bash
# From monorepo root
pnpm test
```

---

# Final Verification

## Comprehensive Testing

### Step 1: Type Check All
```bash
# From monorepo root
pnpm type-check
```

### Step 2: Build All
```bash
pnpm build
```

### Step 3: Test All
```bash
pnpm test
```

### Step 4: Manual Testing

#### Start all dev servers
```bash
pnpm dev
```

#### Test ittweb
1. Navigate to http://localhost:3000
2. Upload a replay file
3. Check analytics page
4. Verify Firebase operations
5. Test API routes

#### Test personalpage
1. Navigate to http://localhost:3001
2. Test login/logout
3. Test calendar integration
4. Test math generator
5. Verify OpenAI integration

#### Test MafaldaGarcia
1. Navigate to http://localhost:3002
2. Check all pages load
3. Verify images load correctly

#### Test templatepage
1. Navigate to http://localhost:3003
2. Check basic functionality

### Step 5: Check for Errors
- Browser console errors
- Server console errors
- Build warnings
- Type errors

## Documentation Updates

### Step 1: Update package READMEs
Update `packages/infrastructure/README.md` with all new exports.

### Step 2: Update app READMEs
Update each app's infrastructure README to reference centralized packages.

### Step 3: Create migration guide
Document the migration for future reference.

## Final Cleanup

### Step 1: Remove old infrastructure folders
```bash
# Only after ALL verification passes!
cd apps\ittweb
Remove-Item src\features\infrastructure -Recurse

cd apps\personalpage
Remove-Item src\features\infrastructure -Recurse
```

### Step 2: Update .gitignore if needed

### Step 3: Commit changes
```bash
git add .
git commit -m "feat: centralize infrastructure into @websites/infrastructure package"
```

---

# Troubleshooting

## Common Issues

### Issue: Type errors after migration
**Solution:** Ensure all `tsconfig.json` files have correct paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@websites/infrastructure": ["../../packages/infrastructure/src"],
      "@websites/infrastructure/*": ["../../packages/infrastructure/src/*"]
    }
  }
}
```

### Issue: Module not found errors
**Solution:** Run `pnpm install` in monorepo root.

### Issue: Firebase not initializing
**Solution:** Check environment variables are set correctly in each app.

### Issue: Tests failing
**Solution:** Update test mocks to use new import paths.

### Issue: Build fails
**Solution:** Check for circular dependencies between packages.

## Getting Help

If you encounter issues:
1. Check the error message carefully
2. Verify import paths are correct
3. Ensure dependencies are installed
4. Check environment variables
5. Review the implementation plan for missed steps

---

# Success Criteria Checklist

- [ ] All apps build successfully (`pnpm build`)
- [ ] All tests pass (`pnpm test`)
- [ ] No TypeScript errors (`pnpm type-check`)
- [ ] No runtime errors in dev mode
- [ ] ittweb functionality works (replay upload, analytics)
- [ ] personalpage functionality works (auth, calendar, math)
- [ ] MafaldaGarcia loads correctly
- [ ] templatepage loads correctly
- [ ] Code duplication eliminated
- [ ] Import paths updated consistently
- [ ] Documentation updated
- [ ] Old code removed from apps

---

# Timeline Reference

- **Phase 1** (API Infrastructure): 2-3 days
- **Phase 2** (Firebase): 1-2 days
- **Phase 3** (Auth): 2-3 days
- **Phase 4** (API Clients): 2-3 days
- **Phase 5** (Caching): 1-2 days
- **Phase 6** (Utils/Hooks): 1-2 days
- **Phase 7** (Monitoring): 1-2 days
- **Phase 8** (Testing): 1-2 days
- **Final Verification**: 1 day

**Total: 12-20 days**
