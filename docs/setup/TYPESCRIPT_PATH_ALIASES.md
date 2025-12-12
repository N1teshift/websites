# TypeScript Path Aliases Convention

This document defines the standard path alias conventions for all apps in the monorepo.

## Standard Aliases

All apps should use the following base aliases:

### Core Aliases (Required)

- `@/*` - Root source directory (`src/*`)
  - Example: `import { Component } from '@/components/Component'`
  - **All apps must have this alias**

### Standard Feature Aliases

Apps should use these standard aliases when applicable:

- `@/features/*` - Feature modules (preferred over app-specific feature aliases)
- `@/lib/*` - Shared libraries/utilities
- `@/utils/*` - Utility functions
- `@/components/*` - React components
- `@/types/*` - TypeScript type definitions
- `@/styles/*` - Style files
- `@/config/*` - Configuration files

### Monorepo Package Aliases (Required)

All apps must include these aliases for workspace packages:

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

## Current App Patterns

### ✅ MafaldaGarcia (Standard)

- Uses: `@/*`, `@/styles/*`
- **Status**: Already follows standard pattern

### ✅ templatepage (Standard)

- Uses: `@/*`, `@/components/*`, `@/lib/*`, `@/utils/*`, `@/styles/*`
- **Status**: Already follows standard pattern

### ⚠️ ittweb (Needs Migration)

- Current: `@/*`, `@/shared/*`, `@/features/*`, `@/types/*`, `@/utils/*`, `@/config/*`
- **Action**: Migrate `@/shared/*` to `@/features/shared/*` or `@/lib/*`
- **Action**: Ensure `@/features/*` follows standard pattern

### ⚠️ personalpage (Needs Migration)

- Current: `@/*`, `@lib/*`, `@utils/*`, `@math/*`, `@ai/*`, `@tests/*`, `@styles/*`, `@calendar/*`, `@voice/*`, `@projects/*`, `@progressReport/*`
- **Action**: Migrate `@lib/*` → `@/lib/*` (add `/`)
- **Action**: Migrate `@utils/*` → `@/utils/*` (add `/`)
- **Action**: Consider migrating domain-specific aliases (`@math/*`, `@ai/*`) to `@/features/math/*`, `@/features/ai/*`
- **Action**: Document domain-specific aliases in app README if kept

## Migration Guide

### Step 1: Update tsconfig.json

Update the `paths` section in your app's `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/features/*": ["./src/features/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/components/*": ["./src/components/*"],
      "@/types/*": ["./src/types/*"],
      "@/styles/*": ["./src/styles/*"],
      "@/config/*": ["./src/config/*"],
      "@websites/ui": ["../../packages/ui/src"],
      "@websites/ui/*": ["../../packages/ui/src/*"],
      "@websites/infrastructure": ["../../packages/infrastructure/src"],
      "@websites/infrastructure/*": ["../../packages/infrastructure/src/*"],
      "@websites/config-tailwind": ["../../packages/config-tailwind/src"],
      "@websites/config-tailwind/*": ["../../packages/config-tailwind/src/*"]
    }
  }
}
```

### Step 2: Update Imports

Use a find-and-replace tool or script to update imports:

**Patterns to replace:**

- `@lib/` → `@/lib/`
- `@utils/` → `@/utils/`
- `@components/` → `@/components/`
- `@types/` → `@/types/`
- `@styles/` → `@/styles/`
- `@config/` → `@/config/`

**For domain-specific aliases:**

- `@math/` → `@/features/math/` (or keep if well-documented)
- `@ai/` → `@/features/ai/` (or keep if well-documented)

### Step 3: Verify

1. Run type-check: `pnpm --filter <app-name> type-check`
2. Run build: `pnpm --filter <app-name> build`
3. Test the app: `pnpm --filter <app-name> dev`

### Step 4: Update Documentation

Update the app's README to document any app-specific aliases that are kept.

## Migration Script

A migration script can be created to automate import updates. Example:

```bash
# Find all files with old import patterns
find apps/<app-name>/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "@lib/" {} \;

# Replace patterns (use with caution, test first)
find apps/<app-name>/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/@lib\//@\/lib\//g' {} \;
```

## Examples

### Good ✅

```typescript
// Using standard @ alias with slash
import { Button } from "@/components/Button";
import { formatDate } from "@/utils/date";
import { User } from "@/types/user";
import { MathUtils } from "@/features/math/utils";

// Using workspace packages
import { Button } from "@websites/ui";
import { logger } from "@websites/infrastructure/logging";
```

### Avoid ❌

```typescript
// Missing slash in alias
import { Button } from "@components/Button"; // Should be "@/components/Button"

// Inconsistent patterns
import { formatDate } from "@lib/utils/date"; // Should be "@/lib/utils/date" or "@/utils/date"

// Non-standard domain aliases without documentation
import { MathUtils } from "@math/utils"; // Should be "@/features/math/utils" or document why @math/ is used
```

## App-Specific Aliases

If an app needs domain-specific aliases (e.g., `@math/*`, `@ai/*`), they should:

1. **Be documented** in the app's README
2. **Follow a clear pattern** (e.g., all domain aliases use `@domain/*`)
3. **Be consistent** within the app
4. **Be justified** - prefer standard aliases when possible

### Example: Documenting App-Specific Aliases

In `apps/personalpage/README.md`:

```markdown
## TypeScript Path Aliases

This app uses domain-specific aliases for feature modules:

- `@math/*` - Math-related features (`src/features/modules/math/*`)
- `@ai/*` - AI-related features (`src/features/modules/ai/*`)
- `@calendar/*` - Calendar features (`src/features/modules/calendar/*`)

These aliases are kept for historical reasons and consistency within this app.
New code should prefer the standard `@/features/*` pattern when possible.
```

## Best Practices

1. **Always use `@/*`** for the root source directory
2. **Use slashes in aliases**: `@/lib/*` not `@lib/*`
3. **Prefer standard aliases** over app-specific ones
4. **Document exceptions** in app READMEs
5. **Keep monorepo package aliases** consistent across all apps
6. **Migrate gradually** - update one alias pattern at a time
