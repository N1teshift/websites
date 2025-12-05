# Google Cloud Console Setup Guide

This document explains your Google Cloud Console credentials and how they're used in your application.

## Current Setup Overview

### 1. API Keys

**Browser key (auto-created by Firebase)**
- **Purpose**: Automatically created by Firebase for client-side Firebase SDK usage
- **Used for**: Browser-based Firebase operations (if you use Firebase client SDK)
- **Status**: ✅ Auto-managed by Firebase - no action needed
- **Note**: This is typically used for Firebase web apps, but your app primarily uses server-side Firebase Admin SDK

### 2. OAuth 2.0 Client IDs

You have **two OAuth clients** for different purposes:

#### A. "Email" OAuth Client
- **Purpose**: User authentication (login with Google)
- **Used by**: `/api/auth/user/login` → `/api/auth/user/callback`
- **Redirect URI**: `/api/auth/user/callback`
- **Scopes**: `profile`, `email`
- **Environment Variables**: 
  - `GOOGLE_CLIENT_ID` (this client's ID)
  - `GOOGLE_CLIENT_SECRET` (this client's secret)
  - `GOOGLE_USER_AUTH_REDIRECT_URI` (optional, auto-derived from `NEXT_PUBLIC_BASE_URL`)

#### B. "Calendar" OAuth Client  
- **Purpose**: Google Calendar integration (creating calendar events)
- **Used by**: `/api/auth/login-google` → `/api/auth/callback-google`
- **Redirect URI**: `/api/auth/callback-google`
- **Scopes**: `https://www.googleapis.com/auth/calendar`, `profile`, `email`
- **Environment Variables**:
  - `GOOGLE_CLIENT_ID` (this client's ID) - **⚠️ Currently shared with Email client**
  - `GOOGLE_CLIENT_SECRET` (this client's secret) - **⚠️ Currently shared with Email client**
  - `GOOGLE_REDIRECT_URI` (for calendar callbacks)

**⚠️ Important**: Currently, both OAuth clients might be using the same `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables. This works, but you need to ensure **both redirect URIs are added to the same OAuth client** in Google Cloud Console.

### 3. Service Accounts

#### A. `firebase-adminsdk-slano@personal-calendar-x.iam.gserviceaccount.com`
- **Purpose**: Firebase Admin SDK operations
- **Used for**: 
  - Firestore database operations (user data, etc.)
  - Server-side Firebase operations
- **Environment Variables**:
  - `GOOGLE_SERVICE_ACCOUNT_KEY` (JSON key as string)
  - Or `FIREBASE_SERVICE_ACCOUNT_KEY_{DB_NAME}` for multi-database support
- **Status**: ✅ Connected to Firebase project

#### B. `personalcalendar@personal-calendar-x.iam.gserviceaccount.com`
- **Purpose**: Google Calendar service account operations
- **Used for**: Creating calendar events without user OAuth (server-to-server)
- **Environment Variables**: 
  - `GOOGLE_SERVICE_ACCOUNT_KEY` (if shared)
  - Or separate service account key
- **Status**: ✅ For calendar automation

## Recommended Configuration

### Option 1: Use One OAuth Client for Both (Current Setup)

If you're using the same `GOOGLE_CLIENT_ID` for both user auth and calendar:

1. **In Google Cloud Console**, edit your OAuth client (whichever one you're using)
2. **Add ALL redirect URIs**:
   - `http://localhost:3000/api/auth/user/callback` (local user auth)
   - `http://localhost:3000/api/auth/callback-google` (local calendar)
   - `https://www.simonasbernotas.lt/api/auth/user/callback` (production user auth)
   - `https://www.simonasbernotas.lt/api/auth/callback-google` (production calendar)
   - `https://simonasbernotas.vercel.app/api/auth/user/callback` (Vercel user auth)
   - `https://simonasbernotas.vercel.app/api/auth/callback-google` (Vercel calendar)

### Option 2: Separate OAuth Clients (Recommended for Clarity)

**Better organization** - use separate clients:

1. **"Email" OAuth Client** - Only for user authentication:
   - Redirect URIs:
     - `http://localhost:3000/api/auth/user/callback`
     - `https://www.simonasbernotas.lt/api/auth/user/callback`
     - `https://simonasbernotas.vercel.app/api/auth/user/callback`

2. **"Calendar" OAuth Client** - Only for calendar integration:
   - Redirect URIs:
     - `http://localhost:3000/api/auth/callback-google`
     - `https://www.simonasbernotas.lt/api/auth/callback-google`
     - `https://simonasbernotas.vercel.app/api/auth/callback-google`

Then update your environment variables:
- For user auth: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (Email client)
- For calendar: Create new vars like `GOOGLE_CALENDAR_CLIENT_ID` and `GOOGLE_CALENDAR_CLIENT_SECRET` (Calendar client)

## Action Items

### ⚠️ CRITICAL: Add Production Redirect URIs

**Status**: 🔴 **REQUIRED** - These production redirect URIs must be added to your OAuth client(s) in Google Cloud Console.

#### Required Production Redirect URIs:

**For User Authentication OAuth Client:**
- `https://www.simonasbernotas.lt/api/auth/user/callback`
- `https://simonasbernotas.vercel.app/api/auth/user/callback`

**For Calendar OAuth Client (if using same client, add these too):**
- `https://www.simonasbernotas.lt/api/auth/callback-google`
- `https://simonasbernotas.vercel.app/api/auth/callback-google`

#### Steps to Add:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID (the one matching your `GOOGLE_CLIENT_ID` env var)
4. Under **Authorized redirect URIs**, add all the production URIs listed above
5. Click **Save**

**Note**: If you're using separate OAuth clients for user auth and calendar, add the appropriate URIs to each client.

### Optional: Organize OAuth Clients

If you want to separate them (recommended):

1. **Rename existing clients** in Google Cloud Console for clarity:
   - "Email" → "User Authentication"
   - "Calendar" → "Calendar Integration"

2. **Configure redirect URIs** separately (see Option 2 above)

3. **Update code** to use separate environment variables for calendar OAuth (if you want to separate them)

## Summary

- **API Key**: Auto-managed by Firebase ✅
- **OAuth Clients**: Two clients (Email/User Auth and Calendar) - need redirect URIs configured
- **Service Accounts**: Two accounts (Firebase Admin and Calendar) - both connected to your project ✅

The main issue is missing **production redirect URIs** in your OAuth client configuration.

