# Optional Next Steps - Implementation Summary

This document summarizes the completion of optional next steps from the monorepo improvements.

## ✅ Completed Optional Steps

### 1. Updated date-fns Imports

**Status:** ✅ Completed

Updated all date-fns imports in apps to use the infrastructure package:

#### Files Updated:

- `apps/ittweb/src/features/modules/analytics-group/analytics/lib/analyticsService.ts`
  - Changed: `from "date-fns"` → `from "@websites/infrastructure/date-fns"`

- `apps/personalpage/src/features/modules/calendar/hooks/useCalendarLocalization.ts`
  - Changed: `from "date-fns"` → `from "@websites/infrastructure/date-fns"`
  - Changed: `from "date-fns/locale"` → `from "@websites/infrastructure/date-fns/locale"`

- `apps/personalpage/src/features/modules/calendar/components/Calendar.tsx`
  - Changed: `from "date-fns"` → `from "@websites/infrastructure/date-fns"`

**Impact:**

- All apps now use the centralized date-fns dependency
- Ensures version consistency across the monorepo
- Single source of truth for date utilities

### 2. Added Bundle Analyzers

**Status:** ✅ Completed

Added bundle analyzer support to apps that were missing it:

#### templatepage

- ✅ Added `@next/bundle-analyzer` to devDependencies
- ✅ Added `cross-env` to devDependencies
- ✅ Added `analyze` script: `"analyze": "cross-env ANALYZE=true next build"`
- ✅ Bundle analyzer already configured in `next.config.ts`

#### MafaldaGarcia

- ✅ Added `@next/bundle-analyzer` to devDependencies
- ✅ Added `cross-env` to devDependencies
- ✅ Added `analyze` script: `"analyze": "cross-env ANALYZE=true next build"`
- ✅ Bundle analyzer already configured in `next.config.ts`

**Impact:**

- All apps now have bundle size analysis capability
- Consistent tooling across the monorepo
- CI bundle-size job will now show all apps as having analyzers

### 3. Script Naming Conventions

**Status:** ✅ Completed

Reviewed and updated app-specific scripts to follow naming conventions:

#### personalpage

- ✅ Updated `fix-imports` → `fix:imports` (follows colon pattern)
- ✅ All other scripts already follow conventions:
  - `validate:translations` ✅
  - `check:missing` ✅
  - `build:test`, `build:test:only` ✅
  - `test:windows`, `test:math:ui` ✅
  - `test:openai:*` ✅
  - `migrate:weekly-to-classwork` ✅
  - `check:vercel` ✅
  - `analyze:*` ✅

#### ittweb

- ✅ Updated `validate-env` → `validate:env` (follows colon pattern)
- ✅ Updated build script to use `validate:env`
- ✅ All other scripts already follow conventions:
  - `extract:data` ✅
  - `dev:verbose` ✅
  - `build:internal`, `build:quiet`, `build:check` ✅
  - `lint:test` ✅
  - `test:*` ✅
  - `analyze:*` ✅
  - `parse:replay:*` ✅
  - `replay-meta:*` ✅

**Impact:**

- Consistent script naming across all apps
- Easier to discover and understand scripts
- Better developer experience

## 📊 Summary

All optional next steps have been completed:

1. ✅ **date-fns imports** - All apps now use infrastructure package
2. ✅ **Bundle analyzers** - All apps have analyzer configured
3. ✅ **Script naming** - All scripts follow conventions

## 🎯 Remaining Optional Work

The following items remain optional and can be done gradually:

1. **TypeScript Path Aliases Migration**
   - `personalpage` and `ittweb` have custom path aliases
   - Can be migrated gradually to standard patterns
   - See `docs/TYPESCRIPT_PATH_ALIASES.md` for guidance

2. **Additional Script Standardization**
   - Some apps have domain-specific scripts (e.g., `extract:data`, `parse:replay`)
   - These are fine to keep as-is since they're app-specific
   - Consider documenting them in app READMEs

## Files Changed

### Modified Files

- `apps/ittweb/src/features/modules/analytics-group/analytics/lib/analyticsService.ts`
- `apps/personalpage/src/features/modules/calendar/hooks/useCalendarLocalization.ts`
- `apps/personalpage/src/features/modules/calendar/components/Calendar.tsx`
- `apps/personalpage/package.json` - Updated script name
- `apps/ittweb/package.json` - Updated script name and reference
- `apps/templatepage/package.json` - Added bundle analyzer
- `apps/MafaldaGarcia/package.json` - Added bundle analyzer

### New Files

- `docs/OPTIONAL_STEPS_COMPLETED.md` - This summary document
