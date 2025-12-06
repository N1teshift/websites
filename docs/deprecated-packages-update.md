# Deprecated Packages Update

**Date**: 2025-12-06  
**Status**: ✅ Updates Applied

## Summary

Updated deprecated packages to latest stable versions across all apps and packages.

## Updates Applied

### 1. Next.js Updates
- **Previous**: `15.5.6`
- **Updated to**: `15.5.7`
- **Reason**: Critical security fix (CVE-2025-66478) - React Server Components vulnerability
- **Apps Updated**:
  - ✅ `apps/MafaldaGarcia`
  - ✅ `apps/ittweb`
  - ✅ `apps/personalpage`
  - ✅ `apps/templatepage`
  - ✅ `packages/ui`

### 2. ESLint Updates
- **Previous**: `^8` / `^8.57.1`
- **Updated to**: `^9`
- **Reason**: ESLint 8 is deprecated, ESLint 9 is the current stable version
- **Apps Updated**:
  - ✅ `apps/MafaldaGarcia`
  - ✅ `apps/ittweb`
  - ✅ `apps/personalpage`
  - ✅ `apps/templatepage`

### 3. eslint-config-next Updates
- **Previous**: `15.5.6`
- **Updated to**: `15.5.7`
- **Reason**: Match Next.js version for compatibility
- **Apps Updated**:
  - ✅ `apps/MafaldaGarcia`
  - ✅ `apps/ittweb`
  - ✅ `apps/personalpage`
  - ✅ `apps/templatepage`

## ESLint 9 Migration Notes

### Backward Compatibility
Next.js 15 supports ESLint 9 with backward compatibility. The existing ESLint setup should continue to work without immediate changes.

### Flat Config (Future Consideration)
ESLint 9 introduces a new flat configuration format (`eslint.config.mjs`). While Next.js 15 supports the legacy format, consider migrating to flat config in the future:

1. **Current State**: Using legacy ESLint config (via `eslint-config-next`)
2. **Future Migration**: Create `eslint.config.mjs` files if needed for custom rules
3. **Automatic**: Next.js will handle most ESLint configuration automatically

### No Immediate Action Required
Since we're using `eslint-config-next`, the migration to flat config is optional and can be done gradually when needed.

## Next Steps

1. ✅ **Completed**: Updated all package.json files
2. ⏭️ **Todo**: Run `pnpm install` to install updated packages
3. ⏭️ **Todo**: Test builds to ensure compatibility
4. ⏭️ **Optional**: Migrate to ESLint flat config if custom rules are needed

## Commands to Run

```powershell
# Install updated packages
cd c:\Users\user\source\repos\websites
pnpm install

# Verify builds
pnpm verify:builds

# Test linting
pnpm lint
```

## Subdependency Deprecation Warnings

The following subdependencies may still show deprecation warnings (they're transitive dependencies):
- `@humanwhocodes/config-array@0.13.0`
- `@humanwhocodes/object-schema@2.0.3`
- `@npmcli/move-file@1.1.2`
- `are-we-there-yet@3.0.1`
- `fstream@1.0.12`
- `gauge@4.0.4`
- `glob@7.2.3`
- `inflight@1.0.6`
- `lodash.isequal@4.5.0`
- `npmlog@6.0.2`
- `rimraf@2.7.1`
- `rimraf@3.0.2`

These are transitive dependencies and will be resolved when their parent packages update. No action required unless they cause issues.

## Files Modified

- `apps/MafaldaGarcia/package.json`
- `apps/ittweb/package.json`
- `apps/personalpage/package.json`
- `apps/templatepage/package.json`
- `packages/ui/package.json`
