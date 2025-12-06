# ITTWeb Additional Consolidation Opportunities

## 📊 Current Status

### ✅ Completed Migrations
1. **Monitoring** - ✅ Deleted (was already using shared)
2. **className utility** - ✅ Deleted (identical to shared)
3. **Logging** - ✅ Enhanced shared package & migrated all files

---

## 🎯 Next Consolidation Opportunities

### 1. Cache Utilities - ✅ FULLY REPLACEABLE

**Status**: ✅ **IDENTICAL** - Can be completely removed

**Local Location**:
- `src/features/infrastructure/lib/cache/requestCache.ts`
- `src/features/infrastructure/lib/cache/swrConfig.ts`

**Shared Package**:
- `@websites/infrastructure/cache` (has both `requestCache` and `swrConfig`)

**Comparison**:
- `requestCache.ts` is **100% identical** (93 lines, including cacheKeys helper)
- `swrConfig.ts` is **100% identical** (76 lines, including swrKeys factory)

**Files Using Local Cache**:
- `src/pages/_app.tsx` - uses `swrConfig`
- `src/features/modules/analytics-group/analytics/lib/analyticsCache.ts` - uses `createRequestCache`
- `src/features/modules/content/classes/hooks/useClassesData.ts` - uses `swrKeys`
- `src/features/infrastructure/hooks/data-fetch/useDataFetch.examples.ts` - uses `swrKeys`

**Action Items**:
1. Replace all imports to use `@websites/infrastructure/cache`
2. Delete local cache files
3. Update `lib/index.ts` exports

**Code Removed**: ~170 lines

---

### 2. Hooks - 🔍 CHECK COMPATIBILITY

**Status**: 🔍 **NEEDS VERIFICATION**

**Local Location**:
- `src/features/infrastructure/hooks/data-fetch/useDataFetch.ts`

**Shared Package**:
- `@websites/infrastructure/hooks` exports `useDataFetch`

**Current State**:
- Local version already uses `@websites/infrastructure/logging`
- Local version already uses `@websites/infrastructure/api`
- Need to compare implementations side-by-side

**Action Items**:
1. Compare local vs shared implementations
2. If compatible: migrate all usages
3. If different: document differences and decide

---

### 3. Utils - 🔍 CHECK FOR DUPLICATES

**Status**: 🔍 **PARTIALLY IDENTICAL**

**Local Utils**:
- `utils/object/objectUtils.ts` - has `removeUndefined`
- `utils/time/timestampUtils.ts` - timestamp utilities
- `utils/accessibility/helpers.ts` - accessibility helpers
- `utils/server/serverUtils.ts` - server utilities

**Shared Package**:
- `@websites/infrastructure/utils` exports all of the above

**Already Using Shared**:
- Many files already import `removeUndefined` from `@websites/infrastructure/utils`
- Some files still import from local utils

**Action Items**:
1. Check which utils are still local-only
2. Migrate imports that reference shared utils
3. Keep project-specific utils local (if any)

---

### 4. Components - 🔍 REVIEW INDIVIDUALLY

**Status**: 🔍 **REQUIRES REVIEW**

**Available in `@websites/ui`**:
- ✅ `ErrorBoundary`
- ✅ `LoadingOverlay`
- ✅ `LoadingScreen`
- ✅ `Button` (check styling differences)
- ✅ `Card`
- ✅ `EmptyState`
- ✅ `Tooltip`
- ✅ `Layout`

**Local Components**:
- `Header`, `PageHero` - likely project-specific
- `DropdownMenu`, `MobileMenu` - navigation (may be project-specific)
- `DiscordButton`, `GitHubButton` - social buttons (project-specific)

**Action Items**:
1. Review each component for compatibility
2. Migrate generic components
3. Keep project-specific components local

---

## 📋 Priority Order

### High Priority (Easy Wins)
1. ✅ **Cache Utilities** - Identical, simple replacement
   - `requestCache.ts` - 100% identical
   - `swrConfig.ts` - 100% identical

### Medium Priority (Requires Review)
2. **Hooks** - Compare implementations
3. **Utils** - Migrate remaining imports
4. **Components** - Review individually

---

## 📊 Estimated Impact

| Category | Status | Files Affected | Lines Saved |
|----------|--------|----------------|-------------|
| **Cache** | ✅ Identical | ~4-5 files | ~170 lines |
| **Hooks** | 🔍 Review | ~10-20 files | TBD |
| **Utils** | 🔍 Review | ~5-10 files | TBD |
| **Components** | 🔍 Review | ~50-100 files | TBD |

**Total Potential**: ~170+ lines of duplicate code (just from cache)

---

## 🚀 Quick Migration Plan

### Step 1: Cache Utilities (Easy Win)

**Files to Update**:
1. `src/pages/_app.tsx`
   ```typescript
   // Before
   import { swrConfig } from "@/features/infrastructure/lib";
   
   // After
   import { swrConfig } from "@websites/infrastructure/cache";
   ```

2. `src/features/modules/analytics-group/analytics/lib/analyticsCache.ts`
   ```typescript
   // Before
   import { createRequestCache } from '@/features/infrastructure/lib';
   
   // After
   import { createRequestCache } from '@websites/infrastructure/cache';
   ```

3. Files using `swrKeys`:
   - `src/features/modules/content/classes/hooks/useClassesData.ts`
   - `src/features/infrastructure/hooks/data-fetch/useDataFetch.examples.ts`

**Files to Delete**:
- `src/features/infrastructure/lib/cache/requestCache.ts`
- `src/features/infrastructure/lib/cache/swrConfig.ts`
- Update `src/features/infrastructure/lib/cache/index.ts`

---

## 📝 Notes

- Cache utilities are **100% identical** - safest to migrate next
- All other items require careful review before migration
- Components migration would have the biggest visual impact

---

## 🔗 Related Documentation

- Full analysis: `docs/ittweb-infrastructure-consolidation.md`
- Migration summary: `docs/ittweb-migration-summary.md`
- Logging migration: `docs/ittweb-logging-migration-summary.md`
