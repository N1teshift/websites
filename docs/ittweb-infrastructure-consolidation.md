# ITTWeb Infrastructure Consolidation Analysis

## Overview

This document analyzes what infrastructure code in the `ittweb` project can be replaced with shared packages from `@websites/infrastructure` and `@websites/ui`.

## Current State

The `ittweb` project currently has:
- **Local infrastructure** at `src/features/infrastructure/`
- **Mixed usage** of both local (`@/features/infrastructure/*`) and shared (`@websites/infrastructure/*`) packages

## Recommendations

### ✅ **1. Monitoring - FULLY REPLACEABLE**

**Status**: ✅ **IDENTICAL** - Can be completely removed

**Local Location**: 
- `src/features/infrastructure/monitoring/errorTracking.ts`
- `src/features/infrastructure/monitoring/performance.ts`

**Shared Package**: 
- `@websites/infrastructure/monitoring`

**Comparison**:
- Error tracking implementation is **100% identical**
- Performance monitoring is **100% identical**
- Both already use shared logging package

**Action Items**:
1. Replace all `@/features/infrastructure/monitoring/*` imports with `@websites/infrastructure/monitoring`
2. Delete local monitoring directory
3. Already using shared in `_app.tsx` ✅

**Files to Update**: ~0 (already migrated in `_app.tsx`, check for any remaining local imports)

---

### ✅ **2. Utils/className - FULLY REPLACEABLE**

**Status**: ✅ **IDENTICAL** - Can be completely removed

**Local Location**: 
- `src/features/infrastructure/utils/className.ts`

**Shared Package**: 
- `@websites/infrastructure/utils` (exports `cn` function)

**Comparison**:
- Implementation is **100% identical** (both use `clsx` + `tailwind-merge`)

**Action Items**:
1. Replace all `@/features/infrastructure/utils/className` or local imports with `@websites/infrastructure/utils`
2. Delete local `className.ts`

---

### ⚠️ **3. Logging - PARTIALLY REPLACEABLE** (with decision needed)

**Status**: ⚠️ **SIMILAR BUT DIFFERS** - Needs decision

**Local Location**: 
- `src/features/infrastructure/logging/logger.ts` (270 lines with throttling)

**Shared Package**: 
- `@websites/infrastructure/logging` (145 lines, simpler)

**Key Differences**:
- **Local version has**:
  - Log throttling/deduplication (5-second window)
  - More sophisticated log level filtering
  - Integration with local monitoring
  - More complex cache management

- **Shared version has**:
  - Simpler, cleaner implementation
  - Same core functionality (Logger, createComponentLogger, logError, logAndThrow)
  - Same ErrorCategory enum

**Current Usage**:
- Many files still use `@/features/infrastructure/logging` (79 instances found)
- Some files already use `@websites/infrastructure/logging` (231 instances found)
- Mixed usage indicates migration in progress

**Options**:

**Option A: Enhance Shared Package** (Recommended)
1. Add throttling/deduplication to shared package
2. Migrate all local usage to shared
3. Remove local logging

**Option B: Keep Local, Export from Shared**
1. Keep local version for ittweb-specific features
2. Use shared package as fallback

**Option C: Use Shared Package As-Is**
1. Replace all local logging with shared (lose throttling)
2. Simpler, but lose some functionality

**Recommendation**: **Option A** - Enhance shared package with throttling feature, then migrate completely.

**Action Items**:
1. Add throttling to `@websites/infrastructure/logging`
2. Replace all `@/features/infrastructure/logging` imports
3. Delete local logging directory

---

### ✅ **4. Components - PARTIALLY AVAILABLE IN SHARED UI**

**Status**: ✅ **Many components available in `@websites/ui`**

**Local Location**: 
- `src/features/infrastructure/components/`

**Shared Package**: 
- `@websites/ui` (25+ components)

**Components Available in Shared UI**:
- ✅ `ErrorBoundary` 
- ✅ `LoadingOverlay`
- ✅ `LoadingScreen`
- ✅ `Button` (may differ in styling)
- ✅ `Card`
- ✅ `EmptyState`
- ✅ `Tooltip`
- ✅ `Layout`

**Components Unique to ITTWeb**:
- `Header`, `PageHero` - likely project-specific
- `DropdownMenu`, `MobileMenu` - may be project-specific
- `DiscordButton`, `GitHubButton` - project-specific buttons

**Action Items**:
1. Review each component individually
2. Migrate generic components (ErrorBoundary, LoadingScreen, etc.) to shared UI
3. Keep project-specific components local

---

### ✅ **5. Cache Utilities - CHECK FOR REUSE**

**Status**: 🔍 **NEEDS INVESTIGATION**

**Local Location**: 
- `src/features/infrastructure/lib/cache/`
- `src/features/infrastructure/lib/swrConfig.ts`

**Shared Package**: 
- `@websites/infrastructure/cache` (has `requestCache`, `analyticsCache`, `swrConfig`)

**Already Using Shared**:
- Some files already import from `@websites/infrastructure/cache/*`

**Action Items**:
1. Compare local cache implementations with shared
2. Migrate if compatible

---

### ✅ **6. Hooks - CHECK FOR REUSE**

**Status**: 🔍 **AVAILABLE IN SHARED**

**Local Location**: 
- `src/features/infrastructure/hooks/`

**Shared Package**: 
- `@websites/infrastructure/hooks` exports:
  - `useDataFetch`
  - `useFallbackTranslation`
  - `useModalAccessibility`

**Action Items**:
1. Compare local hooks with shared versions
2. Migrate if compatible
3. Keep any ittweb-specific hooks local

---

### ✅ **7. Utils - CHECK FOR REUSE**

**Status**: ✅ **Many utils available in shared**

**Local Location**: 
- `src/features/infrastructure/utils/`

**Shared Package**: 
- `@websites/infrastructure/utils` exports:
  - `cn` (className utility) ✅
  - Object utilities (`removeUndefined`, etc.)
  - Timestamp utilities
  - Accessibility helpers
  - Server utilities

**Action Items**:
1. Check which utils are already in shared
2. Migrate duplicated utils
3. Keep project-specific utils local

---

## Migration Priority

### High Priority (Easy Wins)
1. ✅ **Monitoring** - Identical, no changes needed
2. ✅ **Utils/className** - Identical, simple replacement
3. ⚠️ **Logging** - Need to enhance shared package first

### Medium Priority (Requires Review)
4. **Components** - Review each component individually
5. **Cache** - Compare implementations
6. **Hooks** - Compare implementations
7. **Other Utils** - Compare implementations

---

## Migration Steps

### Step 1: Quick Wins (Monitoring & className)

```bash
# 1. Replace monitoring imports (if any remaining)
find . -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|@/features/infrastructure/monitoring|@websites/infrastructure/monitoring|g'

# 2. Replace className imports
find . -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|@/features/infrastructure/utils/className|@websites/infrastructure/utils|g'

# 3. Delete local files
rm -rf src/features/infrastructure/monitoring/
rm src/features/infrastructure/utils/className.ts
```

### Step 2: Logging Enhancement & Migration

1. Add throttling to shared logging package
2. Replace all logging imports
3. Remove local logging

### Step 3: Review & Migrate Components

1. Compare each component with shared UI
2. Migrate compatible components
3. Keep project-specific ones

---

## Summary

### Can Be Removed Immediately:
- ✅ Monitoring directory (100% identical)
- ✅ Utils/className.ts (100% identical)

### Needs Enhancement First:
- ⚠️ Logging (add throttling to shared package)

### Needs Review:
- 🔍 Components (some available in shared UI)
- 🔍 Cache utilities (check compatibility)
- 🔍 Hooks (check compatibility)
- 🔍 Other utils (check for duplicates)

### Estimated Code Reduction:
- **Monitoring**: ~500 lines
- **className**: ~20 lines  
- **Logging**: ~270 lines (after enhancement)
- **Total**: ~800+ lines of duplicate code can be removed

---

## Next Steps

1. **Create migration script** to replace imports automatically
2. **Enhance shared logging package** with throttling feature
3. **Review components** individually for migration
4. **Compare cache/hooks/utils** implementations
5. **Update documentation** after migration
