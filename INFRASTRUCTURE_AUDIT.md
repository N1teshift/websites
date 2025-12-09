# Critical Infrastructure Audit - Websites Monorepo

**Date**: 2025-01-27  
**Scope**: Infrastructure configuration, conventions, automation, and enforcement  
**Focus**: Areas that are "nearly correct" but compromised by missing conventions, weak enforcement, partial automation, or inconsistent configuration

---

## Executive Summary

This audit identifies infrastructure gaps where modest effort would yield disproportionate improvements. The monorepo shows evidence of incremental evolution with shared packages and tooling, but critical inconsistencies create maintenance debt and deployment risks.

---

## Critical Findings

### 1. TypeScript Configuration Extends Inconsistency

**Status**: Partially standardized, inconsistent implementation

**Problem**:

- `apps/ittweb/tsconfig.json` extends `"./config/tsconfig.base.json"` (relative path)
- All other apps extend `"@websites/config/tsconfig.base.json"` (package reference)
- `packages/infrastructure/tsconfig.json` extends `"../../packages/config/tsconfig.base.json"` (relative path)
- `packages/config-tailwind/tsconfig.json` extends `"../config/tsconfig.base.json"` (relative path)

**Risk**:

- **Build fragility**: Relative paths break if directory structure changes or configs move
- **IDE confusion**: TypeScript language server may not resolve relative extends correctly in all contexts
- **Maintenance burden**: Two different patterns require mental context switching
- **Migration risk**: If `ittweb` needs to move or restructure, its config breaks silently

**Impact**: Medium-High  
**Effort to Fix**: Low (1-2 hours)  
**Recommendation**: Standardize all extends to use `@websites/config/tsconfig.base.json`. The shared package already exists and works for other apps.

---

### 2. Environment Variable Validation: Single-App Implementation

**Status**: Implemented correctly in one app, missing from others

**Problem**:

- Only `ittweb` has `validate:env` script that checks required environment variables before build
- `ittweb` build script: `"build": "pnpm run validate:env && pnpm --loglevel=error run build:internal"`
- Other apps (`MafaldaGarcia`, `personalpage`, `templatepage`) have no validation
- Root `turbo.json` has no environment variable validation step

**Risk**:

- **Silent failures**: Apps can build successfully but fail at runtime due to missing env vars
- **Production incidents**: Deployments succeed but services crash on first request
- **Developer friction**: New developers don't know which env vars are required until runtime
- **CI/CD gaps**: CI builds may pass but deployments fail in production environments

**Impact**: High  
**Effort to Fix**: Low-Medium (2-4 hours)  
**Recommendation**:

1. Extract `validate-env.js` to `packages/infrastructure/scripts/` or `packages/test-utils/scripts/`
2. Create app-specific env var requirement files (or make validation configurable)
3. Add `validate:env` script to all app `package.json` files
4. Update all app build scripts to include validation
5. Consider adding validation to `turbo.json` build pipeline

---

### 3. ESLint Configuration: Inconsistent Ignores

**Status**: Shared config exists, but app-specific overrides inconsistent

**Problem**:

- `apps/ittweb/eslint.config.js` has additional ignores for config files:
  ```js
  ignores: [
    "*.config.js",
    "*.config.ts",
    "next.config.ts",
    "tailwind.config.ts",
  ];
  ```
- Other apps (`MafaldaGarcia`, `personalpage`, `templatepage`) have no app-specific ignores
- Root `eslint.config.js` already ignores app source files, but config files at app root are not consistently handled

**Risk**:

- **Linting noise**: Config files may be linted when they shouldn't be (or vice versa)
- **False positives**: ESLint may report errors in config files that are intentionally non-standard
- **Inconsistent behavior**: Same config file pattern linted differently across apps

**Impact**: Low-Medium  
**Effort to Fix**: Low (1 hour)  
**Recommendation**:

1. Add config file ignores to shared `@websites/eslint-config` if universally needed
2. OR document that apps should add these ignores if they have config files at root
3. Ensure all apps follow the same pattern

---

### 4. Verify Script: Works but Non-Standard Pattern

**Status**: Functional but uses Turbo's dependsOn pattern instead of explicit scripts

**Current Behavior**:

- `turbo.json` defines `verify` task: `"dependsOn": ["format:check", "lint", "type-check", "build"]`
- Root `package.json` has: `"verify": "turbo run verify"`
- **No app has a `verify` script in their `package.json`**
- Turbo runs the `dependsOn` tasks directly (which all exist in app package.json files)
- This works correctly - verify fails when dependencies fail, succeeds when they pass

**Why This Is Still a Concern**:

- **Non-standard pattern**: Most monorepos have explicit `verify` scripts; this pattern is less discoverable
- **Documentation gap**: Developers might not understand that verify works via dependsOn
- **Maintenance risk**: If someone removes one of the dependent scripts from an app, verify might silently skip that app
- **Inconsistent with other tasks**: Other tasks (like `build`, `lint`) have both turbo.json config AND package.json scripts

**Impact**: Low  
**Effort to Fix**: Low (30 minutes)  
**Recommendation**:

- **Option A (Recommended)**: Add explicit `"verify": "pnpm run format:check && pnpm run lint && pnpm run type-check && pnpm run build"` to all app `package.json` files for consistency and clarity
- **Option B**: Keep current pattern but document it clearly in README/CONTRIBUTING.md
- Current implementation is functional, but explicit scripts are more maintainable and discoverable

---

### 5. Jest Configuration: Inconsistent Base Extension

**Status**: Base config exists, adoption inconsistent

**Problem**:

- `packages/test-utils/jest.config.base.js` provides shared Jest configuration
- `apps/ittweb/jest.config.cjs` extends base via `require("@websites/test-utils/jest.config.base.js")`
- `apps/personalpage/jest.config.cjs` extends base correctly
- `apps/MafaldaGarcia` and `apps/templatepage` have no Jest config files (may not have tests)

**Risk**:

- **Test inconsistency**: Apps that add tests later may create incompatible Jest configs
- **Maintenance burden**: Each new test setup requires re-implementing base config
- **Coverage gaps**: Missing base config means missing shared setup files, mocks, etc.

**Impact**: Low-Medium  
**Effort to Fix**: Low (1 hour)  
**Recommendation**:

1. Add placeholder Jest configs to apps without tests that extend base config
2. Document that new apps should start with base Jest config
3. Consider adding Jest config validation to `validate-scripts.js`

---

### 6. PostCSS Configuration: Partial Standardization

**Status**: Shared config exists, adoption incomplete

**Problem**:

- `packages/config-tailwind/postcss.config.mjs` provides shared PostCSS config
- `apps/MafaldaGarcia/postcss.config.mjs` uses shared: `export { default } from '@websites/config-tailwind/postcss';`
- `apps/ittweb/postcss.config.mjs` re-exports from local: `export { default } from "./config/postcss.config.mjs";`
- `apps/personalpage/postcss.config.mjs` not checked (may use shared or local)
- `apps/templatepage/postcss.config.mjs` not checked

**Risk**:

- **Configuration drift**: Apps may diverge in PostCSS plugins or settings
- **Build inconsistency**: Same CSS may process differently across apps
- **Maintenance burden**: Changes to PostCSS setup require updates in multiple places

**Impact**: Low-Medium  
**Effort to Fix**: Low (1 hour)  
**Recommendation**: Audit all PostCSS configs and standardize on shared config. Remove intermediate re-exports.

---

### 7. Tailwind Configuration: Inconsistent Base Usage

**Status**: Shared base exists, but structure varies

**Problem**:

- `packages/config-tailwind` provides `baseTailwindConfig`
- `apps/ittweb/tailwind.config.ts` re-exports from `./config/tailwind.config.ts` (intermediate file)
- `apps/MafaldaGarcia/tailwind.config.ts` and `apps/templatepage/tailwind.config.ts` import directly from `@websites/config-tailwind`
- `apps/personalpage` may not have `tailwind.config.ts` at root (structure unclear)

**Risk**:

- **Theme inconsistency**: Apps may have different Tailwind theme defaults
- **Content path drift**: Each app defines its own `content` paths, which may miss shared packages
- **Plugin inconsistency**: Some apps may add plugins others don't have

**Impact**: Low-Medium  
**Effort to Fix**: Medium (2-3 hours)  
**Recommendation**:

1. Standardize all Tailwind configs to import directly from `@websites/config-tailwind`
2. Remove intermediate re-export files
3. Document content path patterns that should be included
4. Consider adding Tailwind config validation

---

### 8. Prettier Configuration: Package Exists but Usage Unclear

**Status**: Shared package exists, but no verification of usage

**Problem**:

- `packages/prettier-config` provides `.prettierrc.json`
- Package.json files reference `@websites/prettier-config` in devDependencies
- **No `.prettierrc.json` files found in app directories** (may be using package directly or missing)
- `lint-staged` uses `prettier --write` but unclear if it uses shared config

**Risk**:

- **Formatting inconsistency**: Apps may format code differently
- **Merge conflicts**: Different formatting rules cause unnecessary conflicts
- **Developer confusion**: Unclear which Prettier config is active

**Impact**: Low-Medium  
**Effort to Fix**: Low (1 hour)  
**Recommendation**:

1. Verify all apps have `.prettierrc.json` that extends shared config (or use package directly)
2. Add Prettier config validation to CI/pre-commit
3. Document expected Prettier setup in contributing guide

---

### 9. Build Verification: PowerShell-Only Script

**Status**: Script exists but platform-specific

**Problem**:

- `scripts/verify-builds.ps1` is PowerShell-only
- Root `package.json` has: `"verify:builds": "powershell -ExecutionPolicy Bypass -File ./scripts/verify-builds.ps1"`
- **No cross-platform alternative** (no `.sh` or Node.js version)
- Script is comprehensive but unusable on macOS/Linux without PowerShell

**Risk**:

- **Developer exclusion**: Non-Windows developers cannot run build verification
- **CI/CD limitations**: CI systems may not have PowerShell available
- **Documentation drift**: Script may be Windows-specific but not documented as such

**Impact**: Medium  
**Effort to Fix**: Medium (3-4 hours)  
**Recommendation**:

1. Create Node.js version of build verification script (`scripts/verify-builds.js`)
2. Keep PowerShell version for Windows users
3. Update root `package.json` to use Node.js version by default, PowerShell as alternative
4. OR use Turbo's built-in verification capabilities instead

---

### 10. Missing CI/CD Configuration

**Status**: No CI/CD files found

**Problem**:

- No `.github/workflows/` directory found
- No `.gitlab-ci.yml` or similar CI config
- No documented CI/CD process
- `validate-env.js` has CI detection (`if (process.env.CI === "true")`) but no CI config exists

**Risk**:

- **No automated testing**: Tests may not run on PRs
- **No automated builds**: Build failures may not be caught before merge
- **No deployment automation**: Manual deployment process prone to errors
- **No dependency updates**: Security vulnerabilities may not be detected
- **Documentation drift**: CI detection code exists but no CI runs it

**Impact**: High  
**Effort to Fix**: High (1-2 days)  
**Recommendation**:

1. Add GitHub Actions workflow for:
   - PR validation (lint, type-check, test)
   - Build verification
   - Dependency security scanning
2. Document CI/CD process
3. Remove or update CI detection code if CI won't be added

---

### 11. Script Validation: Exists but Not Enforced

**Status**: Tool exists, not integrated into workflow

**Problem**:

- `scripts/validate-scripts.js` validates script naming conventions and required scripts
- Root `package.json` has: `"validate:scripts": "node scripts/validate-scripts.js"`
- **Not run in pre-commit hooks**
- **Not run in CI** (if CI existed)
- **Not part of `verify` task** (which itself is broken)

**Risk**:

- **Convention drift**: Scripts may violate conventions without detection
- **Missing scripts**: Apps may be missing required scripts
- **False confidence**: Tool exists but doesn't prevent issues

**Impact**: Low-Medium  
**Effort to Fix**: Low (30 minutes)  
**Recommendation**:

1. Add `validate:scripts` to pre-commit hook (via `lint-staged` or husky)
2. Add to `verify` task in `turbo.json`
3. Add to CI pipeline (when CI is added)

---

### 12. Next.js Configuration: Inconsistent Webpack Extensions

**Status**: Base config shared, but app-specific extensions vary

**Problem**:

- `packages/infrastructure/src/config/next.config.base.ts` provides `createBaseNextConfig()`
- All apps use base config correctly
- `apps/ittweb/next.config.ts` re-exports from `./config/next.config.ts` (intermediate file)
- `apps/MafaldaGarcia/next.config.ts` has app-specific webpack config for dev source maps
- Other apps don't have webpack extensions

**Risk**:

- **Build inconsistency**: Dev vs production builds may behave differently across apps
- **Source map issues**: Some apps may have better debugging than others
- **Maintenance burden**: Webpack configs may drift over time

**Impact**: Low  
**Effort to Fix**: Low (1 hour)  
**Recommendation**:

1. Document when app-specific webpack configs are needed
2. Consider moving common webpack patterns to base config
3. Remove intermediate re-export in `ittweb` if not needed

---

## Summary of Risks by Category

### High Risk (Address Immediately)

1. **Environment Variable Validation**: Only one app validates, others can deploy with missing vars
2. **Missing CI/CD**: No automated testing, building, or deployment

### Medium Risk (Address Soon)

3. **Build Verification**: Platform-specific, excludes non-Windows developers
4. **TypeScript Config**: Inconsistent extends patterns create maintenance debt
5. **Verify Script**: Works but uses non-standard pattern (functional, but could be more explicit)

### Low-Medium Risk (Address When Convenient)

6. **ESLint Config**: Inconsistent ignores may cause linting issues
7. **Jest Config**: Inconsistent base extension may cause test setup issues
8. **PostCSS/Tailwind Config**: Partial standardization may cause build inconsistencies
9. **Prettier Config**: Usage unclear, may cause formatting inconsistencies
10. **Script Validation**: Not enforced, conventions may drift
11. **Next.js Config**: Minor inconsistencies in webpack extensions

---

## Quick Wins (Low Effort, High Impact)

1. **Standardize TypeScript extends** (1-2 hours) - Reduces maintenance burden
2. **Extract and add env validation to all apps** (2-4 hours) - Prevents production failures
3. **Add script validation to pre-commit** (30 min) - Prevents convention drift
4. **Standardize PostCSS/Tailwind configs** (2-3 hours) - Ensures build consistency
5. **Make verify scripts explicit** (30 min) - Improves discoverability and consistency (optional, current pattern works)

---

## Recommendations Priority

1. **Immediate**: Standardize TypeScript config extends, add env validation to all apps
2. **This Week**: Add script validation to pre-commit, standardize PostCSS/Tailwind configs
3. **This Month**: Add CI/CD, create cross-platform build verification
4. **Ongoing**: Document conventions, add validation to prevent drift

---

## Notes

- This audit focuses on infrastructure gaps, not code quality or architecture
- All findings are fixable with modest effort
- Many issues stem from incremental evolution without periodic standardization passes
- Consider establishing a "configuration audit" as part of quarterly maintenance
