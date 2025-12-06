# ITTWeb Infrastructure Consolidation - Quick Reference

## ✅ Immediate Actions (No Changes Needed)

### 1. Monitoring - Already Using Shared! ✅
- ✅ `_app.tsx` already imports from `@websites/infrastructure/monitoring`
- Local files are **identical duplicates** - can be deleted
- **Action**: Delete `src/features/infrastructure/monitoring/` directory

### 2. className Utility - Already Identical ✅
- Local and shared versions are **100% identical**
- **Action**: 
  - Replace imports: `@/features/infrastructure/utils/className` → `@websites/infrastructure/utils`
  - Delete: `src/features/infrastructure/utils/className.ts`

---

## ⚠️ Decisions Needed

### 3. Logging - Partially Migrated

**Current State**:
- ✅ 231 files already use `@websites/infrastructure/logging`
- ⚠️ 79 files still use `@/features/infrastructure/logging` (local)
- Local version has **throttling/deduplication** feature
- Shared version is simpler (no throttling)

**Decision Options**:
1. **Option A (Recommended)**: Add throttling to shared package, then migrate all
2. **Option B**: Keep local for throttling, but consolidate duplicates
3. **Option C**: Use shared as-is, lose throttling feature

**Recommendation**: Option A - enhance shared package with throttling

---

## 🔍 Review & Compare

### 4. Components
**Available in `@websites/ui`**:
- ✅ ErrorBoundary
- ✅ LoadingOverlay  
- ✅ LoadingScreen
- ✅ Button (check styling)
- ✅ Card
- ✅ EmptyState
- ✅ Tooltip
- ✅ Layout

**Action**: Review each component - migrate generic ones, keep project-specific

### 5. Hooks
- ✅ `useDataFetch` - Already uses shared logging/api
- Shared package has: `useDataFetch`, `useFallbackTranslation`, `useModalAccessibility`
- **Action**: Compare implementations, migrate if compatible

### 6. Cache Utilities
- Some files already use `@websites/infrastructure/cache`
- **Action**: Compare local cache with shared, migrate if compatible

### 7. Utils
- ✅ `removeUndefined` - Check if in shared package
- ✅ `timestampUtils` - Check if in shared package
- **Action**: Compare and migrate duplicates

---

## 📊 Impact Summary

| Category | Status | Files Affected | Lines Saved |
|----------|--------|----------------|-------------|
| **Monitoring** | ✅ Identical | 0 (already migrated) | ~500 lines |
| **className** | ✅ Identical | ~5-10 | ~20 lines |
| **Logging** | ⚠️ Needs decision | 79 files | ~270 lines |
| **Components** | 🔍 Review | ~50-100 | TBD |
| **Hooks** | 🔍 Review | ~10-20 | TBD |
| **Cache** | 🔍 Review | ~5-10 | TBD |

**Total Potential**: ~800+ lines of duplicate code

---

## 🚀 Quick Start Migration

### Step 1: Delete Identical Code (Safe)

```bash
# Delete monitoring (already using shared)
rm -rf apps/ittweb/src/features/infrastructure/monitoring/

# Delete className utility (identical)
rm apps/ittweb/src/features/infrastructure/utils/className.ts
```

### Step 2: Replace className Imports

```typescript
// Before
import { cn } from '@/features/infrastructure/utils/className';
// or
import { cn } from '@/features/infrastructure/utils';

// After
import { cn } from '@websites/infrastructure/utils';
```

### Step 3: Logging Decision

1. Review throttling feature - is it needed?
2. If yes: Enhance shared package
3. If no: Migrate to shared as-is
4. Replace all `@/features/infrastructure/logging` imports

---

## 📝 Files to Check

### Already Using Shared Packages ✅
- `src/pages/_app.tsx` - monitoring ✅
- Many service files - logging, firebase, utils ✅

### Still Using Local ⚠️
- `src/pages/entries/[id].tsx` - logging
- `src/pages/api/*` - logging (many files)
- Component imports - components directory

---

## 🎯 Priority Order

1. **High Priority** (Easy, no risk):
   - Delete monitoring directory ✅
   - Replace className imports ✅

2. **Medium Priority** (Need decision):
   - Logging migration (after enhancement)

3. **Low Priority** (Requires review):
   - Components migration
   - Hooks comparison
   - Cache comparison
   - Utils comparison

---

## 🔗 Related Documentation

- Full analysis: `docs/ittweb-infrastructure-consolidation.md`
- Infrastructure package: `packages/infrastructure/README.md`
- UI package: `packages/ui/README.md`
