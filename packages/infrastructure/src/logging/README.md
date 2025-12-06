# Logging Module

**API Reference for `@websites/infrastructure/logging`**

## Overview

The logging module provides a console-based logging system with environment-aware log levels and component-specific logging capabilities.

## Installation

```typescript
import { createComponentLogger, logError, logAndThrow } from '@websites/infrastructure/logging';
```

## API Reference

### `createComponentLogger(componentName: string, methodName?: string)`

Creates a component-specific logger instance.

**Parameters:**
- `componentName` (string, required) - Name of the component/module
- `methodName` (string, optional) - Name of the method (for method-specific logging)

**Returns:** Logger instance with `debug`, `info`, `warn`, `error` methods

**Example:**
```typescript
const logger = createComponentLogger('UserService');
logger.info('User authenticated', { userId: '123' });
logger.error('Failed to fetch user', error, { userId: '123' });

// Method-specific logger
const methodLogger = createComponentLogger('UserService', 'fetchUser');
methodLogger.debug('Fetching user', { userId: '123' });
```

### `logError(error: Error, message: string, metadata?: Record<string, unknown>)`

Logs an error with context metadata.

**Parameters:**
- `error` (Error, required) - The error object
- `message` (string, required) - Error message
- `metadata` (object, optional) - Additional context (component, operation, etc.)

**Example:**
```typescript
try {
  // operation
} catch (error) {
  logError(error as Error, 'Operation failed', {
    component: 'MyComponent',
    operation: 'fetchData',
    userId: session?.id,
  });
}
```

### `logAndThrow(error: Error, message: string, metadata?: Record<string, unknown>)`

Logs an error and then throws it. Useful for service layer error propagation.

**Parameters:**
- `error` (Error, required) - The error object
- `message` (string, required) - Error message
- `metadata` (object, optional) - Additional context

**Example:**
```typescript
try {
  // operation
} catch (error) {
  logAndThrow(error as Error, 'Operation failed', {
    component: 'MyService',
    operation: 'myOperation',
  });
}
```

### `Logger` (Default Logger Instance)

Direct access to the default logger with log level methods.

**Methods:**
- `Logger.debug(message: string, meta?: Record<string, unknown>)`
- `Logger.info(message: string, meta?: Record<string, unknown>)`
- `Logger.warn(message: string, meta?: Record<string, unknown>)`
- `Logger.error(message: string, meta?: Record<string, unknown>)`

**Example:**
```typescript
import { Logger } from '@websites/infrastructure/logging';

Logger.info('Application started');
Logger.debug('Debug information', { data });
```

### `ErrorCategory` (Enum)

Error categories for classification:

```typescript
enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  UNKNOWN = 'UNKNOWN'
}
```

## Log Levels

The system uses four log levels in priority order:

1. **ERROR** (0) - Critical errors, always logged
2. **WARN** (1) - Warnings and potential issues
3. **INFO** (2) - General information, important events (default in development)
4. **DEBUG** (4) - Detailed debugging information

### Environment-Aware Behavior

- **Development**: INFO and above (INFO, WARN, ERROR)
- **Production**: WARN and above (WARN, ERROR)
- **Production + ENABLE_DEBUG_LOGS=true**: DEBUG and above (all logs)

## Usage Examples

### Component Logging

```typescript
import { createComponentLogger } from '@websites/infrastructure/logging';

const logger = createComponentLogger('MyComponent');

export function MyComponent() {
  useEffect(() => {
    logger.info('Component mounted');
    
    return () => {
      logger.debug('Component unmounted');
    };
  }, []);
  
  // ...
}
```

### Service Layer Logging

```typescript
import { createComponentLogger } from '@websites/infrastructure/logging';

class DataService {
  private logger = createComponentLogger('DataService');
  
  async fetchData(id: string) {
    const methodLogger = createComponentLogger('DataService', 'fetchData');
    
    methodLogger.debug('Fetching data', { id });
    
    try {
      const data = await fetch(`/api/data/${id}`);
      methodLogger.info('Data fetched successfully', { id });
      return data;
    } catch (error) {
      methodLogger.error('Failed to fetch data', error as Error, { id });
      throw error;
    }
  }
}
```

### Error Handling

```typescript
import { logError, logAndThrow } from '@websites/infrastructure/logging';

// Log and continue
try {
  // operation
} catch (error) {
  logError(error as Error, 'Operation failed', {
    component: 'MyService',
    operation: 'myOperation',
  });
  return null; // or fallback value
}

// Log and throw
try {
  // operation
} catch (error) {
  logAndThrow(error as Error, 'Operation failed', {
    component: 'MyService',
    operation: 'myOperation',
  });
}
```

## Best Practices

1. **Use component loggers** for organized, filterable output
2. **Include context** in metadata (component, operation, userId, etc.)
3. **Use appropriate log levels** (debug for development, info for important events)
4. **Never log sensitive data** (passwords, tokens, etc.)
5. **Create logger once per component** (not in render loops)

## Related Documentation

- [Error Handling Guide](../../docs/guides/error-handling.md) - Complete error handling patterns
- [Logging Guide](../../docs/guides/logging.md) - Comprehensive logging documentation
