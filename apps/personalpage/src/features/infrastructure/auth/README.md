# Authentication System

This module provides Google OAuth-based user authentication for the application.

## Features

- Google OAuth 2.0 authentication
- JWT-based session management with HTTP-only cookies
- Minimal user data storage (only Google ID/sub as unique identifier)
- Reusable OAuth infrastructure (can be extended for calendar integration)
- Client-side authentication context and hooks

## Architecture

### Server-Side Components

- **`oauth.ts`**: Reusable OAuth utilities for Google authentication
- **`session.ts`**: JWT token creation, verification, and cookie management
- **`userService.ts`**: Firestore operations for user data (get/create/update)

### API Routes

- **`/api/auth/user/login`**: Initiates Google OAuth flow
- **`/api/auth/user/callback`**: Handles OAuth callback, creates session
- **`/api/auth/user/status`**: Returns current authentication status
- **`/api/auth/user/logout`**: Clears session cookie

### Client-Side Components

- **`AuthContext.tsx`**: React context provider for authentication state
- **`LoginButton.tsx`**: Login/logout button component (used in Layout)

## Setup

### 1. Environment Variables

**You can reuse your existing Google OAuth credentials!** Just add the new variables below.

Add these to your `.env.local` or Vercel environment variables:

```env
# Google OAuth - REUSE YOUR EXISTING ONES (already in your .env.local)
# GOOGLE_CLIENT_ID=your-existing-client-id  ✅ Already configured
# GOOGLE_CLIENT_SECRET=your-existing-client-secret  ✅ Already configured

# NEW: JWT secret (generate a strong random string)
JWT_SECRET=your-strong-random-secret-key

# Optional: Explicit redirect URI (auto-derived from NEXT_PUBLIC_BASE_URL if not set)
# GOOGLE_USER_AUTH_REDIRECT_URI=http://localhost:3000/api/auth/user/callback

# Optional: Base URL (if you already have this, redirect URI will be auto-derived)
# NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 2. Google OAuth Configuration

Since you're reusing existing credentials, you just need to add a new redirect URI:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your existing OAuth 2.0 Client ID (the one you're already using)
3. Add a new **Authorized redirect URI**:
   - For local: `http://localhost:3000/api/auth/user/callback`
   - For production: `https://yourdomain.com/api/auth/user/callback`
4. Save the changes

**Note:** This is a different redirect URI from your calendar auth (`/api/auth/callback-google`), so you can have both configured in the same OAuth client.

### 3. Firebase Configuration

Ensure Firebase is configured with:
- `FIREBASE_SERVICE_ACCOUNT_KEY_MAIN`: Service account key JSON
- `FIREBASE_DATABASE_URL_MAIN`: Firestore database URL

The system will create a `users` collection in Firestore with the following structure:
```typescript
{
  googleId: string;      // Unique Google user ID
  nickname?: string;      // Optional user nickname
  createdAt: Date;        // Account creation date
  lastLoginAt: Date;      // Last login timestamp
}
```

### 4. Install Dependencies

The following packages are required (check if already installed):
- `jsonwebtoken` - JWT token handling
- `@types/jsonwebtoken` - TypeScript types (dev dependency)

If not installed:
```bash
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

## Usage

### Client-Side

The `AuthProvider` is already added to `_app.tsx`, so authentication is available globally.

```tsx
import { useAuth } from '@/features/infrastructure/auth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <button onClick={login}>Login</button>;
  }
  
  return (
    <div>
      <p>Welcome, {user?.nickname || user?.id}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Server-Side (API Routes)

```typescript
import { getSession } from '@/features/infrastructure/auth/session';
import { getUserById } from '@/features/infrastructure/auth/userService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = getSession(req);
  
  if (!session) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const user = await getUserById(session.userId);
  // Use user data...
}
```

## User Data

The system stores minimal user data:
- **googleId**: Unique identifier from Google (used as primary key)
- **nickname**: Optional user-provided nickname
- **createdAt**: Account creation timestamp
- **lastLoginAt**: Last login timestamp

Users can optionally set a nickname later. The system does not store email, name, or profile picture by default.

## Security Notes

- JWT tokens are stored in HTTP-only cookies (not accessible to JavaScript)
- Cookies use `Secure` flag in production
- `SameSite=Lax` prevents CSRF attacks
- Session tokens expire after 30 days
- JWT_SECRET should be a strong random string (never commit to git)

## Extending for Calendar Integration

The OAuth utilities in `oauth.ts` are designed to be reusable. To use for calendar:

```typescript
import { generateAuthUrl, exchangeCodeForTokens } from '@/features/infrastructure/auth/oauth';

// Generate auth URL with calendar scopes
const authUrl = generateAuthUrl(
  redirectUri,
  ['https://www.googleapis.com/auth/calendar'],
  { purpose: 'calendar', returnUrl: currentUrl }
);
```

