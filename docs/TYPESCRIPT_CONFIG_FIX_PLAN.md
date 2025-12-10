# TypeScript Config Fix Plan - Actionable Steps

## Quick Summary

**Problem**: `ittweb` uses a local base config with outdated settings (`lib: ["es6"]`) while the codebase uses modern JS features (optional chaining, nullish coalescing, async/await) that require `esnext`.

**Solution**: Migrate `ittweb` to use the shared `@websites/config/tsconfig.base.json` which has the correct `lib: ["esnext"]` setting.

**Evidence**:

- `ittweb` has 345 uses of optional chaining (`?.`)
- `ittweb` has 146 uses of nullish coalescing (`??`)
- `ittweb` has 983 uses of async/await
- These features require `esnext` lib, not `es6`

---

## Step-by-Step Fix

### Step 1: Verify Current State

```bash
# Check current type-check status
cd apps/ittweb
pnpm type-check

# Verify it works (should pass)
```

### Step 2: Update Shared Base Config (if needed)

The shared config already has `lib: ["esnext"]` which is correct. However, we should update `target` from `es5` to `es2015` to match what `ittweb` currently uses (and is more modern).

**File**: `packages/config/tsconfig.base.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig.json",
  "compilerOptions": {
    "target": "es2015", // Change from "es5"
    "lib": ["dom", "dom.iterable", "esnext"],
    "downlevelIteration": true, // Add this (ittweb has it)
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

### Step 3: Update `ittweb/tsconfig.json`

**File**: `apps/ittweb/tsconfig.json`

Change the `extends` line from:

```json
"extends": "./config/tsconfig.base.json",
```

To:

```json
"extends": "@websites/config/tsconfig.base.json",
```

Full updated file:

```json
{
  "extends": "@websites/config/tsconfig.base.json",
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
    "types": ["jest", "@testing-library/jest-dom"]
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

### Step 4: Update Nested Config

**File**: `apps/ittweb/scripts/replay-metadata-parser/tsconfig.json`

Change the `extends` line from:

```json
"extends": "../../config/tsconfig.base.json",
```

To:

```json
"extends": "@websites/config/tsconfig.base.json",
```

### Step 5: Delete Local Base Config

```bash
# Delete the local base config (no longer needed)
rm apps/ittweb/config/tsconfig.base.json
```

### Step 6: Test

```bash
# Test ittweb type-check
cd apps/ittweb
pnpm type-check

# Test other apps (regression test)
cd ../MafaldaGarcia
pnpm type-check

cd ../personalpage
pnpm type-check

cd ../templatepage
pnpm type-check

# Test from root
cd ../..
pnpm type-check
```

### Step 7: Verify IDE

1. Open `apps/ittweb` in your IDE
2. Reload TypeScript language server (VS Code: Cmd/Ctrl+Shift+P → "TypeScript: Restart TS Server")
3. Verify no new type errors appear
4. Check that IntelliSense still works

---

## Optional: Standardize Package Configs

If you want to standardize package configs too (lower priority):

### Update Package Configs

For each package, change relative paths to package references:

**packages/infrastructure/tsconfig.json**:

```json
{
  "extends": "@websites/config/tsconfig.base.json", // Changed
  "compilerOptions": {
    "baseUrl": ".",
    "rootDir": ".",
    "outDir": "./dist",
    "downlevelIteration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**packages/config-tailwind/tsconfig.json**:

```json
{
  "extends": "@websites/config/tsconfig.base.json", // Changed
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**packages/ui/tsconfig.json**:

```json
{
  "extends": "@websites/config/tsconfig.base.json", // Changed
  "compilerOptions": {
    "baseUrl": ".",
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**packages/test-utils/tsconfig.json**:

```json
{
  "extends": "@websites/config/tsconfig.base.json", // Changed
  "compilerOptions": {
    "baseUrl": ".",
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Rollback Plan

If issues arise:

```bash
# Restore local base config
git checkout HEAD -- apps/ittweb/config/tsconfig.base.json

# Revert tsconfig.json changes
git checkout HEAD -- apps/ittweb/tsconfig.json
git checkout HEAD -- apps/ittweb/scripts/replay-metadata-parser/tsconfig.json
```

---

## Expected Outcomes

After this fix:

✅ All apps use the same TypeScript base configuration  
✅ `ittweb` correctly supports modern JS features (optional chaining, nullish coalescing)  
✅ Future changes to shared config automatically apply to all apps  
✅ Consistent configuration patterns across the monorepo  
✅ Reduced maintenance burden (one config to maintain)

---

## Time Estimate

- **Core fix** (ittweb only): 30-60 minutes
- **Full standardization** (including packages): 1-2 hours
- **Testing**: 15-30 minutes

**Total**: 1-2.5 hours depending on scope
