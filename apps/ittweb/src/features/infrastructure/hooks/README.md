# Hooks

**Status**: ✅ **MIGRATED** - Now uses `@websites/infrastructure/hooks`

All hooks have been migrated to the shared package. This directory now only re-exports from the shared package.

## Usage

Import hooks from the shared package:

```typescript
import { 
  useDataFetch,
  createUrlDataFetchHook,
  useFallbackTranslation,
  useModalAccessibility
} from '@websites/infrastructure/hooks';
```

Or use the re-exported index:

```typescript
import { useDataFetch, useFallbackTranslation } from '@/features/infrastructure/hooks';
```

## Available Hooks (from shared package)

- **`useDataFetch`** - Data fetching hook with SWR integration
- **`createUrlDataFetchHook`** - Factory for creating URL-based data fetch hooks
- **`useFallbackTranslation`** - Translation fallback handling
- **`useModalAccessibility`** - Modal accessibility management

See `@websites/infrastructure/hooks` for complete documentation.
