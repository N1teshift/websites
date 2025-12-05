# Environment Variables Reference

This document lists all environment variables that your system currently expects, organized by category.

## Core Application

### Required
- `NODE_ENV` - Environment mode (`development` | `production`) - Automatically set by Next.js/Vercel

### Optional
- `NEXT_PUBLIC_BASE_URL` - Base URL for the application (defaults to `http://localhost:3000` in development)
- `NEXT_PUBLIC_API_BASE_URL` - Base URL for API requests (defaults to empty string)

## Authentication & Session

### Required
- `JWT_SECRET` - Secret key for signing JWT tokens (defaults to `'change-me-in-production'` - **MUST be changed in production**)

### Optional
- `GOOGLE_USER_AUTH_REDIRECT_URI` - Redirect URI for Google user authentication (defaults to `${NEXT_PUBLIC_BASE_URL}/api/auth/user/callback`)

## Google OAuth & Calendar

### Required (if using Google Calendar)
- `GOOGLE_CLIENT_ID` - Google OAuth 2.0 Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth 2.0 Client Secret
- `GOOGLE_SERVICE_ACCOUNT_KEY` - Google Service Account JSON key (as string) - Required for Firebase and service account auth

### Optional
- `GOOGLE_REDIRECT_URI` - Redirect URI for Google OAuth (used in calendar integration)

## Microsoft/Azure OAuth & Calendar

### Required (if using Microsoft Calendar)
- `MICROSOFT_CLIENT_ID` or `AZURE_CLIENT_ID` - Microsoft/Azure OAuth Client ID
- `MICROSOFT_CLIENT_SECRET` or `AZURE_CLIENT_SECRET` - Microsoft/Azure OAuth Client Secret
- `MICROSOFT_TENANT_ID` - Microsoft Azure Tenant ID

### Optional
- `MICROSOFT_REDIRECT_URI` - Redirect URI for Microsoft OAuth
- `AZURE_REDIRECT_URI` - Alternative redirect URI for Microsoft OAuth (defaults to `http://localhost:3000/api/auth/callback-microsoft`)
- `USER_PRINCIPAL_NAME` - User principal name for Microsoft Graph API calls

## Firebase

### Required
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `GOOGLE_SERVICE_ACCOUNT_KEY` - Google Service Account JSON key (as string) - Shared with Google config

### Optional
- `FIREBASE_DATABASE_URL` - Firebase Realtime Database URL
- `FIREBASE_USER_DB_NAME` - Database name for user storage (defaults to `'main'`)

### Dynamic Firebase Variables (for multi-database support)
These are dynamically constructed based on database name:
- `FIREBASE_SERVICE_ACCOUNT_KEY_{DB_NAME}` - Service account key for specific database (e.g., `FIREBASE_SERVICE_ACCOUNT_KEY_MAIN`, `FIREBASE_SERVICE_ACCOUNT_KEY_TESTRESULTS`)
- `FIREBASE_DATABASE_URL_{DB_NAME}` - Database URL for specific database (e.g., `FIREBASE_DATABASE_URL_MAIN`, `FIREBASE_DATABASE_URL_TESTRESULTS`)

## OpenAI

### Required (if using OpenAI)
- `OPENAI_API_KEY` - OpenAI API key

### Optional
- `OPENAI_API_BASE_URL` - OpenAI API base URL (defaults to `https://api.openai.com/v1`)
- `OPENAI_DEFAULT_MODEL` - Default OpenAI model to use (defaults to `gpt-4o-mini`)
- `OPENAI_TIMEOUT` - Request timeout in milliseconds (defaults to `30000`)

## Calendar Integration (Public Variables)

### Optional
- `NEXT_PUBLIC_CALENDAR_EMAIL` - Email address for the calendar
- `NEXT_PUBLIC_CALENDAR_TIMEZONE` - Timezone for calendar events (defaults to `UTC`)
- `NEXT_PUBLIC_CALENDAR_ATTENDEE_NAME` - Name for calendar attendee
- `NEXT_PUBLIC_CALENDAR_ONLINE_MEETING_PROVIDER` - Online meeting provider (defaults to `teamsForBusiness`)

## Email Service

### Required (if using email notifications)
- `EMAIL_USER` or `SMTP_USER` - Email account username for SMTP authentication
- `EMAIL_PASSWORD` or `SMTP_PASSWORD` - Email account password for SMTP authentication

### Optional
- `EMAIL_HOST` or `SMTP_HOST` - SMTP server hostname (defaults to `smtp.gmail.com`)
- `EMAIL_PORT` or `SMTP_PORT` - SMTP server port (defaults to `587`)
- `EMAIL_SECURE` or `SMTP_SECURE` - Use secure connection (defaults to `false`, automatically `true` if port is `465`)
- `EMAIL_FROM` - Email address to send from (defaults to `EMAIL_USER`)
- `EMAIL_FROM_NAME` - Display name for the sender (optional)

## CORS Configuration

### Optional
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins (defaults to localhost origins in development)
- `CORS_ALLOWED_METHODS` - Allowed HTTP methods for CORS (defaults to `GET, POST, PUT, DELETE, OPTIONS`)
- `CORS_ALLOWED_HEADERS` - Allowed HTTP headers for CORS (defaults to `Content-Type, Authorization`)

## Logging

### Optional
- `ENABLE_DEBUG_LOGS` - Enable debug logging in production (set to `'true'` to enable)

## Vercel Deployment (Scripts Only)

### Optional (for deployment scripts)
- `VERCEL_TOKEN` - Vercel API token for deployment checks
- `VERCEL_TEAM_ID` - Vercel team ID for deployment checks

## Summary by Priority

### Critical (Must Have)
1. `JWT_SECRET` - **Required for authentication** (change default in production!)
2. `GOOGLE_CLIENT_ID` - Required if using Google OAuth
3. `GOOGLE_CLIENT_SECRET` - Required if using Google OAuth
4. `GOOGLE_SERVICE_ACCOUNT_KEY` - Required for Firebase and Google service account auth
5. `FIREBASE_PROJECT_ID` - Required for Firebase

### Important (Feature-Specific)
- `MICROSOFT_CLIENT_ID` / `AZURE_CLIENT_ID` - Required if using Microsoft Calendar
- `MICROSOFT_CLIENT_SECRET` / `AZURE_CLIENT_SECRET` - Required if using Microsoft Calendar
- `MICROSOFT_TENANT_ID` - Required if using Microsoft Calendar
- `OPENAI_API_KEY` - Required if using OpenAI features
- `USER_PRINCIPAL_NAME` - Required if using Microsoft Calendar API

### Recommended (Production)
- `NEXT_PUBLIC_BASE_URL` - Should be set in production
- `ALLOWED_ORIGINS` - Should be set in production for proper CORS

### Optional (Nice to Have)
- All other variables have sensible defaults or are auto-derived

## Notes

1. **NEXT_PUBLIC_*** variables are exposed to the browser and should not contain secrets
2. Variables with defaults will work without being set, but may not be suitable for production
3. Some variables have aliases (e.g., `MICROSOFT_CLIENT_ID` and `AZURE_CLIENT_ID`) - use either one
4. Firebase database variables can be dynamic based on database name (see Dynamic Firebase Variables section)
5. `JWT_SECRET` has a default value but **MUST be changed in production** for security

