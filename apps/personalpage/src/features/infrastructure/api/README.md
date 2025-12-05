# API Module

- **Type**: Infrastructure
- **Purpose**: Self-contained API clients + request helpers that other features consume.
- **Status**: Production-ready; needs contract notes for each client (see below).

A modular API utilities module with self-contained API clients.

## Overview

This module provides shared utilities and individual API clients that can be copied independently:
- **OpenAI** - AI/ML services (self-contained)
- **Firebase** - Database and authentication (self-contained)
- **Google** - Calendar and authentication services (self-contained)
- **Microsoft** - Graph API and calendar services (self-contained)

## Structure

```
src/features/infrastructure/api/
├── index.ts                    # Shared utilities only
├── apiRequest.ts               # Core API request utility
├── README.md                   # Documentation
├── openai/                     # OpenAI services
│   ├── index.ts
│   ├── types.ts
│   ├── config.ts
│   ├── errorHandler.ts
│   └── openaiClient.ts
├── firebase/                   # Firebase services
│   ├── index.ts
│   ├── config.ts
│   ├── errorHandler.ts
│   └── firebaseClient.ts
├── google/                     # Google services
│   ├── index.ts
│   ├── config.ts
│   ├── errorHandler.ts
│   ├── auth/
│   │   └── googleAuth.ts       # Google authentication
│   └── calendar/
│       └── googleCalendarClient.ts
└── microsoft/                  # Microsoft services
    ├── index.ts
    ├── config.ts
    ├── errorHandler.ts
    └── calendar/
        └── microsoftCalendarClient.ts
```

## Features

### 🔧 Modular Configuration
- Each API client has its own configuration
- Service-specific environment variables
- Independent validation per service
- No cross-dependencies between clients

### 🛡️ Decoupled Error Handling
- Error handling utilities in the logging module
- Service-specific error handlers for each API
- Consistent error types and logging
- Retry logic for transient failures

### 📦 Self-Contained Clients
- Each client can be copied independently
- Minimal dependencies (only utils)
- Service-specific types and configuration
- Easy to extract and reuse

## Usage

### Using Individual API Clients

```typescript
// OpenAI client (self-contained)
import { createOpenAIClient } from '@/features/infrastructure/api/openai';

const openaiClient = createOpenAIClient();

// Chat completion
const response = await openaiClient.chatCompletion([
  { role: 'user', content: 'Hello, how are you?' }
], { temperature: 0.7 });

// Text completion
const completion = await openaiClient.completion('Complete this sentence:', { max_tokens: 100 });

// Firebase client (self-contained)
import { createFirebaseClient } from '@/features/infrastructure/api/firebase';

const firebaseClient = createFirebaseClient();

// Get document
const doc = await firebaseClient.getDocument('users', 'userId');

// Set document
await firebaseClient.setDocument('users', 'userId', { name: 'John', email: 'john@example.com' });

// Google Calendar client (self-contained)
import { createGoogleCalendarClient } from '@/features/infrastructure/api/google';

const googleCalendarClient = createGoogleCalendarClient();

// Get calendar events
const events = await googleCalendarClient.getCalendarEvents('primary');

// Create calendar event
await googleCalendarClient.createCalendarEvent('primary', {
  summary: 'Meeting',
  start: { dateTime: '2024-01-01T10:00:00Z' },
  end: { dateTime: '2024-01-01T11:00:00Z' }
});

// Or use low-level utilities directly
import { createGoogleCalendarEvent, createServiceAccountEvent } from '@/features/infrastructure/api/google';
const event = await createGoogleCalendarEvent(oauth2Client, 'primary', eventData);
const serviceEvent = await createServiceAccountEvent(eventData);

// Microsoft Calendar client (self-contained)
import { createMicrosoftCalendarClient } from '@/features/infrastructure/api/microsoft';

const microsoftCalendarClient = createMicrosoftCalendarClient();

// Get calendar events
const events = await microsoftCalendarClient.getCalendarEvents('default');

// Get user profile
const profile = await microsoftCalendarClient.getUserProfile();

// Or use low-level utilities directly
import { createMicrosoftCalendarEvent } from '@/features/infrastructure/api/microsoft';
const event = await createMicrosoftCalendarEvent(accessToken, eventData);

### Real-World Usage in Calendar Module

The Calendar module now uses the new API clients:

```typescript
// Client-side hook (useCalendarData.ts)
import { createGoogleCalendarClient } from '@/features/infrastructure/api/google';

const googleCalendarClient = createGoogleCalendarClient();
const events = await googleCalendarClient.getCalendarEvents('primary');

// Server-side API routes
// calendar-events-google.ts
const { createGoogleCalendarClient } = await import('@/features/infrastructure/api/google');
const googleCalendarClient = createGoogleCalendarClient();
const events = await googleCalendarClient.getCalendarEvents('primary');

// calendar-events-ms.ts  
const { createMicrosoftCalendarClient } = await import('@/features/infrastructure/api/microsoft');
const microsoftCalendarClient = createMicrosoftCalendarClient();
const events = await microsoftCalendarClient.getCalendarEvents('default');
```

### How It Works

The API clients now make **direct external API calls** instead of calling internal endpoints:

1. **Google Calendar Client**: Uses the Google authentication service (`googleAuth.ts`) from the API module to make direct calls to Google Calendar API
2. **Microsoft Calendar Client**: Uses the centralized `getAccessToken()` function to get access tokens and makes direct calls to Microsoft Graph API
3. **Error Handling**: All errors are handled consistently through the API module's error handlers
4. **Authentication**: Leverages existing authentication services from the Calendar module

### Error Handling

```typescript
// OpenAI-specific error handling
import { handleOpenAIError, ApiErrorType } from '@/features/infrastructure/api/clients/openai';

try {
  // Make OpenAI API call
} catch (error) {
  const apiError = handleOpenAIError(error, '/v1/chat/completions');
  
  if (apiError.type === ApiErrorType.RATE_LIMIT) {
    // Handle rate limiting
  } else if (apiError.retryable) {
    // Retry the request
  }
}

// Firebase-specific error handling
import { handleFirebaseError } from '@/features/infrastructure/api/clients/firebase';

try {
  // Make Firebase call
} catch (error) {
  const apiError = handleFirebaseError(error, 'database-read');
}
```

### Making API Requests

```typescript
import { apiRequest } from '@/features/infrastructure/api';

// Simple API call
const data = await apiRequest<MyResponseType>('/api/endpoint', 'POST', payload);

// With error handling
try {
  const data = await apiRequest<MyResponseType>('/api/endpoint', 'POST', payload);
} catch (error) {
  // Error is automatically logged and formatted
  console.error('API call failed:', error.message);
}
```

## Environment Variables

### Required Variables

```bash
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Firebase
FIREBASE_PROJECT_ID=your_project_id
GOOGLE_SERVICE_ACCOUNT_KEY=your_service_account_json

# Google (if calendar integration enabled)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Microsoft (if calendar integration enabled)
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_TENANT_ID=your_tenant_id
```

### Optional Variables

```bash
# OpenAI
OPENAI_API_BASE_URL=https://api.openai.com/v1
OPENAI_DEFAULT_MODEL=gpt-4o-mini
OPENAI_TIMEOUT=30000

# Firebase
FIREBASE_DATABASE_URL=your_database_url

# Calendar Integration
NEXT_PUBLIC_ENABLE_CALENDAR_INTEGRATION=true
```

## Error Types

The module defines standardized error types:

- `NETWORK` - Connection issues
- `AUTHENTICATION` - Invalid credentials
- `AUTHORIZATION` - Insufficient permissions
- `RATE_LIMIT` - API rate limiting
- `QUOTA_EXCEEDED` - Service quota exceeded
- `VALIDATION` - Invalid request data
- `SERVER_ERROR` - Service-side errors
- `UNKNOWN` - Unclassified errors

## Environment Variables

### Required Variables

```bash
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Firebase
FIREBASE_PROJECT_ID=your_project_id
GOOGLE_SERVICE_ACCOUNT_KEY=your_service_account_json

# Google (if calendar integration enabled)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Microsoft (if calendar integration enabled)
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_TENANT_ID=your_tenant_id
```

## Best Practices

1. **Always use the centralized configuration** instead of direct environment variable access
2. **Handle errors consistently** using the provided error handlers
3. **Use TypeScript types** for all request/response data
4. **Log API interactions** for debugging and monitoring
5. **Implement retry logic** for transient failures
6. **Validate configuration** at application startup

## Future Enhancements

- [ ] **Rate limiting** - Automatic rate limit handling
- [ ] **Caching** - Response caching for frequently accessed data
- [ ] **Circuit breaker** - Automatic failure detection and recovery
- [ ] **Metrics** - API usage and performance metrics
- [ ] **Mocking** - Easy mocking for testing
