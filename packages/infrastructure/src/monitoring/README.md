# Monitoring Module

**API Reference for `@websites/infrastructure/monitoring`**

## Overview

The monitoring module provides error tracking and performance monitoring capabilities.

## Installation

```typescript
import { captureError, captureMessage, setUserContext } from '@websites/infrastructure/monitoring';
```

## API Reference

### Error Tracking

#### `initializeErrorTracking(options?: ErrorTrackingOptions): void`

Initializes error tracking (e.g., Sentry).

**Parameters:**
- `options` (ErrorTrackingOptions, optional) - Configuration options

**Example:**
```typescript
import { initializeErrorTracking } from '@websites/infrastructure/monitoring';

initializeErrorTracking({
  dsn: process.env.SENTRY_DSN
});
```

#### `captureError(error: Error, context?: ErrorContext): void`

Captures an error for tracking.

**Parameters:**
- `error` (Error, required) - Error object
- `context` (ErrorContext, optional) - Additional context

**Example:**
```typescript
import { captureError } from '@websites/infrastructure/monitoring';

try {
  // operation
} catch (error) {
  captureError(error as Error, {
    component: 'MyComponent',
    operation: 'fetchData',
    userId: 'user123'
  });
}
```

#### `captureMessage(message: string, level: 'info' | 'warning' | 'error', context?: ErrorContext): void`

Captures a message for tracking.

**Parameters:**
- `message` (string, required) - Message to capture
- `level` (string, required) - Message level
- `context` (ErrorContext, optional) - Additional context

**Example:**
```typescript
import { captureMessage } from '@websites/infrastructure/monitoring';

captureMessage('Important event occurred', 'info', {
  userId: 'user123',
  event: 'purchase_completed'
});
```

#### `setUserContext(userId: string, email?: string, username?: string): void`

Sets user context for error tracking.

**Parameters:**
- `userId` (string, required) - User ID
- `email` (string, optional) - User email
- `username` (string, optional) - Username

**Example:**
```typescript
import { setUserContext } from '@websites/infrastructure/monitoring';

setUserContext('user123', 'user@example.com', 'username');
```

### Performance Monitoring

#### `initializePerformanceMonitoring(options?: PerformanceOptions): void`

Initializes performance monitoring.

**Parameters:**
- `options` (PerformanceOptions, optional) - Configuration options

#### `reportMetric(name: string, value: number, unit?: string): void`

Reports a performance metric.

**Parameters:**
- `name` (string, required) - Metric name
- `value` (number, required) - Metric value
- `unit` (string, optional) - Metric unit

**Example:**
```typescript
import { reportMetric } from '@websites/infrastructure/monitoring';

reportMetric('api_response_time', 150, 'ms');
```

#### `measureApiCall<T>(name: string, fn: () => Promise<T>): Promise<T>`

Measures API call performance.

**Parameters:**
- `name` (string, required) - API call name
- `fn` (function, required) - Async function to measure

**Returns:** Result of the function

**Example:**
```typescript
import { measureApiCall } from '@websites/infrastructure/monitoring';

const data = await measureApiCall('fetchUserData', async () => {
  return await fetchUserData(userId);
});
```

## Usage Examples

### Error Tracking

```typescript
import { captureError } from '@websites/infrastructure/monitoring';

try {
  await riskyOperation();
} catch (error) {
  captureError(error as Error, {
    component: 'MyComponent',
    operation: 'riskyOperation',
    userId: currentUser?.id
  });
}
```

### User Context

```typescript
import { setUserContext } from '@websites/infrastructure/monitoring';

// Set user context when user logs in
useEffect(() => {
  if (user) {
    setUserContext(user.id, user.email, user.name);
  }
}, [user]);
```

### Performance Monitoring

```typescript
import { measureApiCall, reportMetric } from '@websites/infrastructure/monitoring';

// Measure API call
const data = await measureApiCall('fetchData', async () => {
  return await api.getData();
});

// Report custom metric
reportMetric('data_processing_time', processingTime, 'ms');
```

## Environment Variables

Optional:
- `SENTRY_DSN` - Sentry DSN for error tracking
- `ENABLE_PERFORMANCE_MONITORING` - Enable performance monitoring

## Best Practices

1. **Capture errors with context** - Always include component and operation
2. **Set user context** - Set user context when user logs in
3. **Measure important operations** - Use `measureApiCall` for API operations
4. **Report custom metrics** - Use `reportMetric` for business metrics

## Related Documentation

- [Monitoring Guide](../../docs/guides/monitoring.md) - Complete monitoring guide
- [Error Handling Guide](../../docs/guides/error-handling.md) - Error handling patterns
