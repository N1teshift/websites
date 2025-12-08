# Monitoring Guide

**Complete guide to monitoring, error tracking, and performance monitoring in @websites/infrastructure**

## Overview

The infrastructure package includes comprehensive monitoring infrastructure for:
- **Error Tracking**: Captures and reports errors to console
- **Performance Monitoring**: Tracks Core Web Vitals and custom metrics
- **Health Checks**: Endpoint for uptime monitoring services

## Error Tracking

Error tracking logs errors to the console with context information.

### Setup

Error tracking is **automatically initialized** when the monitoring module is used. No additional setup required.

### Usage

Errors are automatically captured when using the logging system:

```typescript
import { logError } from '@websites/infrastructure/logging';

try {
  // Your code
} catch (error) {
  logError(error as Error, 'Operation failed', {
    component: 'MyComponent',
    operation: 'fetchData',
    userId: 'user123',
  });
}
```

### Manual Error Capture

```typescript
import { captureError, captureMessage } from '@websites/infrastructure/monitoring';

// Capture an error
captureError(new Error('Something went wrong'), {
  component: 'MyComponent',
  operation: 'processData',
});

// Capture a message
captureMessage('Important event occurred', 'info', {
  userId: 'user123',
});
```

### User Context

Set user context for better error tracking:

```typescript
import { setUserContext } from '@websites/infrastructure/monitoring';

setUserContext('user123', 'user@example.com', 'username');
```

## Performance Monitoring

### Setup

Performance monitoring is **automatically initialized** when the monitoring module is used. It tracks:
- **Core Web Vitals**: LCP, FID, CLS
- **API Response Times**: Custom metrics
- **Firebase Performance**: If Firebase Performance Monitoring is enabled

### Core Web Vitals

Automatically tracked:
- **LCP** (Largest Contentful Paint): Time to render main content
- **FID** (First Input Delay): Time until user can interact
- **CLS** (Cumulative Layout Shift): Visual stability

Metrics are automatically sent to:
- Firebase Performance Monitoring (if enabled)
- Analytics endpoint (`/api/analytics/performance`)

### Custom Metrics

Track custom performance metrics:

```typescript
import { reportMetric, measureApiCall } from '@websites/infrastructure/monitoring';

// Report a metric
reportMetric('custom_operation', 150, 'ms');

// Measure API call
const result = await measureApiCall('fetchUserData', async () => {
  return await fetch('/api/users');
});
```

### Performance Traces

Create custom performance traces:

```typescript
import { createTrace } from '@websites/infrastructure/monitoring';

const trace = createTrace('data_processing');
trace.start();

// Your code here

trace.setMetric('items_processed', 100);
trace.stop();
```

## Health Check Endpoint

### Endpoint

**GET** `/api/health`

Returns application health status.

### Response

```json
{
  "status": "ok",
  "timestamp": "2025-01-28T12:00:00.000Z",
  "checks": {
    "database": "ok"
  }
}
```

**Status Codes:**
- `200`: Application is healthy
- `503`: Application has issues (database connection failed)

### Usage

Use with uptime monitoring services:
- **UptimeRobot**: Monitor `https://your-domain.com/api/health`
- **Pingdom**: Set up HTTP check for `/api/health`
- **Custom**: Poll endpoint every 1-5 minutes

### Checks

Currently checks:
- ✅ **Database**: Firebase Firestore connection

Future checks can include:
- Cache connectivity
- External API availability
- Disk space
- Memory usage

## Firebase Performance Monitoring

If Firebase Performance Monitoring is enabled, metrics are automatically sent to Firebase.

### Enable Firebase Performance

1. **Install Firebase Performance** (already in dependencies)
2. **Enable in Firebase Console**: Firebase Console → Performance
3. **Metrics are automatically tracked** via the monitoring system

## Monitoring Dashboards

### Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to Performance section
3. View Core Web Vitals and custom traces

## Alerts

### Recommended Alerts

1. **Error Rate**: Alert if error rate > 1% of requests
2. **Response Time**: Alert if p95 response time > 2s
3. **Health Check**: Alert if health check fails
4. **Core Web Vitals**: Alert if LCP > 2.5s, FID > 100ms, CLS > 0.1

### Setting Up Alerts

- **Firebase**: Use Firebase Alerts (if available)
- **Uptime Monitoring**: Configure in monitoring service (UptimeRobot, Pingdom, etc.)

## Troubleshooting

### Performance Metrics Not Showing

1. Check Firebase Performance is enabled
2. Verify Firebase Performance SDK is initialized
3. Check browser console for errors
4. Verify `/api/analytics/performance` endpoint exists (if using custom analytics)

### Health Check Failing

1. Check Firebase connection
2. Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is set
3. Check Firestore security rules allow reads
4. Review server logs for errors

## Best Practices

1. **Always include context** when logging errors:
   ```typescript
   logError(error, 'Operation failed', {
     component: 'ComponentName',
     operation: 'operationName',
     userId: session?.user?.id,
   });
   ```

2. **Use performance traces** for expensive operations:
   ```typescript
   const trace = createTrace('expensive_operation');
   trace.start();
   // ... operation
   trace.stop();
   ```

3. **Monitor Core Web Vitals** regularly to ensure good UX

4. **Set up alerts** for critical metrics

5. **Review error reports** weekly to identify patterns

## Related Documentation

- [Monitoring Module API Reference](../src/monitoring/README.md) - Complete API reference
- [Error Handling Guide](./error-handling.md) - Error handling patterns
- [Getting Started Guide](./getting-started.md) - Environment setup
