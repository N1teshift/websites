# Logging System Documentation

**Complete guide to the logging system in @websites/infrastructure**

## Overview

The project uses a **custom console-based logging system** with environment-aware log levels and component-specific logging capabilities.

### Key Features

- ✅ Console-based (no external dependencies)
- ✅ Four log levels (DEBUG, INFO, WARN, ERROR)
- ✅ Environment-aware (dev vs production)
- ✅ Component logger factory for organized logging
- ✅ Structured metadata support
- ✅ Error categorization
- ✅ Works everywhere (client & server)

### Location

```
packages/infrastructure/src/logging/
├── logger.ts          # Core logger implementation
├── errorHandler.ts   # Error handling utilities
├── index.ts          # Public exports
└── README.md         # Module API reference
```

## Quick Start

```typescript
import { createComponentLogger } from '@websites/infrastructure/logging';

const logger = createComponentLogger('MyComponent');
logger.info('Component initialized');
logger.error('Something went wrong', error);
```

## Log Levels

The system uses four log levels in priority order:

1. **ERROR** (0) - Critical errors, always logged
2. **WARN** (1) - Warnings and potential issues
3. **INFO** (2) - General information, important events ⭐ DEFAULT in development
4. **DEBUG** (4) - Detailed debugging information

### Environment-Aware Behavior

```typescript
// Development: INFO and above (INFO, WARN, ERROR)
// Production: WARN and above (WARN, ERROR)
// Production + ENABLE_DEBUG_LOGS=true: DEBUG and above (all logs)
```

**Log Levels by Environment**:
- **Development**: INFO and above (INFO, WARN, ERROR)
- **Production**: WARN and above (WARN, ERROR)
- **Production + ENABLE_DEBUG_LOGS=true**: DEBUG and above (all logs)

## Usage Patterns

### 1. Basic Component Logging

```typescript
import { createComponentLogger } from '@websites/infrastructure/logging';

const logger = createComponentLogger('MyComponent');

export function MyComponent() {
  logger.info('Component mounted');
  logger.debug('Rendering with props', { props });
  
  try {
    // operation
  } catch (error) {
    logger.error('Operation failed', error instanceof Error ? error : new Error(String(error)));
  }
  
  return <div>...</div>;
}
```

### 2. Method-Specific Logging

```typescript
import { createComponentLogger } from '@websites/infrastructure/logging';

class DataService {
  private logger = createComponentLogger('DataService');
  
  async fetchData(id: string) {
    const methodLogger = createComponentLogger('DataService', 'fetchData');
    
    methodLogger.debug('Fetching data', { id });
    
    try {
      const data = await fetch(`/api/data/${id}`);
      methodLogger.info('Data fetched successfully', { id, size: data.length });
      return data;
    } catch (error) {
      methodLogger.error('Failed to fetch data', error instanceof Error ? error : new Error(String(error)), { id });
      throw error;
    }
  }
}
```

### 3. API Request Logging

```typescript
import { createComponentLogger } from '@websites/infrastructure/logging';

const logger = createComponentLogger('ApiRequest');

export const apiRequest = async <T = unknown>(url: string, method: string = 'GET') => {
  logger.debug('Making API request', {
    method,
    url,
  });

  try {
    const response = await axios({ method, url });
    
    logger.debug('API request successful', {
      method,
      url,
      status: response.status,
    });

    return response.data as T;
  } catch (error) {
    logger.error('API request failed', 
      error instanceof Error ? error : new Error(String(error)), 
      {
        method,
        url,
        status: axios.isAxiosError(error) ? error.response?.status : 'unknown',
      }
    );
    throw error;
  }
};
```

### 4. Structured Metadata Logging

```typescript
const logger = createComponentLogger('CacheUtils');

export function setCache<T>(key: string, value: T, options: CacheOptions = {}) {
  logger.debug('Setting cache', {
    key,
    persist: options.persist,
    hasExpiry: !!options.expiryMs,
    valueType: typeof value
  });
  
  // ... cache logic
}
```

## Best Practices

### 1. Use Appropriate Log Levels

- **DEBUG**: Detailed information for debugging (hidden in production by default)
  ```typescript
  logger.debug('Cache hit', { key, size });
  ```

- **INFO**: Important events and state changes
  ```typescript
  logger.info('User authenticated', { userId });
  ```

- **WARN**: Potential issues or unexpected conditions
  ```typescript
  logger.warn('Cache miss, fetching from API', { key });
  ```

- **ERROR**: Errors and exceptions
  ```typescript
  logger.error('Failed to save data', error, { userId });
  ```

### 2. Include Context in Metadata

**Good**:
```typescript
logger.error('API request failed', error, {
  url,
  method,
  status: response?.status,
  userId: currentUser?.id
});
```

**Bad**:
```typescript
logger.error('API request failed', error);
```

### 3. Create Logger Once per Component/Module

**Good**:
```typescript
const logger = createComponentLogger('MyComponent');

export function MyComponent() {
  logger.info('Rendering');
  // ...
}
```

**Bad**:
```typescript
export function MyComponent() {
  const logger = createComponentLogger('MyComponent'); // Creates new logger every render
  logger.info('Rendering');
}
```

### 4. Use Method-Specific Loggers for Complex Classes

```typescript
class ComplexService {
  private logger = createComponentLogger('ComplexService');
  
  methodA() {
    const logger = createComponentLogger('ComplexService', 'methodA');
    logger.debug('Starting method A');
  }
  
  methodB() {
    const logger = createComponentLogger('ComplexService', 'methodB');
    logger.debug('Starting method B');
  }
}
```

### 5. Avoid Logging Sensitive Information

**Bad**:
```typescript
logger.info('User logged in', { password, token }); // ❌ Never log sensitive data
```

**Good**:
```typescript
logger.info('User logged in', { userId, timestamp }); // ✅ Log safe identifiers
```

## Environment Configuration

### Development
```bash
NODE_ENV=development
# Logs: INFO, WARN, ERROR (DEBUG hidden)
```

### Production
```bash
NODE_ENV=production
# Logs: WARN, ERROR only (INFO and DEBUG hidden)
```

### Production with Debug
```bash
NODE_ENV=production
ENABLE_DEBUG_LOGS=true
# Logs: All levels including DEBUG
```

## Migration Guide

### From console.log to Logger

**Before**:
```typescript
console.log('User logged in:', userId);
console.error('Login failed:', error);
console.warn('Session expiring soon');
```

**After**:
```typescript
import { createComponentLogger } from '@websites/infrastructure/logging';

const logger = createComponentLogger('AuthService');

logger.info('User logged in', { userId });
logger.error('Login failed', error);
logger.warn('Session expiring soon');
```

## Benefits

### 1. Environment-Aware
- Automatically adjusts verbosity based on NODE_ENV
- Production-safe by default (minimal logging)
- Debug mode available when needed

### 2. No Dependencies
- Zero external packages
- Works client and server side
- No bundle size increase

### 3. Organized Output
- Component names for easy filtering
- Consistent format across codebase
- Method-level granularity when needed

### 4. Type-Safe
- Full TypeScript support
- Compile-time checking
- IntelliSense support

### 5. Easy Migration
- Simple API matching console methods
- Drop-in replacement for console.log
- Gradual migration possible

## Related Documentation

- [Logging Module API Reference](../src/logging/README.md) - Complete API reference
- [Error Handling Guide](./error-handling.md) - Error handling patterns
- [Monitoring Guide](./monitoring.md) - Error tracking integration
