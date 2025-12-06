# Build Errors & Fixes - Round 2

**Date**: 2025-12-06  
**Status**: 🔧 Fixes Applied - Needs Verification

## Issues Found

### 1. Missing Exports in Infrastructure Package

**Errors**:
- `Cannot find module '@websites/infrastructure/monitoring/performance'`
- `Module '"@websites/infrastructure/api"' has no exported member 'apiRequest'`

**Fixes Applied**:
- ✅ Added `./monitoring/performance` export path to `packages/infrastructure/package.json`
- ✅ Created `packages/infrastructure/src/api/client.ts` with `apiRequest` function
- ✅ Exported `apiRequest` from `packages/infrastructure/src/api/index.ts`
- ✅ Added `axios` as a dependency to infrastructure package

**Files Modified**:
- `packages/infrastructure/package.json` - Added exports and axios dependency
- `packages/infrastructure/src/api/client.ts` - Created new file
- `packages/infrastructure/src/api/index.ts` - Added client export

### 2. pnpm lint Filter Issue

**Error**: `No projects matched the filters in "C:\Users\user\source\repos\websites"`

**Status**: ⚠️ Investigating - filter syntax `'{apps/*}'` should work

**Possible Solutions**:
- Try different filter syntax: `"./apps/*"` or `"apps/*"`
- Check pnpm workspace configuration
- Verify all apps have lint scripts

### 3. Next.js Version Not Updating

**Issue**: Build output shows Next.js 15.5.6, but package.json shows 15.5.7

**Root Cause**: Likely cached node_modules or lock file issue

**Solution Needed**:
```powershell
# Clear caches and reinstall
cd c:\Users\user\source\repos\websites
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
pnpm install
```

### 4. Webpack node:fs Errors (MafaldaGarcia & templatepage)

**Status**: ⚠️ Still present - webpack config may need adjustment

**Error**: `UnhandledSchemeError: Reading from "node:fs" is not handled`

**Previous Fix**: Updated webpack configs, but may need cache clear

## Next Steps

1. ✅ **Completed**: Added missing exports
2. ✅ **Completed**: Added apiRequest to infrastructure
3. ⏭️ **Todo**: Clear node_modules and reinstall to fix Next.js version
4. ⏭️ **Todo**: Test pnpm lint with different filter syntax
5. ⏭️ **Todo**: Re-run build verification after fixes

## Commands to Run

```powershell
# 1. Clear caches
cd c:\Users\user\source\repos\websites
Get-ChildItem -Path apps -Recurse -Directory -Filter ".next" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# 2. Reinstall dependencies
pnpm install

# 3. Test lint (try different syntax)
pnpm --filter "./apps/*" lint
# OR
pnpm --filter "apps/*" lint
# OR
pnpm -r --filter "./apps/*" lint

# 4. Verify builds
pnpm verify:builds
```
