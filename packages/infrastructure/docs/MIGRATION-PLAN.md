# Documentation Migration Plan

**Status:** ✅ Migration Complete (Including Optional Next Steps)  
**Last Updated:** 2025-01-XX

## Overview

This document tracks the migration of shared infrastructure documentation from app-level docs (`apps/*/docs/`) to package-level docs (`packages/infrastructure/docs/`).

## Migration Strategy: Hybrid Approach

- **Module-level READMEs** (`src/*/README.md`) - API references co-located with code
- **Package-level guides** (`docs/guides/`) - Cross-cutting patterns and comprehensive guides
- **App-specific docs** - Remain in `apps/*/docs/` for business logic

## Migration Status

### ✅ Completed

- [x] Created `packages/infrastructure/docs/` structure
- [x] Created main `docs/README.md` with navigation
- [x] Created `docs/guides/error-handling.md` (consolidated from ittweb)
- [x] Created `docs/guides/logging.md` (from personalpage)
- [x] Created `docs/guides/i18n.md` (from personalpage)
- [x] Created `docs/guides/getting-started.md` (consolidated setup guides)
- [x] Created `docs/guides/authentication.md` (consolidated from ittweb)
- [x] Created `docs/guides/api-patterns.md` (from ittweb patterns)
- [x] Created `docs/guides/caching.md` (from personalpage)
- [x] Created `docs/guides/security.md` (consolidated from ittweb)
- [x] Created `docs/guides/monitoring.md` (from ittweb)
- [x] Created `docs/guides/performance.md` (merged from ittweb)
- [x] Created `src/logging/README.md` (module-level API reference)
- [x] Created `src/auth/README.md` (module-level API reference)
- [x] Created `src/api/README.md` (module-level API reference)
- [x] Created `src/i18n/README.md` (module-level API reference)
- [x] Created `src/cache/README.md` (module-level API reference)
- [x] Created `src/monitoring/README.md` (module-level API reference)
- [x] Created `src/firebase/README.md` (module-level API reference)
- [x] Created `src/clients/README.md` (module-level API reference)
- [x] Created `docs/architecture/design-decisions.md`
- [x] Updated `getting-started.md` with Google Cloud setup

### ✅ Optional Next Steps (Completed)

- [x] Update cross-references in migrated docs ✅
- [x] Update app-level docs to reference package docs ✅
- [x] Add migration notices to all migrated files ✅
- [x] Update "Related Documentation" sections in migrated files ✅
- [x] Remove migrated files from app docs ✅
- [ ] Archive historical docs in app `docs/archive/` directories (optional - not needed since files are deleted)

### 📋 Pending

#### Module-Level READMEs to Create

- [x] `src/auth/README.md` - Auth module API reference ✅
- [x] `src/i18n/README.md` - i18n module API reference ✅
- [x] `src/cache/README.md` - Cache module API reference ✅
- [x] `src/api/README.md` - API handlers module API reference ✅
- [x] `src/monitoring/README.md` - Monitoring module API reference ✅
- [x] `src/firebase/README.md` - Firebase module API reference ✅
- [x] `src/clients/README.md` - External clients module API reference ✅

#### Guides to Migrate/Create

**From `ittweb/docs/shared/`:**
- [x] `PERFORMANCE.md` → `docs/guides/performance.md` (merged with caching) ✅
- [x] `SECURITY.md` → `docs/guides/security.md` (consolidate all security docs) ✅
- [ ] `KNOWN_ISSUES.md` → (decide: keep in apps or move? - App-specific, keep in apps)

**From `ittweb/docs/production/security/`:**
- [x] `authentication-authorization.md` → Merge into `docs/guides/authentication.md` ✅
- [x] `input-validation.md` → Merge into `docs/guides/security.md` ✅
- [x] `web-security.md` → Merge into `docs/guides/security.md` ✅
- [x] `secrets-management.md` → Merge into `docs/guides/security.md` ✅
- [x] `automated-scanning.md` → Merge into `docs/guides/security.md` ✅

**From `ittweb/docs/development/operations/`:**
- [x] `monitoring.md` → `docs/guides/monitoring.md` ✅

**From `personalpage/docs/architecture/`:**
- [x] `CACHING_STRATEGY.md` → Merge into `docs/guides/caching.md` ✅
- [x] `ENV_SETUP.md` / `ENV_VARIABLES.md` → Already in `getting-started.md` ✅
- [x] `GOOGLE_CLOUD_SETUP.md` → Merge into `getting-started.md` ✅

**New Guides to Create:**
- [x] `docs/guides/api-patterns.md` - API route handler patterns ✅
- [x] `docs/guides/authentication.md` - Auth patterns (consolidate from ittweb) ✅
- [x] `docs/guides/caching.md` - Caching strategies (consolidate) ✅
- [x] `docs/guides/security.md` - Security best practices (consolidate all) ✅

## File Mapping

### From `ittweb/docs/shared/`

| Source | Target | Status | Notes |
|--------|--------|--------|-------|
| `ERROR_HANDLING.md` | `docs/guides/error-handling.md` | ✅ Done | Consolidated |
| `error-handling/api-patterns.md` | `docs/guides/error-handling.md` | ✅ Done | Merged |
| `error-handling/service-patterns.md` | `docs/guides/error-handling.md` | ✅ Done | Merged |
| `error-handling/component-patterns.md` | `docs/guides/error-handling.md` | ✅ Done | Merged |
| `PERFORMANCE.md` | `docs/guides/performance.md` | ✅ Done | Merged with caching |
| `SECURITY.md` | `docs/guides/security.md` | ✅ Done | Consolidated |

### From `ittweb/docs/production/security/`

| Source | Target | Status | Notes |
|--------|--------|--------|-------|
| `authentication-authorization.md` | `docs/guides/authentication.md` | ✅ Done | Migrated |
| `input-validation.md` | `docs/guides/security.md` | ✅ Done | Merged |
| `web-security.md` | `docs/guides/security.md` | ✅ Done | Merged |
| `secrets-management.md` | `docs/guides/security.md` | ✅ Done | Merged |
| `automated-scanning.md` | `docs/guides/security.md` | ✅ Done | Merged |

### From `ittweb/docs/development/operations/`

| Source | Target | Status | Notes |
|--------|--------|--------|-------|
| `monitoring.md` | `docs/guides/monitoring.md` | ✅ Done | Migrated |

### From `personalpage/docs/architecture/`

| Source | Target | Status | Notes |
|--------|--------|--------|-------|
| `LOGGING.md` | `docs/guides/logging.md` | ✅ Done | Migrated |
| `ERRORS.md` | `docs/guides/error-handling.md` | ✅ Done | Merged |
| `INTERNATIONALIZATION.md` | `docs/guides/i18n.md` | ✅ Done | Migrated |
| `CACHING_STRATEGY.md` | `docs/guides/caching.md` | ✅ Done | Migrated |
| `ENV_SETUP.md` | `docs/guides/getting-started.md` | ✅ Done | Merged |
| `ENV_VARIABLES.md` | `docs/guides/getting-started.md` | ✅ Done | Merged |
| `GOOGLE_CLOUD_SETUP.md` | `docs/guides/getting-started.md` | ✅ Done | Merged |

## Migration Complete ✅

All core migration tasks and optional next steps have been completed:

1. ✅ **Created all module READMEs** (8 modules)
2. ✅ **Created consolidated guides** (10 guides)
3. ✅ **Updated cross-references** in migrated docs
4. ✅ **Updated app-level docs** to reference package docs
5. ✅ **Added migration notices** to all migrated files

### Migration Complete ✅

All migrated files have been deleted from app docs directories. All references have been updated to point to the new package documentation locations.

## Notes

- Keep app-specific business logic docs in `apps/*/docs/`
- Archive historical docs in app `docs/archive/` directories
- Update all internal links after migration
- Test all documentation links

## Related

- [Package Documentation README](./README.md)
- [Documentation Philosophy](./README.md#documentation-philosophy)
