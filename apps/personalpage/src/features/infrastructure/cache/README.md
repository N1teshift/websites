# Cache Module

- **Type**: Infrastructure
- **Purpose**: Provide reusable caching helpers for any feature.
- **Status**: Fully functional; needs contract references in feature docs when adopted.

A centralized caching utility that supports both in-memory and persistent (localStorage) caching with expiry and namespacing.

## Features

- **In-memory caching** - Fast access using Map-based storage
- **Persistent caching** - localStorage integration for cross-session persistence
- **Automatic expiry** - Configurable TTL with automatic cleanup
- **Namespacing** - Organized cache keys with namespace support
- **TypeScript support** - Full type safety with generics
- **Error handling** - Graceful fallbacks for storage failures

## Usage

### Basic Caching

```typescript
import { setCache, getCache } from '@/features/infrastructure/cache';

// Simple in-memory cache
setCache('user-data', userData);
const cached = getCache('user-data');

// Persistent cache with expiry (30 minutes)
setCache('calendar-events', events, { 
    persist: true, 
    expiryMs: 30 * 60 * 1000 
});
```

### Namespaced Caching

```typescript
import { makeCacheKey, setCache, getCache } from '@/features/infrastructure/cache';

const cacheKey = makeCacheKey('calendar-events', 'en');
setCache(cacheKey, events, { persist: true });
const cached = getCache(cacheKey);
```

### Cache Management

```typescript
import { hasCache, clearCache, clearNamespaceCache } from '@/features/infrastructure/cache';

// Check if cache exists
if (hasCache('user-data')) {
    // Cache is valid and not expired
}

// Clear specific cache
clearCache('user-data');

// Clear all cache entries for a namespace
clearNamespaceCache('calendar-events');
```

## API Reference

### `setCache<T>(key: string, value: T, options?: CacheOptions)`

Sets a value in the cache.

**Parameters:**
- `key` - Cache key
- `value` - Value to cache
- `options` - Optional configuration
  - `persist?: boolean` - Use localStorage (default: false)
  - `expiryMs?: number` - Expiry time in milliseconds

### `getCache<T>(key: string): T | undefined`

Retrieves a value from cache. Checks in-memory first, then localStorage.

**Returns:** Cached value if found and not expired, otherwise undefined

### `hasCache(key: string): boolean`

Checks if a valid (non-expired) cache entry exists.

### `clearCache(key?: string)`

Clears cache entries. If no key provided, clears entire cache.

### `makeCacheKey(namespace: string, id: string): string`

Creates a namespaced cache key.

### `clearNamespaceCache(namespace: string)`

Clears all cache entries for a specific namespace.

## Types

### `CacheOptions`

```typescript
interface CacheOptions {
    persist?: boolean;  // Use localStorage
    expiryMs?: number;  // Expiry in milliseconds
}
```

### `CacheEntry<T>`

```typescript
interface CacheEntry<T> {
    value: T;
    expiry?: number;  // Timestamp in ms
}
```

## Dependencies

- `@features/infrastructure/logging` - For error logging and debugging

## Examples

### Calendar Events Caching

```typescript
import { setCache, getCache, makeCacheKey } from '@/features/infrastructure/cache';

const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const lang = window.localStorage.getItem('i18nextLng') || 'en';
const cacheKey = makeCacheKey('calendar-events', lang);

// Try to get from cache first
const cached = getCache<GraphEvent[]>(cacheKey);
if (cached) {
    return cached;
}

// Fetch from API and cache
const events = await fetchEvents();
setCache(cacheKey, events, { 
    persist: true, 
    expiryMs: CACHE_EXPIRY_MS 
});
```

### Test Results Caching

```typescript
import { setCache, getCache, makeCacheKey } from '@/features/infrastructure/cache';

const TEST_RESULTS_CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const cacheKey = makeCacheKey('test-results', `${test.prompt}-${test.objectType}`);

const cachedResponse = getCache<GeneratedMathObjects>(cacheKey);
if (cachedResponse) {
    return cachedResponse;
}

const response = await generateMathObjects(test);
setCache(cacheKey, response, { 
    expiryMs: TEST_RESULTS_CACHE_EXPIRY_MS 
});
```
