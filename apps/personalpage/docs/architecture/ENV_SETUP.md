# Environment Variables Setup for User Authentication

## Variables You Can Reuse (Already in your .env.local)

✅ **These are already configured and can be reused:**

```env
GOOGLE_CLIENT_ID=your-existing-client-id
GOOGLE_CLIENT_SECRET=your-existing-client-secret
NEXT_PUBLIC_BASE_URL=your-base-url  # (if you have this)
```

## New Variables You Need to Add

Add these to your `.env.local`:

```env
# JWT Secret - Generate a strong random string
JWT_SECRET=your-strong-random-secret-key-here

# Firebase for user storage - TWO OPTIONS:

# OPTION 1: Reuse your existing testresults database (EASIEST)
# Just add this line to reuse your existing Firebase setup:
FIREBASE_USER_DB_NAME=testresults

# OPTION 2: Create a new 'main' database for users
# If you want a separate database, add these:
# FIREBASE_SERVICE_ACCOUNT_KEY_MAIN=your-firebase-service-account-json
# FIREBASE_DATABASE_URL_MAIN=your-firestore-database-url

# Optional: Explicit redirect URI (if not set, will be derived from NEXT_PUBLIC_BASE_URL)
# GOOGLE_USER_AUTH_REDIRECT_URI=http://localhost:3000/api/auth/user/callback
```

## Summary

**Minimum required additions:**
- `JWT_SECRET` - A strong random string for signing JWT tokens

**Optional (auto-derived if not set):**
- `GOOGLE_USER_AUTH_REDIRECT_URI` - Will be `${NEXT_PUBLIC_BASE_URL}/api/auth/user/callback` if not provided

## Google OAuth Console Setup

Since you're reusing the same `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, you need to add a new **Authorized redirect URI** in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth 2.0 Client ID
3. Add this redirect URI:
   - For local: `http://localhost:3000/api/auth/user/callback`
   - For production: `https://yourdomain.com/api/auth/user/callback`

**Note:** This is different from your calendar redirect URI (`/api/auth/callback-google`), so you can have both configured.

## Quick Setup

1. Add `JWT_SECRET` to `.env.local`:
   ```bash
   # Generate a secret (or use any strong random string)
   echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env.local
   ```

2. Add the redirect URI in Google Cloud Console (see above)

3. Restart your dev server

That's it! The system will automatically use your existing `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

