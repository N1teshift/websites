# Performance Guide

**Complete guide to performance optimization in @websites/infrastructure**

## Overview

This guide covers performance optimization strategies across multiple areas:
1. **Database**: Query optimization, indexing, pagination
2. **API**: Response caching, request debouncing, batching
3. **Frontend**: Bundle size, code splitting, component optimization
4. **Monitoring**: Web Vitals, performance tracking

## Caching Strategies

The infrastructure package uses a multi-layer caching approach optimized for serverless environments:

1. **HTTP Cache Headers** - Browser/CDN caching
2. **In-Memory Cache** - Fast access for computed data
3. **localStorage Cache** - Cross-tab persistence
4. **Request-Scoped Cache** - Prevents duplicate DB calls within a single request

### HTTP Cache Headers

All API routes use the `cacheControl` option in `createApiHandler`:

```typescript
import { createGetHandler } from '@websites/infrastructure/api';

export default createGetHandler(
  async (req) => {
    return data;
  },
  {
    cacheControl: {
      maxAge: 300, // Cache for 5 minutes
      public: true, // Allow public caching
    },
  }
);
```

### Cache Durations

Recommended cache durations:

| Data Type | Duration | Reason |
|-----------|----------|--------|
| Static data | 1 hour | Rarely changes |
| Semi-static data | 5-15 minutes | Changes occasionally |
| Dynamic data | 1-2 minutes | Changes frequently |
| User-specific | No cache | Always fresh |

See [Caching Guide](./caching.md) for complete caching documentation.

## Database Optimization

### Query Optimization

**Use indexes:**
- Create Firestore indexes for all query combinations
- Use composite indexes for multiple where clauses
- Monitor query performance in Firebase Console

**Limit results:**
```typescript
const query = db.collection('items')
  .where('status', '==', 'active')
  .limit(50) // Limit results
  .get();
```

**Pagination:**
```typescript
const query = db.collection('items')
  .orderBy('createdAt', 'desc')
  .startAfter(lastDoc)
  .limit(20)
  .get();
```

### Batch Operations

Use batch writes for multiple operations:

```typescript
const batch = db.batch();

items.forEach(item => {
  const ref = db.collection('items').doc();
  batch.set(ref, item);
});

await batch.commit();
```

### Request-Scoped Cache

Prevent duplicate database calls within a single request:

```typescript
const requestCache = new Map();

async function getCachedData(key: string) {
  if (requestCache.has(key)) {
    return requestCache.get(key);
  }
  
  const data = await fetchFromDB(key);
  requestCache.set(key, data);
  return data;
}
```

## API Optimization

### Response Caching

Cache API responses at multiple levels:

```typescript
// 1. HTTP cache headers
export default createGetHandler(
  async (req) => {
    return { data: getStaticData() };
  },
  {
    cacheControl: {
      maxAge: 3600,
      public: true
    }
  }
);

// 2. In-memory cache
import { setCache, getCache } from '@websites/infrastructure/cache';

async function getData() {
  const cached = getCache<Data>('api-data');
  if (cached) return cached;
  
  const data = await fetchData();
  setCache('api-data', data, { expiryMs: 5 * 60 * 1000 });
  return data;
}
```

### Request Debouncing

Debounce frequent API calls:

```typescript
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (query: string) => {
  const results = await searchAPI(query);
  setResults(results);
}, 300);
```

### Batch Requests

Combine multiple requests:

```typescript
async function batchFetch(ids: string[]) {
  const promises = ids.map(id => fetchItem(id));
  return Promise.all(promises);
}
```

## Frontend Optimization

### Code Splitting

Use dynamic imports for large components:

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Loading />,
  ssr: false // If component doesn't need SSR
});
```

### Component Optimization

**Memoization:**
```typescript
import { memo, useMemo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  const processed = useMemo(() => {
    return expensiveProcessing(data);
  }, [data]);
  
  return <div>{processed}</div>;
});
```

**Lazy Loading:**
```typescript
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}
```

### Image Optimization

Use Next.js Image component:

```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  width={500}
  height={300}
  alt="Description"
  loading="lazy"
/>
```

## Performance Monitoring

### Core Web Vitals

Track Core Web Vitals automatically:

- **LCP** (Largest Contentful Paint): Time to render main content
- **FID** (First Input Delay): Time until user can interact
- **CLS** (Cumulative Layout Shift): Visual stability

See [Monitoring Guide](./monitoring.md) for complete monitoring documentation.

### Custom Metrics

Track custom performance metrics:

```typescript
import { reportMetric, measureApiCall } from '@websites/infrastructure/monitoring';

// Report a metric
reportMetric('custom_operation', 150, 'ms');

// Measure API call
const result = await measureApiCall('fetchData', async () => {
  return await fetch('/api/data');
});
```

## Best Practices

1. **Cache aggressively** - Cache static and semi-static data
2. **Optimize queries** - Use indexes, limit results, paginate
3. **Code split** - Split large bundles into smaller chunks
4. **Monitor performance** - Track Core Web Vitals and custom metrics
5. **Lazy load** - Load components and data on demand
6. **Optimize images** - Use Next.js Image component
7. **Minimize re-renders** - Use memoization and React.memo

## Performance Checklist

Before deployment, ensure:
- [ ] API routes have appropriate cache headers
- [ ] Database queries use indexes
- [ ] Large components are code-split
- [ ] Images are optimized
- [ ] Core Web Vitals are monitored
- [ ] Bundle size is reasonable
- [ ] No unnecessary re-renders

## Related Documentation

- [Caching Guide](./caching.md) - Complete caching documentation
- [Monitoring Guide](./monitoring.md) - Performance monitoring
- [API Patterns Guide](./api-patterns.md) - API optimization patterns
