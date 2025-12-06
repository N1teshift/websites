# External Clients Module

**API Reference for `@websites/infrastructure/clients`**

## Overview

The clients module provides integrations with external services including OpenAI, Google APIs, Microsoft APIs, and email services.

## Installation

```typescript
import { openaiClient } from '@websites/infrastructure/clients/openai';
import { googleAuth, googleCalendarClient } from '@websites/infrastructure/clients/google';
import { microsoftAuth, microsoftCalendarClient } from '@websites/infrastructure/clients/microsoft';
import { emailService } from '@websites/infrastructure/clients/email';
```

## Available Clients

### OpenAI

**Module:** `@websites/infrastructure/clients/openai`

**Exports:**
- `openaiClient` - OpenAI API client
- `openaiService` - OpenAI service (server-side)
- `OpenAIConfig` - Configuration type
- Error handlers

**Usage:**
```typescript
import { openaiClient } from '@websites/infrastructure/clients/openai';

const response = await openaiClient.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello' }]
});
```

**Environment Variables:**
- `OPENAI_API_KEY` - OpenAI API key

### Google

**Module:** `@websites/infrastructure/clients/google`

**Exports:**
- `googleAuth` - Google OAuth authentication
- `googleCalendarClient` - Google Calendar client
- `googleCalendarUtils` - Calendar utility functions
- `GoogleConfig` - Configuration type
- Error handlers

**Usage:**
```typescript
import { googleAuth, googleCalendarClient } from '@websites/infrastructure/clients/google';

// Authentication
const authUrl = googleAuth.generateAuthUrl(redirectUri, scopes);

// Calendar
const events = await googleCalendarClient.listEvents(accessToken);
```

**Environment Variables:**
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Microsoft

**Module:** `@websites/infrastructure/clients/microsoft`

**Exports:**
- `microsoftAuth` - Microsoft OAuth authentication
- `microsoftCalendarClient` - Microsoft Calendar client
- `microsoftCalendarUtils` - Calendar utility functions
- `MicrosoftConfig` - Configuration type
- Error handlers

**Usage:**
```typescript
import { microsoftAuth, microsoftCalendarClient } from '@websites/infrastructure/clients/microsoft';

// Authentication
const authUrl = microsoftAuth.generateAuthUrl(redirectUri, scopes);

// Calendar
const events = await microsoftCalendarClient.listEvents(accessToken);
```

**Environment Variables:**
- `MICROSOFT_CLIENT_ID` - Microsoft OAuth client ID
- `MICROSOFT_CLIENT_SECRET` - Microsoft OAuth client secret
- `MICROSOFT_TENANT_ID` - Microsoft tenant ID

### Email

**Module:** `@websites/infrastructure/clients/email`

**Exports:**
- `emailService` - Email service
- `EmailConfig` - Configuration type
- Error handlers

**Usage:**
```typescript
import { emailService } from '@websites/infrastructure/clients/email';

await emailService.send({
  to: 'user@example.com',
  subject: 'Welcome',
  html: '<h1>Welcome!</h1>'
});
```

**Environment Variables:**
- `EMAIL_SERVICE_API_KEY` - Email service API key
- `EMAIL_FROM_ADDRESS` - Sender email address

## Error Handling

All clients include error handling:

```typescript
import { openaiClient } from '@websites/infrastructure/clients/openai';
import { createComponentLogger } from '@websites/infrastructure/logging';

const logger = createComponentLogger('AIService');

try {
  const response = await openaiClient.chat.completions.create({...});
} catch (error) {
  logger.error('OpenAI API error', error as Error, { context });
  throw error;
}
```

## Configuration

Each client module exports a configuration type and error handler:

```typescript
import { OpenAIConfig } from '@websites/infrastructure/clients/openai';
import { GoogleConfig } from '@websites/infrastructure/clients/google';
```

## Best Practices

1. **Use environment variables** - Never hardcode API keys
2. **Handle errors** - All clients include error handlers
3. **Use logging** - Log API calls for debugging
4. **Rate limiting** - Be aware of API rate limits
5. **Error context** - Include context when logging errors

## Related Documentation

- [Getting Started Guide](../../docs/guides/getting-started.md) - Environment setup
- [Error Handling Guide](../../docs/guides/error-handling.md) - Error handling patterns
