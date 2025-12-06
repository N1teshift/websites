# Cache Module

**API Reference for `@websites/infrastructure/cache`**

## Overview

The cache module provides in-memory caching with optional localStorage persistence for performance optimization.

## Installation

```typescript
import { setCache, getCache, makeCacheKey } from '@websites/infrastructure/cache';
```

## API Reference

### `setCache<T>(key: string, value: T, options?: CacheOptions): void`

Sets a value in the cache.

**Parameters:**
- `key` (string, required) - Cache key
- `value` (T, required) - Value to cache
- `options` (CacheOptions, optional) - Cache options

**Options:**
- `persist` (boolean) - Persist to localStorage
- `expiryMs` (number) - Expiration time in milliseconds

**Example:**
```typescript
import { setCache } from '@websites/infrastructure/cache';

setCache('my-key', data, {
  persist: true,
  expiryMs: 5 * 60 * 1000  // 5 minutes
});
```

### `getCache<T>(key: string): T | undefined`

Gets a value from the cache.

**Parameters:**
- `key` (string, required) - Cache key

**Returns:** Cached value or undefined

**Example:**
```typescript
import { getCache } from '@websites/infrastructure/cache';

const cached = getCache<MyData>('my-key');
if (cached) {
  return cached;
}
```

### `makeCacheKey(...parts: string[]): string`

Creates a namespaced cache key.

**Parameters:**
- `parts` (string[], required) - Key parts

**Returns:** Namespaced cache key

**Example:**
```typescript
import { makeCacheKey } from '@websites/infrastructure/cache';

const key = makeCacheKey('calendar', 'events', 'en');
// Returns: 'calendar:events:en'
```

### `clearCache(key?: string): void`

Clears cache entry or all cache.

**Parameters:**
- `key` (string, optional) - Specific key to clear. If not provided, clears all.

**Example:**
```typescript
import { clearCache } from '@websites/infrastructure/cache';

// Clear specific key
clearCache('calendar:events:en');

// Clear all cache
clearCache();
```

## Usage Examples

### Basic Caching

```typescript
import { setCache, getCache, makeCacheKey } from '@websites/infrastructure/cache';

async function fetchData(id: string) {
  const key = makeCacheKey('data', id);
  
  // Check cache
  const cached = getCache<Data>(key);
  if (cached) {
    return cached;
  }
  
  // Fetch and cache
  const data = await api.getData(id);
  setCache(key, data, {
    expiryMs: 5 * 60 * 1000  // 5 minutes
  });
  
  return data;
}
```

### Persistent Caching

```typescript
import { setCache, getCache, makeCacheKey } from '@websites/infrastructure/cache';

const key = makeCacheKey('user', 'preferences', userId);

// Cache with persistence
setCache(key, preferences, {
  persist: true,  // Persist to localStorage
  expiryMs: 24 * 60 * 60 * 1000  // 24 hours
});

// Retrieve (works across page reloads)
const cached = getCache<Preferences>(key);
```

### Cache Key Naming

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

1. **Use namespaced keys** - Use `makeCacheKey()` for organized keys
2. **Set appropriate expiry** - Use `expiryMs` based on data freshness needs
3. **Use persistence for user data** - Set `persist: true` for user preferences
4. **Handle cache misses** - Always have a fallback when cache is empty
5. **Clear cache when needed** - Use `clearCache()` for invalidation

## Related Documentation

- [Caching Guide](../../docs/guides/caching.md) - Complete caching guide
- [API Patterns Guide](../../docs/guides/api-patterns.md) - HTTP cache headers
