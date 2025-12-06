# Authentication Guide

**Complete guide to authentication and authorization in @websites/infrastructure**

## Overview

The infrastructure package provides OAuth-based authentication with JWT session management and flexible authorization patterns.

## Quick Start

### Using createApiHandler (Recommended)

```typescript
import { createPostHandler, requireSession } from '@websites/infrastructure/api';

export default createPostHandler(
  async (req, res, context) => {
    // Session is guaranteed to be available when requireAuth: true
    const session = requireSession(context);
    
    // Use session data
    const userId = session.userId;
    
    // Handler logic
  },
  {
    requireAuth: true, // Automatically checks authentication
    logRequests: true,
  }
);
```

## Authentication Patterns

### Server-Side Checks

Always verify authentication server-side:

```typescript
import { getSession } from '@websites/infrastructure/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = getSession(req);
  
  if (!session) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Proceed with authenticated operation
}
```

### Using createApiHandler

The recommended approach uses `createApiHandler` with `requireAuth: true`:

```typescript
import { createApiHandler, requireSession } from '@websites/infrastructure/api';

export default createApiHandler(
  async (req, res, context) => {
    const session = requireSession(context);
    // Session is guaranteed to be available
    const userId = session.userId;
    
    // Handler logic
  },
  {
    requireAuth: true, // Automatically checks authentication
    logRequests: true,
  }
);
```

**How it works:**
- `requireAuth: true` automatically checks authentication
- Returns `401 Unauthorized` if not authenticated
- Session is available via `requireSession(context)` helper
- No need to manually check authentication

## Authorization

### Role-Based Access Control

Check user roles for admin operations:

```typescript
export default createApiHandler(
  async (req, res, context) => {
    const session = requireSession(context);
    // User is guaranteed to be admin when requireAdmin: true
    // ... admin-only operations
  },
  {
    requireAuth: true,
    requireAdmin: true, // Also checks admin role
    authConfig: {
      getSession: (req, res) => getSession(req),
      checkAdmin: async (session) => {
        const user = await getUserById(session.userId);
        return user?.role === 'admin';
      }
    }
    // Returns 403 Forbidden if not admin
  }
);
```

### Resource Ownership

Verify users can only modify their own resources:

```typescript
export default createPostHandler(
  async (req, res, context) => {
    const session = requireSession(context);
    const item = await getItem(req.body.id);
    // Ownership already checked by checkResourceOwnership
    return { data: item };
  },
  {
    requireAuth: true,
    checkResourceOwnership: async (item, session) => {
      return item.userId === session.userId;
    }
  }
);
```

## OAuth Flow

### Google OAuth Setup

1. **Configure Environment Variables:**

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-strong-random-secret-key
FIREBASE_SERVICE_ACCOUNT_KEY=your-firebase-service-account-json
FIREBASE_DATABASE_URL=your-firestore-database-url
```

2. **Add Redirect URI in Google Cloud Console:**
   - `http://localhost:3000/api/auth/user/callback` (development)
   - `https://yourdomain.com/api/auth/user/callback` (production)

3. **Implement OAuth Flow:**

```typescript
import { generateAuthUrl } from '@websites/infrastructure/auth/oauth';

// Step 1: Generate auth URL
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authUrl = generateAuthUrl(
    '/api/auth/user/callback',
    ['openid', 'profile', 'email']
  );
  res.redirect(authUrl);
}
```

```typescript
import { exchangeCodeForTokens } from '@websites/infrastructure/auth/oauth';
import { getOrCreateUser } from '@websites/infrastructure/auth';
import { createSession } from '@websites/infrastructure/auth';

// Step 2: Handle callback
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  
  const tokens = await exchangeCodeForTokens(
    code as string,
    '/api/auth/user/callback'
  );
  
  // Get user info from Google
  const userInfo = await getGoogleUserInfo(tokens.access_token);
  
  // Create or get user
  const user = await getOrCreateUser(userInfo.sub, userInfo.email);
  
  // Create session
  createSession(user.id, res);
  
  res.redirect('/');
}
```

## User Management

### Get User

```typescript
import { getUserById } from '@websites/infrastructure/auth';

const user = await getUserById(userId);
if (user) {
  console.log(user.nickname, user.email);
}
```

### Update User Preferences

```typescript
import { updateUserPreferences } from '@websites/infrastructure/auth';

await updateUserPreferences(userId, {
  nickname: 'New Nickname',
  language: 'en',
  theme: 'dark'
});
```

## Session Management

### Get Session from Request

```typescript
import { getSession } from '@websites/infrastructure/auth';

const session = getSession(req);
if (session) {
  console.log('User ID:', session.userId);
}
```

### Create Session

```typescript
import { createSession } from '@websites/infrastructure/auth';

createSession(userId, res);
// JWT cookie is now set
```

### Clear Session (Logout)

```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Set-Cookie', 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  res.json({ success: true });
}
```

## Security Best Practices

### 1. Always Verify Server-Side

❌ **Don't do this:**
```typescript
// Client-side only check
if (user) {
  // Make API call
}
```

✅ **Do this:**
```typescript
// Server-side check
export default createApiHandler(
  async (req, res, context) => {
    const session = requireSession(context);
    // Proceed with authenticated operation
  },
  { requireAuth: true }
);
```

### 2. Use HTTP-Only Cookies

JWT tokens are automatically stored in HTTP-only cookies (not accessible to JavaScript).

### 3. Secure Cookies in Production

Cookies automatically use:
- `Secure` flag in production (HTTPS only)
- `SameSite=Lax` to prevent CSRF attacks
- Configurable expiration (default: 30 days)

### 4. Validate All Input

```typescript
import { zodValidator } from '@websites/infrastructure/api';

export default createPostHandler(
  async (req, res) => {
    // req.body is already validated
  },
  {
    requireAuth: true,
    validateBody: zodValidator(CreateItemSchema)
  }
);
```

## Related Documentation

- [Auth Module API Reference](../src/auth/README.md) - Complete API reference
- [API Patterns Guide](./api-patterns.md) - API route handler patterns
- [Security Guide](./security.md) - Security best practices
