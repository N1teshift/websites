# API Handlers Module

**API Reference for `@websites/infrastructure/api`**

## Overview

The API handlers module provides standardized API route handlers with built-in error handling, authentication, validation, and response formatting.

## Installation

```typescript
import { createApiHandler, createGetHandler, createPostHandler } from '@websites/infrastructure/api';
```

## API Reference

### `createApiHandler<T>(handler: ApiHandler<T>, options?: ApiHandlerOptions)`

Generic API route handler for any HTTP method.

**Parameters:**
- `handler` (ApiHandler<T>, required) - Handler function
- `options` (ApiHandlerOptions, optional) - Handler options

**Returns:** Next.js API route handler

**Example:**
```typescript
import { createApiHandler } from '@websites/infrastructure/api';

export default createApiHandler(async (req, res) => {
  return { data: 'Hello World' };
});
```

### `createGetHandler<T>(handler: ApiHandler<T>, options?: ApiHandlerOptions)`

Convenience function for GET requests.

**Example:**
```typescript
import { createGetHandler } from '@websites/infrastructure/api';

export default createGetHandler(async (req, res) => {
  const data = await fetchData();
  return { data };
}, {
  cacheControl: { maxAge: 300, public: true }
});
```

### `createPostHandler<T>(handler: ApiHandler<T>, options?: ApiHandlerOptions)`

Convenience function for POST requests.

**Example:**
```typescript
import { createPostHandler, requireSession } from '@websites/infrastructure/api';

export default createPostHandler(
  async (req, res, context) => {
    const session = requireSession(context);
    const result = await createItem(req.body, session.userId);
    return { data: result };
  },
  {
    requireAuth: true,
    validateBody: zodValidator(CreateItemSchema)
  }
);
```

## Handler Options

### `ApiHandlerOptions`

```typescript
interface ApiHandlerOptions {
  methods?: HttpMethod[];              // Allowed HTTP methods
  requireAuth?: boolean;                // Require authentication
  requireAdmin?: boolean;               // Require admin role
  authConfig?: AuthConfig;              // Auth configuration
  checkResourceOwnership?: Function;     // Resource ownership checker
  validateBody?: Function;              // Body validation function
  logRequests?: boolean;                // Enable request logging
  cacheControl?: CacheControlOptions;   // Cache control (GET only)
}
```

### Authentication

```typescript
export default createApiHandler(
  async (req, res, context) => {
    const session = requireSession(context);
    // Session is guaranteed when requireAuth: true
  },
  {
    requireAuth: true,
    authConfig: {
      getSession: (req, res) => getSession(req),
      checkAdmin: async (session) => await isAdmin(session.userId)
    }
  }
);
```

### Admin Access

```typescript
export default createApiHandler(
  async (req, res, context) => {
    const session = requireSession(context);
    // User is guaranteed to be admin
  },
  {
    requireAuth: true,
    requireAdmin: true,
    authConfig: {
      getSession: (req, res) => getSession(req),
      checkAdmin: async (session) => await isAdmin(session.userId)
    }
  }
);
```

### Body Validation

```typescript
import { zodValidator } from '@websites/infrastructure/api';
import { z } from 'zod';

const CreateItemSchema = z.object({
  name: z.string().min(1),
  value: z.number().positive()
});

export default createPostHandler(
  async (req, res) => {
    // req.body is already validated
    const data = req.body as z.infer<typeof CreateItemSchema>;
    return { data };
  },
  {
    validateBody: zodValidator(CreateItemSchema)
  }
);
```

### Cache Control

```typescript
export default createGetHandler(
  async (req, res) => {
    return { data: getStaticData() };
  },
  {
    cacheControl: {
      maxAge: 3600,        // Cache for 1 hour
      public: true,        // Allow public caching
      mustRevalidate: false
    }
  }
);
```

### Resource Ownership

```typescript
export default createPostHandler(
  async (req, res, context) => {
    const session = requireSession(context);
    const item = await getItem(req.body.id);
    // Ownership already checked
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

## Response Format

All handlers return standardized responses:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Error Handling

Errors are automatically caught, logged, and returned with appropriate status codes:

- `400` - Validation errors
- `401` - Authentication required
- `403` - Forbidden (admin required or resource ownership)
- `404` - Not found
- `405` - Method not allowed
- `500` - Internal server error

Production error messages are sanitized (generic messages for 500 errors).

## Helper Functions

### `requireSession(context?: { session: GenericSession | null }): GenericSession`

Requires session to be present (throws if null).

**Example:**
```typescript
const session = requireSession(context);
// session is guaranteed to be non-null
```

## Best Practices

1. **Use typed handlers** - Specify return type for type safety
2. **Always validate input** - Use `validateBody` for POST/PUT requests
3. **Use appropriate cache control** - Set cache headers for GET requests
4. **Handle errors in handler** - Let `createApiHandler` catch and format errors
5. **Log important operations** - Use logging module for debugging

## Related Documentation

- [API Patterns Guide](../../docs/guides/api-patterns.md) - Complete API patterns guide
- [Error Handling Guide](../../docs/guides/error-handling.md) - Error handling patterns
- [Authentication Guide](../../docs/guides/authentication.md) - Authentication setup
