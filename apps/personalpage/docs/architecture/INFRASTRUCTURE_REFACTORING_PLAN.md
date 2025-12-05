# Infrastructure Refactoring Plan

## Goal
Route everything so packages are used directly, and the infrastructure folder should either disappear from particular projects or be super minimal - just what is needed for that project. Everything else should be:
- **Shared infrastructure** → `@websites/infrastructure` package
- **Not infrastructure** → `modules/` folder

## Current State Analysis

### 1. `@api` (infrastructure/api)

**Current Location:** `src/features/infrastructure/api/`

**What exists:**
- `apiRequest.ts` - Axios-based API request utility (project-specific wrapper)
- `routeHandlers.ts` - Wrapper around `@websites/infrastructure/api` with personalpage auth config
- `index.ts` - Exports

**What's in packages:** `@websites/infrastructure/api` has:
- Generic route handlers
- API schemas and validation
- Query parsing

**Recommendation:**
- ✅ **Keep `routeHandlers.ts`** - It's a thin wrapper that adds personalpage-specific auth config
- ❓ **Evaluate `apiRequest.ts`** - This is an axios wrapper. Options:
  - **Option A:** Move to `@websites/infrastructure/api` if it's generic enough
  - **Option B:** Keep in project if it has personalpage-specific logic (like `NEXT_PUBLIC_API_BASE_URL`)
  - **Option C:** Replace with fetch-based solution from packages if available

**Action Items:**
1. Review `apiRequest.ts` - is it generic or project-specific?
2. If generic, move to `@websites/infrastructure/api`
3. Update all imports to use `@websites/infrastructure/api` for `apiRequest`
4. Keep `routeHandlers.ts` as minimal wrapper

---

### 2. `@auth` (infrastructure/auth)

**Current Location:** `src/features/infrastructure/auth/`

**What exists:**
- `userService.ts` - Firestore user operations
- `oauth.ts` - OAuth utilities (likely project-specific)
- `session.ts` - JWT session management (likely project-specific)
- `AuthContext.tsx` - React context (likely project-specific)

**What's in packages:** `@websites/infrastructure/auth` has:
- `oauth/google.ts` - Google OAuth utilities
- `session.ts` - Generic session management
- `userService.ts` - Generic user service
- `providers/AuthContext.tsx` - Generic auth context

**Recommendation:**
- ❌ **Remove local auth folder** - Everything should use `@websites/infrastructure/auth`
- ✅ **Migrate any personalpage-specific logic** to packages if it's reusable, or to modules if it's feature-specific

**Action Items:**
1. Compare local `auth/` with `@websites/infrastructure/auth`
2. Identify any personalpage-specific differences
3. If differences are project-specific config, use wrapper pattern (like routeHandlers)
4. If differences are feature-specific, move to appropriate module
5. Update all imports to use `@websites/infrastructure/auth`
6. Delete local `infrastructure/auth/` folder

---

### 3. `@cache` (infrastructure/cache)

**Current Location:** `src/features/infrastructure/cache/`

**What exists:**
- `cacheUtils.ts` - Generic localStorage + in-memory cache with expiry
- `index.ts` - Exports

**What's in packages:** `@websites/infrastructure/cache` has:
- `swrConfig.ts` - SWR configuration
- `requestCache.ts` - Request-level caching
- `analyticsCache.ts` - Analytics-specific caching
- `analyticsCache.server.ts` - Server-side analytics cache

**Recommendation:**
- ❓ **Evaluate consolidation** - personalpage's `cacheUtils.ts` is more generic than packages' cache
- **Option A:** Move `cacheUtils.ts` to `@websites/infrastructure/cache` as generic utility
- **Option B:** Keep if it's project-specific, but rename to make it clear it's project-specific
- **Option C:** Replace with packages' cache if it can serve the same purpose

**Action Items:**
1. Compare `cacheUtils.ts` with packages cache utilities
2. If `cacheUtils.ts` is more generic/useful, move to packages
3. If packages cache is sufficient, migrate to use packages
4. Update all imports
5. Delete local `infrastructure/cache/` if moved

---

### 4. `@shared` (infrastructure/shared)

**Current Location:** `src/features/infrastructure/shared/`

**What exists:**
- `components/mathParser.tsx` - Math parsing component (project-specific)
- `components/table/` - Table components (MathDisplay, Tag) - project-specific
- `components/ui/MathItemsDisplay.tsx` - Math display component (project-specific)
- `utils/functionUtils.ts` - Generic utility functions

**What's in packages:** `@websites/ui` has:
- Generic UI components (Button, Card, Input, etc.)
- Table components (GenericTable, etc.)
- Layout components

**Recommendation:**
- ✅ **Move math-specific components to `modules/math/`** - These are feature-specific, not infrastructure
  - `mathParser.tsx` → `modules/math/shared/components/MathParser.tsx`
  - `table/MathDisplay.tsx` → `modules/math/shared/components/MathDisplay.tsx`
  - `table/Tag.tsx` → `modules/math/shared/components/MathTag.tsx` (or keep in table if generic)
  - `ui/MathItemsDisplay.tsx` → `modules/math/shared/components/MathItemsDisplay.tsx`
- ❓ **Evaluate `functionUtils.ts`**:
  - If generic → Move to `@websites/infrastructure/utils`
  - If project-specific → Keep but move to project root utils or appropriate module

**Action Items:**
1. Move all math-specific components to `modules/math/shared/components/`
2. Evaluate `functionUtils.ts` - move to packages if generic
3. Check if `table/` components are generic enough for `@websites/ui`
4. Update all imports
5. Delete `infrastructure/shared/` if empty, or keep minimal project-specific utils

---

## Summary of Recommendations

### Can be removed (use packages):
- ✅ **`infrastructure/auth/`** → Use `@websites/infrastructure/auth`
- ❓ **`infrastructure/cache/`** → Evaluate and consolidate with `@websites/infrastructure/cache`

### Should be minimal wrappers:
- ✅ **`infrastructure/api/routeHandlers.ts`** → Keep as thin wrapper (already done)
- ❓ **`infrastructure/api/apiRequest.ts`** → Evaluate if it should move to packages

### Should move to modules:
- ✅ **`infrastructure/shared/components/mathParser.tsx`** → `modules/math/`
- ✅ **`infrastructure/shared/components/table/MathDisplay.tsx`** → `modules/math/`
- ✅ **`infrastructure/shared/components/ui/MathItemsDisplay.tsx`** → `modules/math/`
- ❓ **`infrastructure/shared/utils/functionUtils.ts`** → Evaluate (packages or project utils)

### Final Structure Goal:

```
src/features/
├── infrastructure/          # MINIMAL - only project-specific wrappers
│   └── api/
│       └── routeHandlers.ts  # Thin wrapper with personalpage auth config
│
└── modules/                 # All feature code
    ├── math/
    │   └── shared/
    │       └── components/   # Math-specific components moved here
    ├── ai/                   # Already moved ✅
    ├── calendar/
    └── ...
```

---

## Migration Steps

1. **Phase 1: Auth Migration**
   - Compare local auth with packages auth
   - Update all imports to use `@websites/infrastructure/auth`
   - Remove local `infrastructure/auth/`

2. **Phase 2: Cache Consolidation**
   - Evaluate cache utilities
   - Consolidate or migrate to packages
   - Remove local `infrastructure/cache/` if moved

3. **Phase 3: Shared Components**
   - Move math components to `modules/math/shared/components/`
   - Evaluate and move `functionUtils.ts`
   - Remove `infrastructure/shared/` or keep minimal

4. **Phase 4: API Cleanup**
   - Evaluate `apiRequest.ts`
   - Move to packages if generic, or keep as project-specific
   - Ensure `routeHandlers.ts` is minimal wrapper

5. **Phase 5: Final Cleanup**
   - Remove empty infrastructure folders
   - Update all path aliases
   - Update documentation

---

## Questions to Answer

1. Is `apiRequest.ts` generic enough for packages, or does it have personalpage-specific logic?
2. Are there differences between local `auth/` and packages `auth/` that need to be preserved?
3. Should `cacheUtils.ts` replace or complement packages cache utilities?
4. Are `table/` components (MathDisplay, Tag) generic enough for `@websites/ui`, or math-specific?
5. What's in `functionUtils.ts` - is it generic or project-specific?
