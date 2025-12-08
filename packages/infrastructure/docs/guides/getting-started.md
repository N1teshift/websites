# Getting Started

**Environment setup and configuration guide for @websites/infrastructure**

## Overview

This guide covers the initial setup required to use the infrastructure package in your Next.js application.

## Installation

The package is part of the monorepo and is automatically available via workspace protocol.

### 1. Add Dependency

In your app's `package.json`:

```json
{
  "dependencies": {
    "@websites/infrastructure": "workspace:*"
  }
}
```

### 2. Configure TypeScript

Add to your `tsconfig.json`:

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

## Environment Variables

### Required Variables

Create a `.env.local` file in your app root:

```env
# JWT Secret (for authentication)
JWT_SECRET=your-strong-random-secret-key-here

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_KEY=your-firebase-service-account-json
FIREBASE_DATABASE_URL=your-firestore-database-url

# Or reuse existing database
FIREBASE_USER_DB_NAME=testresults

# Google OAuth (if using Google auth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Optional Variables

```env
# Enable debug logs in production
ENABLE_DEBUG_LOGS=false

# OpenAI API Key (if using AI features)
OPENAI_API_KEY=your-openai-api-key

# Microsoft OAuth (if using Microsoft auth)
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_TENANT_ID=your-microsoft-tenant-id

# Email Service (if using email features)
EMAIL_SERVICE_API_KEY=your-email-service-api-key
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
```

## Quick Start

### 1. Basic Logging

```typescript
import { createComponentLogger } from '@websites/infrastructure/logging';

const logger = createComponentLogger('MyComponent');
logger.info('Application started');
```

### 2. API Route Handler

```typescript
import { createApiHandler } from '@websites/infrastructure/api';

export default createApiHandler(async (req, res) => {
  return { data: 'Hello World' };
});
```

### 3. Authentication

```typescript
import { createApiHandler, requireSession } from '@websites/infrastructure/api';

export default createApiHandler(
  async (req, res, context) => {
    const session = requireSession(context);
    // Use session data
  },
  { requireAuth: true }
);
```

### 4. Internationalization

```typescript
import { useFallbackTranslation } from '@websites/infrastructure/i18n';

function MyComponent() {
  const { t } = useFallbackTranslation();
  return <h1>{t('welcome')}</h1>;
}
```

## Google Cloud Console Setup

### OAuth 2.0 Client IDs

You may need multiple OAuth clients for different purposes:

#### User Authentication Client
- **Purpose**: User authentication (login with Google)
- **Redirect URI**: `/api/auth/user/callback`
- **Scopes**: `openid`, `profile`, `email`
- **Environment Variables**: 
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`

#### Calendar Integration Client (Optional)
- **Purpose**: Google Calendar integration
- **Redirect URI**: `/api/auth/callback-google`
- **Scopes**: `https://www.googleapis.com/auth/calendar`, `profile`, `email`
- **Note**: Can use same client ID/secret if both redirect URIs are added

### Service Accounts

#### Firebase Admin SDK Service Account
- **Purpose**: Firebase Admin SDK operations (Firestore, Storage)
- **Environment Variables**:
  - `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON key as string)
  - `FIREBASE_DATABASE_URL` (Firestore database URL)

**Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to IAM & Admin → Service Accounts
3. Create or select service account
4. Generate JSON key
5. Copy entire JSON as string to `FIREBASE_SERVICE_ACCOUNT_KEY`

### Firebase Configuration

**Client-Side Config:**
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Auto-created by Firebase
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - `{project-id}.firebaseapp.com`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - `{project-id}.appspot.com`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - From Firebase Console
- `NEXT_PUBLIC_FIREBASE_APP_ID` - From Firebase Console

**Note:** These are typically auto-configured when you create a Firebase project.

## Next Steps

- **[Error Handling Guide](./error-handling.md)** - Learn error handling patterns
- **[Logging Guide](./logging.md)** - Comprehensive logging documentation
- **[Authentication Guide](./authentication.md)** - Authentication setup and patterns
- **[i18n Guide](./i18n.md)** - Internationalization setup
- **[API Patterns](./api-patterns.md)** - API route handler patterns

## Troubleshooting

### TypeScript Errors

If you see import errors, ensure:
1. `tsconfig.json` includes the paths configuration
2. The package is listed in `package.json` dependencies
3. Run `npm install` or `pnpm install` to sync workspace

### Environment Variables Not Loading

- Ensure `.env.local` is in your app root (not in packages/)
- Restart your development server after adding variables
- Check variable names match exactly (case-sensitive)

### Module Not Found

- Verify workspace protocol: `"@websites/infrastructure": "workspace:*"`
- Run `pnpm install` to sync monorepo dependencies
- Check that the package exists in `packages/infrastructure/`

## Related Documentation

- [Package README](../README.md) - Package overview
- [Module Documentation](../src/README.md) - Module-level API references
