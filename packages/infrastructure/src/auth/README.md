# Authentication Module

**API Reference for `@websites/infrastructure/auth`**

## Overview

The authentication module provides OAuth-based user authentication, JWT session management, and user data operations.

## Installation

```typescript
import { UserService, getSession, createSession } from '@websites/infrastructure/auth';
```

## API Reference

### User Service

#### `getUserById(userId: string): Promise<User | null>`

Gets a user by their ID.

**Parameters:**
- `userId` (string, required) - User ID

**Returns:** User object or null if not found

**Example:**
```typescript
import { getUserById } from '@websites/infrastructure/auth';

const user = await getUserById('user123');
if (user) {
  console.log(user.nickname);
}
```

#### `getOrCreateUser(googleId: string, email?: string): Promise<User>`

Gets an existing user by Google ID or creates a new one.

**Parameters:**
- `googleId` (string, required) - Google user ID
- `email` (string, optional) - User email

**Returns:** User object

**Example:**
```typescript
import { getOrCreateUser } from '@websites/infrastructure/auth';

const user = await getOrCreateUser(googleId, email);
```

#### `createUser(userData: Partial<User>): Promise<User>`

Creates a new user.

**Parameters:**
- `userData` (Partial<User>, required) - User data

**Returns:** Created user object

#### `updateUser(userId: string, updates: Partial<User>): Promise<void>`

Updates user data.

**Parameters:**
- `userId` (string, required) - User ID
- `updates` (Partial<User>, required) - Fields to update

#### `updateUserPreferences(userId: string, preferences: { nickname?: string; language?: string; theme?: string }): Promise<void>`

Updates user preferences (nickname, language, theme).

**Parameters:**
- `userId` (string, required) - User ID
- `preferences` (object, required) - Preference updates

### Session Management

#### `getSession(req: NextApiRequest): SessionData | null`

Gets session from request (reads JWT from cookie).

**Parameters:**
- `req` (NextApiRequest, required) - Next.js API request

**Returns:** Session data or null

**Example:**
```typescript
import { getSession } from '@websites/infrastructure/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  // Use session.userId
}
```

#### `createSession(userId: string, res: NextApiResponse): void`

Creates a session by setting JWT cookie.

**Parameters:**
- `userId` (string, required) - User ID
- `res` (NextApiResponse, required) - Next.js API response

### OAuth Utilities

#### `generateAuthUrl(redirectUri: string, scopes: string[], state?: Record<string, unknown>): string`

Generates Google OAuth authorization URL.

**Parameters:**
- `redirectUri` (string, required) - OAuth callback URL
- `scopes` (string[], required) - OAuth scopes
- `state` (object, optional) - State data to pass through OAuth flow

**Returns:** Authorization URL

#### `exchangeCodeForTokens(code: string, redirectUri: string): Promise<{ access_token: string; refresh_token?: string }>`

Exchanges OAuth code for access tokens.

**Parameters:**
- `code` (string, required) - OAuth authorization code
- `redirectUri` (string, required) - OAuth callback URL

**Returns:** Token object

## User Interface

```typescript
export interface User {
  id: string;
  googleId?: string;
  email?: string;
  nickname?: string;
  preferences?: {
    language?: string;
    theme?: string;
  };
  createdAt: Date;
  lastLoginAt: Date;
  [key: string]: any;
}
```

## Usage Examples

### Server-Side Authentication Check

```typescript
import { getSession } from '@websites/infrastructure/auth';
import { getUserById } from '@websites/infrastructure/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = getSession(req);
  
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const user = await getUserById(session.userId);
  // Use user data
}
```

### OAuth Flow

```typescript
import { generateAuthUrl, exchangeCodeForTokens } from '@websites/infrastructure/auth/oauth';
import { getOrCreateUser } from '@websites/infrastructure/auth';
import { createSession } from '@websites/infrastructure/auth';

// Step 1: Generate auth URL
const authUrl = generateAuthUrl(
  '/api/auth/callback',
  ['openid', 'profile', 'email']
);

// Step 2: Handle callback
const { code } = req.query;
const tokens = await exchangeCodeForTokens(code, '/api/auth/callback');

// Step 3: Get user info and create session
const userInfo = await getGoogleUserInfo(tokens.access_token);
const user = await getOrCreateUser(userInfo.sub, userInfo.email);
createSession(user.id, res);
```

## Environment Variables

Required:
- `JWT_SECRET` - Secret for JWT signing
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Firebase service account (for user storage)
- `FIREBASE_DATABASE_URL` - Firestore database URL

Optional:
- `USERS_COLLECTION_NAME` - Collection name (default: 'users')
- `GOOGLE_USER_AUTH_REDIRECT_URI` - Explicit redirect URI
- `NEXT_PUBLIC_BASE_URL` - Base URL for redirect URI generation

## Security Notes

- JWT tokens stored in HTTP-only cookies
- Cookies use `Secure` flag in production
- `SameSite=Lax` prevents CSRF attacks
- Session tokens expire after 30 days
- `JWT_SECRET` should be a strong random string

## Related Documentation

- [Authentication Guide](../../docs/guides/authentication.md) - Complete authentication guide
- [Security Guide](../../docs/guides/security.md) - Security best practices
