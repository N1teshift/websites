# Caching Strategy Documentation

**Last Verified**: October 26, 2025  
**Status**: ✅ Accurate

This document outlines the unified caching strategy used across the project, covering performance optimization, user preferences, and data persistence.

## Overview

Our project uses a multi-layered caching approach with three main categories:

1. **Performance Caching** - API responses, computed data, expensive operations
2. **User Preferences** - Settings, UI state, form data, user choices
3. **Data Persistence** - Large data storage, temporary saves, cross-session data

## 1. Performance Caching

### Centralized Cache Utility (`src/features/infrastructure/cache/cacheUtils.ts`)

**Purpose**: Optimize performance by caching expensive operations and API responses.

**Features**:
- In-memory cache for fast access
- Optional localStorage persistence for cross-tab support
- Configurable expiry times
- Namespaced keys for organization
- Automatic cleanup of expired entries

**Usage**:
```typescript
import { setCache, getCache, makeCacheKey } from '@/features/infrastructure/cache';

// Cache API response for 5 minutes
const cacheKey = makeCacheKey('calendar-events', 'en');
setCache(cacheKey, events, { 
  persist: true, 
  expiryMs: 5 * 60 * 1000 
});

// Retrieve cached data
const cached = getCache<Event[]>(cacheKey);
```

**Current Usage Examples**:
- Calendar events (`calendar-events:lang`)
- Test statistics (`test-stats:main`)
- Formatter results (`formatter-cache:formatterId:value`)
- Test generation results (`test-results:prompt-objectType`)

## 2. User Preferences

### Pattern: Direct localStorage with Error Handling

**Purpose**: Store user choices and UI state that should persist across sessions.

**Features**:
- Simple key-value storage
- Error handling for private browsing/SSR
- Default values when not set
- No expiry (persists until user changes)

**Usage Pattern**:
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

**Current Usage Examples**:
- Language preference (`i18nextLng`)
- Test stats fetch toggle (`testStats_enableFetch`)
- Saved maps list (`itt_saved_maps`)
- Map data (`itt_map_data_${mapId}`)

## 3. Data Persistence

### Pattern: Large Data Storage with Size Checks

**Purpose**: Store larger datasets that may exceed localStorage limits.

**Features**:
- Size validation before storage
- Graceful fallback when storage fails
- Metadata tracking (version, timestamp)
- Size-based storage decisions

**Usage Pattern**:
```typescript
const saveLargeData = (key: string, data: any) => {
  try {
    const serialized = JSON.stringify(data);
    const sizeInMB = new TextEncoder().encode(serialized).length / (1024 * 1024);
    
    if (sizeInMB > 4) {
      console.log(`Data too large (${sizeInMB.toFixed(2)}MB), skipping storage`);
      return false;
    }
    
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error('Storage failed:', error);
    return false;
  }
};
```

**Current Usage Examples**:
- Map data in ITT feature
- Processed map files
- Large JSON datasets

## Implementation Guidelines

### When to Use Each Pattern

**Use Performance Caching When**:
- Caching API responses
- Storing computed/expensive results
- Data that becomes stale over time
- Cross-tab synchronization needed

**Use User Preferences When**:
- Storing user choices (page size, theme, language)
- UI state (collapsed panels, selected options)
- Form data drafts
- Feature toggles

**Use Data Persistence When**:
- Storing large datasets
- File uploads/processed data
- Temporary saves
- Data that may exceed localStorage limits

### Key Principles

1. **Error Handling**: Always wrap localStorage operations in try-catch
2. **SSR Safety**: Check `typeof window !== 'undefined'` before accessing
3. **Default Values**: Provide sensible defaults for preferences
4. **Size Limits**: Validate data size before storage
5. **Namespacing**: Use consistent key patterns (`feature:subfeature`)
6. **Cleanup**: Implement cache expiry or manual cleanup

### Naming Conventions

**Performance Cache Keys**:
- Format: `namespace:identifier`
- Examples: `calendar-events:en`, `test-stats:main`

**User Preference Keys**:
- Format: `feature_setting` or `feature:setting`
- Examples: `testStats_enableFetch`, `i18nextLng`

**Data Persistence Keys**:
- Format: `feature_data_${id}`
- Examples: `itt_map_data_${mapId}`, `itt_saved_maps`

## Future Considerations

### Potential Improvements

1. **IndexedDB**: For larger datasets that exceed localStorage limits
2. **Service Workers**: For offline caching and background sync
3. **Compression**: For large data storage
4. **Synchronization**: Cross-device preference sync
5. **Analytics**: Cache hit/miss tracking

### Migration Strategy

When implementing new caching needs:

1. **Evaluate the use case** against the three patterns
2. **Reuse existing utilities** when possible
3. **Follow established naming conventions**
4. **Add to this documentation** for future reference
5. **Consider performance impact** and cleanup strategies

## Examples by Feature

### Calendar Feature
- **Performance**: API response caching with 5-minute expiry
- **Preferences**: Language-specific cache keys

### Math Tests Feature
- **Performance**: Test generation results with short expiry
- **Preferences**: Fetch toggle state
- **Data**: Test statistics with long expiry

### ITT Map Feature
- **Preferences**: Saved maps list
- **Data**: Large map files with size validation

### Generic Table Component
- **Preferences**: Page size persistence with localStorage validation
- **Performance**: Filtered/sorted results caching
- **Implementation**: Uses user preferences pattern with error handling and validation

## Implementation Examples

### GenericTable Page Size Persistence

**Pattern**: User Preferences with Validation

```typescript
// Load initial page size from localStorage if key is provided
const getInitialPageSize = (): number => {
    if (!options?.localStorageKey || typeof window === 'undefined') {
        return defaultPageSize;
    }
    
    try {
        const stored = localStorage.getItem(options.localStorageKey);
        if (stored) {
            const parsed = parseInt(stored, 10);
            // Validate the stored value is a reasonable page size
            if (!isNaN(parsed) && parsed > 0 && parsed <= 1000) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('Failed to load page size from localStorage:', e);
    }
    
    return defaultPageSize;
};

// Save page size to localStorage when it changes
const setPageSize = useCallback((newPageSize: number) => {
    setPageSizeState(newPageSize);
    
    if (options?.localStorageKey && typeof window !== 'undefined') {
        try {
            localStorage.setItem(options.localStorageKey, newPageSize.toString());
        } catch (e) {
            console.warn('Failed to save page size to localStorage:', e);
        }
    }
}, [options?.localStorageKey]);
```

**Key Features**:
- Validation of stored values (range checking)
- SSR safety with window checks
- Error handling for localStorage failures
- Graceful fallback to defaults
- Automatic persistence on change
