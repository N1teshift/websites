# Caching Guide

**Complete guide to caching strategies in @websites/infrastructure**

## Overview

The infrastructure package provides a multi-layered caching approach for performance optimization, user preferences, and data persistence.

## Caching Layers

### 1. Performance Caching

In-memory cache with optional localStorage persistence for expensive operations and API responses.

**Features:**
- In-memory cache for fast access
- Optional localStorage persistence for cross-tab support
- Configurable expiry times
- Namespaced keys for organization
- Automatic cleanup of expired entries

**Usage:**
```typescript
import { setCache, getCache, makeCacheKey } from '@websites/infrastructure/cache';

// Cache API response for 5 minutes
const cacheKey = makeCacheKey('calendar-events', 'en');
setCache(cacheKey, events, { 
  persist: true, 
  expiryMs: 5 * 60 * 1000 
});

// Retrieve cached data
const cached = getCache<Event[]>(cacheKey);
```

### 2. User Preferences

Direct localStorage for user choices and UI state.

**Pattern:**
```typescript
// Store preference
const savePreference = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Failed to save preference', e);
    }
  }
};

// Load preference with default
const loadPreference = (key: string, defaultValue: any) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }
  return defaultValue;
};
```

### 3. HTTP Cache Headers

Browser/CDN caching via HTTP cache headers in API routes.

**Usage:**
```typescript
import { createGetHandler } from '@websites/infrastructure/api';

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

## Cache Utilities

### `setCache<T>(key: string, value: T, options?: CacheOptions): void`

Sets a value in the cache.

**Parameters:**
- `key` (string, required) - Cache key
- `value` (T, required) - Value to cache
- `options` (CacheOptions, optional) - Cache options

**Options:**
- `persist` (boolean) - Persist to localStorage
- `expiryMs` (number) - Expiration time in milliseconds

### `getCache<T>(key: string): T | undefined`

Gets a value from the cache.

**Parameters:**
- `key` (string, required) - Cache key

**Returns:** Cached value or undefined

### `makeCacheKey(...parts: string[]): string`

Creates a namespaced cache key.

**Example:**
```typescript
const key = makeCacheKey('calendar', 'events', 'en');
// Returns: 'calendar:events:en'
```

## Caching Patterns

### API Response Caching

```typescript
import { setCache, getCache, makeCacheKey } from '@websites/infrastructure/cache';

async function fetchEvents(language: string) {
  const cacheKey = makeCacheKey('calendar-events', language);
  
  // Check cache first
  const cached = getCache<Event[]>(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fetch from API
  const events = await api.getEvents(language);
  
  // Cache for 5 minutes
  setCache(cacheKey, events, {
    persist: true,
    expiryMs: 5 * 60 * 1000
  });
  
  return events;
}
```

### Computed Data Caching

```typescript
import { setCache, getCache, makeCacheKey } from '@websites/infrastructure/cache';

function computeExpensiveData(input: string) {
  const cacheKey = makeCacheKey('computed', input);
  
  const cached = getCache<ComputedData>(cacheKey);
  if (cached) {
    return cached;
  }
  
  const result = expensiveComputation(input);
  
  setCache(cacheKey, result, {
    expiryMs: 10 * 60 * 1000  // 10 minutes
  });
  
  return result;
}
```

### HTTP Cache Headers

```typescript
import { createGetHandler } from '@websites/infrastructure/api';

// Static data - cache for 1 hour
export default createGetHandler(
  async (req, res) => {
    return { data: getStaticData() };
  },
  {
    cacheControl: {
      maxAge: 3600,
      public: true
    }
  }
);

// Dynamic data - no cache
export default createGetHandler(
  async (req, res) => {
    return { data: getDynamicData() };
  },
  {
    cacheControl: false
  }
);
```

## Cache Key Naming

Use namespaced keys for organization:

```typescript
// Good - namespaced
makeCacheKey('calendar', 'events', 'en')
makeCacheKey('user', 'preferences', userId)
makeCacheKey('test', 'stats', 'main')

// Bad - flat keys
'calendar-events-en'
'user-preferences-123'
```

## Best Practices

### 1. Use Appropriate Cache Durations

- **Static data**: 1 hour or longer
- **Semi-static data**: 5-15 minutes
- **Dynamic data**: No cache or very short (1-2 minutes)

### 2. Handle Cache Misses Gracefully

```typescript
const cached = getCache<Data>(key);
if (cached) {
  return cached;
}

// Fallback to API/database
const data = await fetchData();
setCache(key, data, options);
return data;
```

### 3. Clear Cache When Needed

```typescript
import { clearCache } from '@websites/infrastructure/cache';

// Clear specific key
clearCache('calendar-events:en');

// Clear all cache
clearCache();
```

### 4. Use localStorage for User Preferences

For user preferences that should persist across sessions:

```typescript
// Store user preference
localStorage.setItem('theme', 'dark');

// Load with default
const theme = localStorage.getItem('theme') || 'light';
```

### 5. Handle localStorage Errors

Always wrap localStorage operations in try-catch:

```typescript
try {
  localStorage.setItem(key, value);
} catch (e) {
  // Handle quota exceeded or private browsing
  console.warn('Failed to save to localStorage', e);
}
```

## Cache Invalidation

### Manual Invalidation

```typescript
import { clearCache } from '@websites/infrastructure/cache';

// Clear specific cache
clearCache('calendar-events:en');

// Clear all cache
clearCache();
```

### Automatic Expiration

Cache entries automatically expire based on `expiryMs`:

```typescript
setCache(key, data, {
  expiryMs: 5 * 60 * 1000  // Expires after 5 minutes
});
```

## Related Documentation

- [Cache Module API Reference](../src/cache/README.md) - Complete API reference
- [API Patterns Guide](./api-patterns.md) - HTTP cache headers in API routes
