# Internationalization (i18n) Module

**API Reference for `@websites/infrastructure/i18n`**

## Overview

The i18n module provides internationalization utilities for Next.js applications with namespace support and fallback mechanisms.

## Installation

```typescript
import { useFallbackTranslation, getStaticPropsWithTranslations } from '@websites/infrastructure/i18n';
```

## API Reference

### `useFallbackTranslation(namespaces?: string[])`

Hook with fallback namespace support.

**Parameters:**
- `namespaces` (string[], optional) - Translation namespaces. If not provided, uses context.

**Returns:** `{ t: (key: string) => string }`

**Example:**
```typescript
import { useFallbackTranslation } from '@websites/infrastructure/i18n';

function MyComponent() {
  const { t } = useFallbackTranslation();
  return <h1>{t('welcome')}</h1>;
}
```

### `TranslationNamespaceContext`

React context for translation namespaces.

**Usage:**
```typescript
import { TranslationNamespaceContext } from '@websites/infrastructure/i18n';

<TranslationNamespaceContext.Provider value={namespaces}>
  {children}
</TranslationNamespaceContext.Provider>
```

### `useTranslationNamespace()`

Hook to access translation namespace context.

**Returns:** Current namespaces from context

**Example:**
```typescript
import { useTranslationNamespace } from '@websites/infrastructure/i18n';

function MyComponent() {
  const namespaces = useTranslationNamespace();
  console.log('Current namespaces:', namespaces);
}
```

### `getStaticPropsWithTranslations(namespaces: string[])`

Helper for Next.js getStaticProps.

**Parameters:**
- `namespaces` (string[], required) - Translation namespaces to load

**Returns:** getStaticProps function

**Example:**
```typescript
import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n';

const pageNamespaces = ['common', 'links'];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);
```

### `nextI18NextConfig`

Base next-i18next configuration.

**Usage:**
```typescript
import { nextI18NextConfig } from '@websites/infrastructure/i18n';

// Use in your next-i18next.config.js
export default nextI18NextConfig;
```

## Usage Examples

### Basic Translation

```typescript
import { useFallbackTranslation } from '@websites/infrastructure/i18n';

function MyComponent() {
  const { t } = useFallbackTranslation();
  return <h1>{t('page_title')}</h1>;
}
```

### With Namespaces

```typescript
import { useFallbackTranslation } from '@websites/infrastructure/i18n';

function MyComponent() {
  const { t } = useFallbackTranslation(['common', 'feature']);
  return (
    <div>
      <h1>{t('common:welcome')}</h1>
      <p>{t('feature:description')}</p>
    </div>
  );
}
```

### Page Setup

```typescript
import { getStaticPropsWithTranslations } from '@websites/infrastructure/i18n';
import { TranslationNamespaceContext } from '@websites/infrastructure/i18n';

const pageNamespaces = ['calendar', 'links', 'common'];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function MyPage() {
  return (
    <TranslationNamespaceContext.Provider value={pageNamespaces}>
      <MyComponent />
    </TranslationNamespaceContext.Provider>
  );
}
```

### Child Components (Inherit Context)

```typescript
import { useFallbackTranslation } from '@websites/infrastructure/i18n';

function ChildComponent() {
  // Inherits namespaces from context
  const { t } = useFallbackTranslation();
  return <p>{t('message')}</p>;
}
```

## Namespace Strategy

Each page defines namespaces in order: `[feature-specific, "links", "common"]`

**Examples:**
- Feature pages: `["calendar", "links", "common"]`
- Simple pages: `["links", "common"]`

## Best Practices

1. **Define namespaces at page level** - Set `pageNamespaces` at the top of each page
2. **Pass through component hierarchy** - Use `TranslationNamespaceContext` or pass as props
3. **Use context when possible** - Child components inherit context automatically
4. **Use explicit namespaces when needed** - For page-level translations before Layout

## Related Documentation

- [i18n Guide](../../docs/guides/i18n.md) - Complete i18n guide
- [Getting Started Guide](../../docs/guides/getting-started.md) - Initial setup
