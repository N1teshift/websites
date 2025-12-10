# TypeScript Configuration Inconsistency Analysis

## Overview

The monorepo has inconsistent TypeScript configuration patterns that create maintenance debt and potential build issues. This document provides a detailed analysis and fix plan.

---

## Current State

### Configuration Files Inventory

| Location                                 | Extends                                      | Pattern           | Status              |
| ---------------------------------------- | -------------------------------------------- | ----------------- | ------------------- |
| `apps/ittweb/tsconfig.json`              | `"./config/tsconfig.base.json"`              | Relative (local)  | ⚠️ **INCONSISTENT** |
| `apps/MafaldaGarcia/tsconfig.json`       | `"@websites/config/tsconfig.base.json"`      | Package reference | ✅ Correct          |
| `apps/personalpage/tsconfig.json`        | `"@websites/config/tsconfig.base.json"`      | Package reference | ✅ Correct          |
| `apps/templatepage/tsconfig.json`        | `"@websites/config/tsconfig.base.json"`      | Package reference | ✅ Correct          |
| `packages/infrastructure/tsconfig.json`  | `"../../packages/config/tsconfig.base.json"` | Relative          | ⚠️ Inconsistent     |
| `packages/config-tailwind/tsconfig.json` | `"../config/tsconfig.base.json"`             | Relative          | ⚠️ Inconsistent     |
| `packages/ui/tsconfig.json`              | `"../../packages/config/tsconfig.base.json"` | Relative          | ⚠️ Inconsistent     |
| `packages/test-utils/tsconfig.json`      | `"../../packages/config/tsconfig.base.json"` | Relative          | ⚠️ Inconsistent     |

---

## Critical Issue: `ittweb` Has Diverged Base Config

### The Problem

`apps/ittweb/config/tsconfig.base.json` is a **local copy** that has diverged from the shared `packages/config/tsconfig.base.json`. This creates:

1. **Maintenance debt**: Changes to shared config don't apply to `ittweb`
2. **Inconsistency risk**: `ittweb` may behave differently than other apps
3. **Migration risk**: If `ittweb` directory structure changes, config breaks

### Detailed Comparison

#### Shared Base Config (`packages/config/tsconfig.base.json`)

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }]
  },
  "exclude": ["node_modules"]
}
```

#### `ittweb` Local Base Config (`apps/ittweb/config/tsconfig.base.json`)

```json
{
  "compilerOptions": {
    "target": "es2015", // ❌ Different: es5 vs es2015
    "downlevelIteration": true, // ❌ Extra: not in shared
    "lib": ["dom", "dom.iterable", "es6"], // ❌ Different: es6 vs esnext
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "types": ["jest", "@testing-library/jest-dom"], // ❌ Extra: test types in base
    "plugins": [{ "name": "next" }],
    "baseUrl": ".", // ❌ Extra: should be in app config
    "paths": {
      /* ... */
    } // ❌ Extra: should be in app config
  },
  "exclude": ["node_modules", "external/**"] // ❌ Different exclude
}
```

### Impact of Differences

| Setting                        | Shared             | ittweb                            | Impact                                                                      |
| ------------------------------ | ------------------ | --------------------------------- | --------------------------------------------------------------------------- |
| `target: "es5"` vs `"es2015"`  | es5                | es2015                            | **Medium**: Different transpilation targets may cause runtime differences   |
| `lib: ["esnext"]` vs `["es6"]` | esnext             | es6                               | **High**: Missing modern JS features (async/await, optional chaining, etc.) |
| `downlevelIteration`           | Not set            | true                              | **Low**: May affect for...of loops, but usually not needed with es2015+     |
| `types` in base                | Not set            | jest types                        | **Low**: Test types should be in test configs, not base                     |
| `baseUrl`/`paths` in base      | Not set            | Set                               | **Low**: Should be in app config, but works                                 |
| `exclude`                      | `["node_modules"]` | `["node_modules", "external/**"]` | **Low**: App-specific exclude is fine                                       |

**Critical Finding**: The `lib: ["es6"]` vs `["esnext"]` difference is significant. `ittweb` may not have access to modern JavaScript features that other apps have.

---

## Secondary Issue: Package Configs Use Relative Paths

### The Problem

All packages use relative paths instead of package references:

- `packages/infrastructure`: `"../../packages/config/tsconfig.base.json"`
- `packages/config-tailwind`: `"../config/tsconfig.base.json"`
- `packages/ui`: `"../../packages/config/tsconfig.base.json"`
- `packages/test-utils`: `"../../packages/config/tsconfig.base.json"`

### Analysis

**Is this actually a problem?**

For **packages** (not apps), relative paths are acceptable because:

1. Packages are not published, so package references aren't required
2. Relative paths work reliably within the monorepo
3. TypeScript resolves relative paths correctly

However, **consistency** is still valuable:

- If packages are ever extracted or moved, relative paths break
- Package references (`@websites/config`) are more explicit and self-documenting
- Matches the pattern used by apps

**Verdict**: Low priority, but should be standardized for consistency.

---

## Risks

### High Risk

1. **Feature availability**: `ittweb` uses `lib: ["es6"]` which may not support modern JS features available to other apps
2. **Maintenance debt**: Changes to shared config don't apply to `ittweb`, requiring manual updates

### Medium Risk

1. **Build inconsistency**: Different compiler targets may cause different runtime behavior
2. **Migration fragility**: Relative paths in `ittweb` break if directory structure changes

### Low Risk

1. **Package relative paths**: Work fine but are inconsistent with app patterns

---

## Fix Plan

### Phase 1: Fix `ittweb` Base Config (High Priority)

**Goal**: Make `ittweb` use the shared base config like other apps.

**Steps**:

1. **Audit `ittweb` for es6 vs esnext dependencies**
   - Check if `ittweb` code uses features requiring `esnext` lib
   - Verify if `es2015` target is intentional or legacy

2. **Update shared base config** (if needed)
   - If `ittweb` legitimately needs `es2015` target, consider if shared config should change
   - If `ittweb` needs `downlevelIteration`, add to shared config
   - **Recommendation**: Update shared config to `target: "es2015"` and `lib: ["dom", "dom.iterable", "esnext"]` (modern standard)

3. **Remove local base config**
   - Delete `apps/ittweb/config/tsconfig.base.json`
   - Update `apps/ittweb/tsconfig.json` to extend `"@websites/config/tsconfig.base.json"`

4. **Move app-specific settings to app config**
   - Keep `baseUrl` and `paths` in `apps/ittweb/tsconfig.json` (already there)
   - Move test types to test-specific config if needed
   - Keep `exclude: ["node_modules", ".next", "src/pages/**/__tests__/**"]` in app config

5. **Update nested configs**
   - `apps/ittweb/scripts/replay-metadata-parser/tsconfig.json` extends `"../../config/tsconfig.base.json"` (will break)
   - Update to extend `"@websites/config/tsconfig.base.json"` OR create a separate base for scripts

6. **Test**
   - Run `pnpm --filter ittweb type-check`
   - Verify no new type errors
   - Check IDE TypeScript language server works correctly

**Estimated Time**: 1-2 hours

---

### Phase 2: Standardize Package Configs (Low Priority)

**Goal**: Use package references in package configs for consistency.

**Steps**:

1. Update each package `tsconfig.json`:
   - `packages/infrastructure/tsconfig.json`: Change to `"@websites/config/tsconfig.base.json"`
   - `packages/config-tailwind/tsconfig.json`: Change to `"@websites/config/tsconfig.base.json"`
   - `packages/ui/tsconfig.json`: Change to `"@websites/config/tsconfig.base.json"`
   - `packages/test-utils/tsconfig.json`: Change to `"@websites/config/tsconfig.base.json"`

2. Verify `@websites/config` package.json exports `tsconfig.base.json` correctly (already done)

3. Test each package:
   - Run `pnpm --filter <package> type-check` for each

**Estimated Time**: 30 minutes

---

## Recommended Changes

### Change 1: Update Shared Base Config

Update `packages/config/tsconfig.base.json` to modern standards:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig.json",
  "compilerOptions": {
    "target": "es2015", // Changed from es5
    "lib": ["dom", "dom.iterable", "esnext"], // Keep esnext (modern)
    "downlevelIteration": true, // Add if needed for compatibility
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "exclude": ["node_modules"],
  "_comment": "Apps should extend this config and add their own paths. Common workspace paths pattern: @websites/* packages should map to ../../packages/*/src"
}
```

### Change 2: Update `ittweb` to Use Shared Config

Update `apps/ittweb/tsconfig.json`:

```json
{
  "extends": "@websites/config/tsconfig.base.json", // Changed from relative path
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/shared/*": ["src/features/modules/shared/*"],
      "@/features/*": ["./src/features/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/config/*": ["./src/config/*"],
      "@websites/config-tailwind": ["../../packages/config-tailwind/src"],
      "@websites/config-tailwind/*": ["../../packages/config-tailwind/src/*"]
    },
    "types": ["jest", "@testing-library/jest-dom"] // Add test types here if needed
  },
  "include": [
    "next-env.d.ts",
    "src/**/*.ts",
    "src/**/*.tsx",
    "__tests__/jest-dom.d.ts",
    "__tests__/**/*.ts",
    "__tests__/**/*.tsx",
    ".next/types/**/*.ts",
    "next.config.ts",
    "tailwind.config.ts"
  ],
  "exclude": ["node_modules", ".next", "src/pages/**/__tests__/**"]
}
```

### Change 3: Delete Local Base Config

Delete `apps/ittweb/config/tsconfig.base.json` (no longer needed)

### Change 4: Update Nested Config

Update `apps/ittweb/scripts/replay-metadata-parser/tsconfig.json`:

```json
{
  "extends": "@websites/config/tsconfig.base.json", // Changed from relative path
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "./src",
    "outDir": "./dist",
    "noEmit": false,
    "declaration": false,
    "sourceMap": true,
    "resolveJsonModule": true,
    "allowJs": false,
    "types": ["node"],
    "composite": false
  },
  "include": ["./src/**/*.ts", "./src/**/*.d.ts"],
  "exclude": ["./dist", "./__tests__"]
}
```

---

## Testing Checklist

After making changes, verify:

- [ ] `pnpm --filter ittweb type-check` passes
- [ ] `pnpm --filter MafaldaGarcia type-check` passes (regression test)
- [ ] `pnpm --filter personalpage type-check` passes (regression test)
- [ ] `pnpm --filter templatepage type-check` passes (regression test)
- [ ] `pnpm --filter @websites/infrastructure type-check` passes
- [ ] `pnpm --filter @websites/ui type-check` passes
- [ ] `pnpm --filter @websites/test-utils type-check` passes
- [ ] IDE TypeScript language server works in `ittweb`
- [ ] IDE TypeScript language server works in other apps
- [ ] Builds still work: `pnpm --filter ittweb build`

---

## Migration Notes

### Why Did This Happen?

The `ittweb` local base config likely existed before the shared `@websites/config` package was created. When the shared config was introduced, `ittweb` was not migrated, creating the inconsistency.

### Breaking Changes Risk

**Low**: Changing `extends` path should not break anything if the shared config is compatible. However:

- If shared config has different settings, type errors may appear
- IDE may need to reload TypeScript server
- Build cache may need clearing

### Rollback Plan

If issues arise:

1. Restore `apps/ittweb/config/tsconfig.base.json` from git history
2. Revert `apps/ittweb/tsconfig.json` extends path
3. Investigate incompatibilities
4. Update shared config or `ittweb` config as needed

---

## Conclusion

The main issue is `ittweb` using a local base config that has diverged from the shared standard. Fixing this will:

- ✅ Ensure all apps use the same TypeScript compiler settings
- ✅ Reduce maintenance burden (one config to update)
- ✅ Prevent future divergence
- ✅ Improve consistency across the monorepo

The package relative paths are a lower priority consistency issue but should be addressed for completeness.
