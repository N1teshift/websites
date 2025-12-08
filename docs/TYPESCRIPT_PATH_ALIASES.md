# TypeScript Path Aliases Convention

This document defines the standard path alias conventions for all apps in the monorepo.

## Standard Aliases

All apps should use the following base aliases:

### Core Aliases (Required)

- `@/*` - Root source directory (`src/*`)
  - Example: `import { Component } from '@/components/Component'`

### Feature-Based Aliases (App-Specific)

Apps may define additional aliases for their feature modules, but should follow these patterns:

- `@/features/*` - Feature modules
- `@/lib/*` - Shared libraries/utilities
- `@/utils/*` - Utility functions
- `@/components/*` - React components
- `@/types/*` - TypeScript type definitions
- `@/styles/*` - Style files
- `@/config/*` - Configuration files

### Monorepo Package Aliases

All apps should include these aliases for workspace packages:

```json
{
  "@websites/ui": ["../../packages/ui/src"],
  "@websites/ui/*": ["../../packages/ui/src/*"],
  "@websites/infrastructure": ["../../packages/infrastructure/src"],
  "@websites/infrastructure/*": ["../../packages/infrastructure/src/*"],
  "@websites/config-tailwind": ["../../packages/config-tailwind/src"],
  "@websites/config-tailwind/*": ["../../packages/config-tailwind/src/*"]
}
```

## Migration Guide

When migrating an app to use standard aliases:

1. Update `tsconfig.json` paths
2. Update all imports in the app
3. Run type-check to verify: `pnpm type-check`
4. Test the build: `pnpm build`

## Examples

### Good ✅

```typescript
// Using standard @ alias
import { Button } from "@/components/Button";
import { formatDate } from "@/utils/date";
import { User } from "@/types/user";

// Using workspace packages
import { Button } from "@websites/ui";
import { logger } from "@websites/infrastructure/logging";
```

### Avoid ❌

```typescript
// App-specific aliases that don't follow convention
import { Button } from "@components/Button"; // Missing @ prefix
import { formatDate } from "@lib/utils/date"; // Too nested
```

## App-Specific Aliases

If an app needs domain-specific aliases (e.g., `@math/*`, `@ai/*`), document them in the app's README and keep them consistent within that app.
