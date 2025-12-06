# API Patterns Guide

**Complete guide to API route handler patterns in @websites/infrastructure**

## Overview

The infrastructure package provides standardized API route handlers with built-in error handling, authentication, validation, and response formatting.

## Quick Start

```typescript
import { createApiHandler } from '@websites/infrastructure/api';

export default createApiHandler(async (req, res) => {
  return { data: 'Hello World' };
});
```

## Basic Patterns

### GET Request

```typescript
import { createGetHandler } from '@websites/infrastructure/api';

export default createGetHandler(async (req, res) => {
  const data = await fetchData();
  return { data };
}, {
  cacheControl: {
    maxAge: 300,  // Cache for 5 minutes
    public: true
  }
});
```

### POST Request

```typescript
import { createPostHandler } from '@websites/infrastructure/api';

export default createPostHandler(async (req, res) => {
  const result = await createItem(req.body);
  return { data: result };
});
```

## Authentication Patterns

### Require Authentication

```typescript
import { createPostHandler, requireSession } from '@websites/infrastructure/api';

export default createPostHandler(
  async (req, res, context) => {
    const session = requireSession(context);
    // Session is guaranteed when requireAuth: true
    const userId = session.userId;
    
    const result = await createItem(req.body, userId);
    return { data: result };
  },
  {
    requireAuth: true,
    authConfig: {
      getSession: (req, res) => getSession(req)
    }
  }
);
```

### Require Admin

```typescript
export default createPostHandler(
  async (req, res, context) => {
    const session = requireSession(context);
    // User is guaranteed to be admin
    const result = await adminOperation(req.body);
    return { data: result };
  },
  {
    requireAuth: true,
    requireAdmin: true,
    authConfig: {
      getSession: (req, res) => getSession(req),
      checkAdmin: async (session) => {
        const user = await getUserById(session.userId);
        return user?.role === 'admin';
      }
    }
  }
);
```

## Validation Patterns

### Zod Validation

```typescript
import { createPostHandler } from '@websites/infrastructure/api';
import { zodValidator } from '@websites/infrastructure/api';
import { z } from 'zod';

const CreateItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  value: z.number().positive('Value must be positive')
});

export default createPostHandler(
  async (req, res) => {
    // req.body is already validated
    const data = req.body as z.infer<typeof CreateItemSchema>;
    const result = await createItem(data);
    return { data: result };
  },
  {
    validateBody: zodValidator(CreateItemSchema)
  }
);
```

### Custom Validation

```typescript
export default createPostHandler(
  async (req, res) => {
    const result = await createItem(req.body);
    return { data: result };
  },
  {
    validateBody: (body) => {
      if (!body.name || typeof body.name !== 'string') {
        return 'Name is required and must be a string';
      }
      return true;
    }
  }
);
```

## Error Handling Patterns

### Custom Error Status Codes

```typescript
import { createApiHandler } from '@websites/infrastructure/api';

export default createApiHandler(async (req, res) => {
  const item = await getItem(req.query.id);
  
  if (!item) {
    const error = new Error('Item not found') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }
  
  return { data: item };
});
```

### Production Error Messages

Errors are automatically sanitized in production:
- **Development**: Full error message
- **Production**: Generic "Internal server error" for 500s

```typescript
// Automatically handled by createApiHandler
// Production: "Internal server error"
// Development: Full error message
```

## Caching Patterns

### Cache GET Responses

```typescript
import { createGetHandler } from '@websites/infrastructure/api';

export default createGetHandler(
  async (req, res) => {
    const data = await getStaticData();
    return { data };
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

### No Cache

```typescript
export default createGetHandler(
  async (req, res) => {
    const data = await getDynamicData();
    return { data };
  },
  {
    cacheControl: false  // No caching
  }
);
```

## Resource Ownership Patterns

### Check Resource Ownership

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

## Method Restriction

### Allow Specific Methods

```typescript
export default createApiHandler(
  async (req, res) => {
    return { data: 'Success' };
  },
  {
    methods: ['GET', 'POST']  // Only allow GET and POST
  }
);
```

## Request Logging

### Enable Request Logging

```typescript
export default createApiHandler(
  async (req, res) => {
    return { data: 'Success' };
  },
  {
    logRequests: true  // Log all requests
  }
);
```

## Response Format

All handlers return standardized responses:

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

## Best Practices

1. **Use typed handlers** - Specify return type for type safety
2. **Always validate input** - Use `validateBody` for POST/PUT requests
3. **Use appropriate cache control** - Set cache headers for GET requests
4. **Handle errors in handler** - Let `createApiHandler` catch and format errors
5. **Use requireAuth for protected routes** - Don't manually check authentication
6. **Check resource ownership** - Use `checkResourceOwnership` for user-specific resources

## Related Documentation

- [API Module API Reference](../src/api/README.md) - Complete API reference
- [Error Handling Guide](./error-handling.md) - Error handling patterns
- [Authentication Guide](./authentication.md) - Authentication setup
