# @websites/infrastructure

Shared infrastructure package for all websites in the monorepo.

## Contents

### i18n (Internationalization)

Provides internationalization utilities for Next.js applications.

**Exports:**
- `useFallbackTranslation` - Hook with fallback namespace support
- `TranslationNamespaceContext` - React context for translation namespaces
- `useTranslationNamespace` - Hook to access translation namespace context
- `getStaticPropsWithTranslations` - Helper for Next.js getStaticProps
- `nextI18NextConfig` - Base next-i18next configuration

**Usage:**
```typescript
import { useFallbackTranslation } from '@websites/infrastructure/i18n';
import { TranslationNamespaceContext } from '@websites/infrastructure/i18n';

// In your component
const { t } = useFallbackTranslation();
```

### logging

Provides logging utilities with component-level logging support.

**Exports:**
- `Logger` - Default logger instance
- `createComponentLogger` - Factory for component-specific loggers
- `logError` - Error logging utility
- `logAndThrow` - Error logging and throwing utility
- `ErrorCategory` - Error category enum
- `ApiErrorType` - API error type enum
- `createApiError` - API error factory
- `isAxiosError` - Type guard for axios errors
- `isError` - Type guard for Error objects

**Usage:**
```typescript
import { createComponentLogger } from '@websites/infrastructure/logging';

const logger = createComponentLogger('MyComponent');
logger.info('Component initialized');
logger.error('Something went wrong', error);
```

## Installation

This package is part of the monorepo and is automatically available to all apps via workspace protocol.

In your app's `package.json`:
```json
{
  "dependencies": {
    "@websites/infrastructure": "workspace:*"
  }
}
```

## TypeScript

The package exports TypeScript types. Make sure your `tsconfig.json` includes the workspace paths:

```json
{
  "compilerOptions": {
    "paths": {
      "@websites/infrastructure": ["../../packages/infrastructure/src"],
      "@websites/infrastructure/*": ["../../packages/infrastructure/src/*"]
    }
  }
}
```

