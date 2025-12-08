# Utils

**Status**: ✅ **MIGRATED** - Now uses `@websites/infrastructure/utils`

All utility functions have been migrated to the shared package. This directory now only contains project-specific utilities.

## Usage

Import utilities from the shared package:

```typescript
import {
  timestampToIso,
  removeUndefined,
  cn,
  getElementsWithAriaLabels,
  // ... other utilities
} from "@websites/infrastructure/utils";
```

Or use the re-exported index:

```typescript
import { timestampToIso } from "@/features/infrastructure/utils";
```

## Project-Specific Utilities

The following utilities remain in this directory as they are project-specific:

- `service/serviceOperationWrapper.ts` - Service operation wrapper for ittweb-specific error handling

## Available Utilities (from shared package)

- **Object utilities**: `removeUndefined`, `pick`, `omit`, etc.
- **Time utilities**: `timestampToIso`, timestamp factories, etc.
- **Accessibility helpers**: `getElementsWithAriaLabels`, `getFocusableElementsInOrder`, etc.
- **ClassName utility**: `cn` function for Tailwind class merging
- **Server utilities**: `isServerSide`, etc.

See `@websites/infrastructure/utils` for complete documentation.
