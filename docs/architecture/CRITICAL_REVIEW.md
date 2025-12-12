# Critical Infrastructure Review: websites Monorepo

**Review Date:** January 2025  
**Focus:** Areas close to best practices but falling short due to small gaps, inconsistencies, or missing pieces

---

## Executive Summary

This monorepo demonstrates strong foundational architecture and tooling choices. However, several areas that are **very close to excellent** are held back by small but critical gaps. This review identifies these near-misses and proposes minimal, concrete changes to elevate them to robust, production-grade solutions.

---

## 1. Package Export Strategy: Almost Perfect, But Inconsistent

### What's Done Well ✅

- **Excellent subpath exports**: `@websites/infrastructure` uses comprehensive `exports` field with subpath exports (`./api`, `./firebase`, `./i18n`, etc.)
- **Proper TypeScript support**: All packages correctly set `types` field
- **Workspace protocol**: Consistent use of `workspace:*` for internal dependencies

### What's Preventing It From Being 'Very Good' ⚠️

- **Inconsistent main entry points**:
  - Most packages use `"./src/index.ts"` as main (correct for source-based packages)
  - `@websites/config` uses `"index.js"` which doesn't exist (broken reference)
  - `@websites/prettier-config` uses `".prettierrc.json"` (works but unconventional)
- **Missing build step**: Packages export TypeScript source directly, which works but:
  - No type-only exports for better tree-shaking
  - No compiled output for potential performance benefits
  - Inconsistent with some apps expecting compiled code

### Concrete, Minimal Changes

**1. Fix `@websites/config` package.json:**

```json
{
  "main": "./tsconfig.base.json", // Or remove main entirely if not needed
  "files": ["tsconfig.base.json"]
}
```

**2. Add `typesVersions` for better TypeScript resolution:**

```json
// In packages/infrastructure/package.json
{
  "typesVersions": {
    "*": {
      "api": ["./src/api/index.ts"],
      "firebase": ["./src/firebase/index.ts"]
      // ... other subpaths
    }
  }
}
```

**3. Consider adding `exports` with `types` condition:**

```json
{
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./api": {
      "types": "./src/api/index.ts",
      "default": "./src/api/index.ts"
    }
  }
}
```

**Impact:** Better IDE support, clearer package contracts, prevents runtime errors.

---

## 2. TypeScript Configuration: Strong Base, Missing Standardization

### What's Done Well ✅

- **Base config exists**: `@websites/config/tsconfig.base.json` provides solid foundation
- **Consistent strict mode**: All configs use `strict: true`
- **Modern module resolution**: Using `bundler` resolution (correct for Next.js)
- **Apps extend base**: Both `ittweb` and `personalpage` extend the base config

### What's Preventing It From Being 'Very Good' ⚠️

- **Path alias chaos**: Each app defines completely different path alias patterns:
  - `ittweb`: `@lib/*`, `@utils/*`, `@math/*` (no `@/` root alias)
  - `personalpage`: `@/*`, `@lib/*`, `@utils/*`, `@math/*`, `@ai/*` (mixed patterns)
  - `templatepage`: `@/*`, `@/features/*`, `@/utils/*` (most consistent)
- **No shared path alias package**: Each app manually maps workspace packages
- **Inconsistent workspace package mapping**: Some apps map `@websites/ui` to `../../packages/ui/src`, others might use different patterns
- **Missing path alias documentation in base config**: The comment exists but no actual shared paths

### Concrete, Minimal Changes

**1. Create shared path alias helper in base config:**

```json
// packages/config/tsconfig.base.json
{
  "compilerOptions": {
    // ... existing options
    "baseUrl": ".",
    "paths": {
      // Workspace packages - apps can extend this
      "@websites/ui": ["../../packages/ui/src"],
      "@websites/ui/*": ["../../packages/ui/src/*"],
      "@websites/infrastructure": ["../../packages/infrastructure/src"],
      "@websites/infrastructure/*": ["../../packages/infrastructure/src/*"],
      "@websites/config-tailwind": ["../../packages/config-tailwind/src"],
      "@websites/config-tailwind/*": ["../../packages/config-tailwind/src/*"]
    }
  }
}
```

**2. Standardize app path aliases (migration script):**
Create `scripts/standardize-path-aliases.js` that:

- Ensures all apps have `@/*` → `src/*`
- Standardizes feature paths to `@/features/*`
- Moves workspace mappings to base config

**3. Add path alias validation:**

```json
// In turbo.json, add a validation task
{
  "validate:paths": {
    "dependsOn": ["^build"],
    "outputs": []
  }
}
```

**Impact:** Consistent developer experience, easier code sharing between apps, reduced cognitive load.

---

## 3. Testing Infrastructure: Excellent Foundation, Missing Enforcement

### What's Done Well ✅

- **Shared test utilities**: `@websites/test-utils` provides base Jest config
- **Proper peer dependencies**: Test utils correctly use React as peer dependency
- **Comprehensive test scripts**: Apps have good test script coverage
- **Base config is solid**: `jest.config.base.js` has sensible defaults

### What's Preventing It From Being 'Very Good' ⚠️

- **Tests are non-blocking**: CI allows test failures (`continue-on-error: true`)
- **No coverage thresholds**: No minimum coverage requirements
- **Inconsistent Jest configs**: Apps may not all extend base config consistently
- **No coverage reporting**: No integration with coverage services
- **Missing test utilities**: No shared test helpers, mocks, or fixtures beyond base config

### Concrete, Minimal Changes

**1. Make tests blocking (with grace period):**

```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: pnpm test
  # Remove: continue-on-error: true
  # Add comment: "Tests must pass. If temporarily failing, add skip-ci label."
```

**2. Add coverage thresholds to base config:**

```javascript
// packages/test-utils/jest.config.base.js
module.exports = {
  // ... existing config
  coverageThreshold: {
    global: {
      branches: 60, // Start conservative
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};
```

**3. Add coverage reporting to CI:**

```yaml
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
    flags: unittests
    fail_ci_if_error: false # Start soft, then enforce
```

**4. Create shared test helpers:**

```typescript
// packages/test-utils/src/helpers.ts
export const createMockUser = () => ({ ... });
export const renderWithProviders = (component) => { ... };
// etc.
```

**Impact:** Prevents quality regression, provides visibility into test health, encourages test writing.

---

## 4. Dependency Management: Smart Choices, Small Oversights

### What's Done Well ✅

- **Workspace protocol**: Consistent `workspace:*` usage
- **Version pinning**: Next.js pinned at root level
- **Peer dependencies**: Infrastructure package correctly uses peers for React/Next
- **Single lockfile**: `pnpm-lock.yaml` ensures reproducibility

### What's Preventing It From Being 'Very Good' ⚠️

- **UI package dependency issue**: `@websites/ui` has Next.js in `dependencies` instead of `peerDependencies`
- **Duplicate build tools**: `autoprefixer`, `postcss`, `tailwindcss` in every app
- **No dependency audit automation**: Dependabot exists but no automated security scanning
- **Missing dependency documentation**: No clear policy on when to add dependencies vs. use shared packages

### Concrete, Minimal Changes

**1. Fix UI package (critical):**

```json
// packages/ui/package.json
{
  "dependencies": {
    // Remove "next": "15.5.7"
    "react": "^18.3.1",
    "react-dom": "^18.2.0"
    // ... other deps
  },
  "peerDependencies": {
    "@websites/infrastructure": "workspace:*",
    "next": "^15.0.0" // Add here
  }
}
```

**2. Create build tools package (optional but recommended):**

```json
// packages/config-build-tools/package.json (new)
{
  "name": "@websites/config-build-tools",
  "dependencies": {
    "autoprefixer": "^10.4.21",
    "postcss": "^8",
    "tailwindcss": "^3.4.1"
  }
}
```

Then apps use: `"@websites/config-build-tools": "workspace:*"` and import configs.

**3. Add dependency policy to README:**

```markdown
## Dependency Management

- **Shared packages**: Use `@websites/*` packages for common functionality
- **App-specific**: Only add dependencies unique to that app
- **Build tools**: Prefer shared config packages when possible
- **Version conflicts**: Use root `pnpm.overrides` to resolve
```

**4. Add automated security scanning:**

```yaml
# .github/workflows/security.yml
- name: Run npm audit
  run: pnpm audit --audit-level=moderate
```

**Impact:** Prevents version conflicts, reduces bundle size, clearer dependency ownership.

---

## 5. CI/CD Pipeline: Comprehensive But Not Enforcing

### What's Done Well ✅

- **Comprehensive checks**: Quality, tests, builds, bundle size, changesets
- **Parallel execution**: Jobs run efficiently
- **Artifact management**: Build artifacts preserved
- **Bundle size tracking**: PR comments with bundle analysis

### What's Preventing It From Being 'Very Good' ⚠️

- **Non-blocking tests**: Tests can fail without blocking merge
- **Soft bundle size checks**: Bundle size warnings don't fail CI
- **No deployment automation**: No automatic deployments on merge
- **Missing status checks**: No required status checks configured
- **No PR templates**: No standardized PR process

### Concrete, Minimal Changes

**1. Make quality gates blocking:**

```yaml
# .github/workflows/ci.yml
jobs:
  quality:
    # Remove any continue-on-error
    # Add: if: failure() then exit 1

  test:
    # Remove: continue-on-error: true
    # Change check to: if: steps.test.outcome == 'failure' then exit 1
```

**2. Add required status checks:**

```yaml
# .github/branch-protection.yml (or via GitHub UI)
required_status_checks:
  - quality
  - test
  - build
  - changeset # On PRs only
```

**3. Add deployment workflow:**

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]
jobs:
  deploy:
    # Deploy each app that changed
    # Use turbo to determine which apps changed
```

**4. Create PR template:**

```markdown
# .github/pull_request_template.md

## Changes

- [ ] Breaking change
- [ ] Requires changeset

## Testing

- [ ] Tests pass
- [ ] Manual testing completed
```

**Impact:** Prevents bad code from merging, ensures quality standards, faster deployments.

---

## 6. Build System: Excellent Setup, Missing Optimizations

### What's Done Well ✅

- **Turborepo integration**: Proper task dependencies and caching
- **Output configuration**: Correct output paths for Next.js builds
- **Remote caching**: Support for Turbo remote cache
- **Task orchestration**: Proper `dependsOn` configuration

### What's Preventing It From Being 'Very Good' ⚠️

- **No build verification in turbo**: Manual verification script exists but not in turbo pipeline
- **Missing build size tracking**: No automatic tracking of build output sizes
- **No build time tracking**: No visibility into which packages are slow to build
- **Cache configuration**: No documentation on cache strategy
- **Missing build artifacts**: No standardized artifact collection

### Concrete, Minimal Changes

**1. Add build verification to turbo:**

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
      "env": ["NODE_ENV"],
      "outputLogs": "new-only"
    },
    "verify:build": {
      "dependsOn": ["build"],
      "cache": false,
      "outputs": []
    }
  }
}
```

**2. Add build metrics:**

```json
{
  "tasks": {
    "build": {
      // ... existing
      "outputLogs": "new-only",
      "persistent": false
    }
  }
}
```

**3. Document cache strategy:**

```markdown
# docs/BUILD_CACHING.md

## Turborepo Cache Strategy

- **What's cached**: Build outputs, test results, type-check results
- **Cache keys**: Based on source files, dependencies, env vars
- **Remote cache**: Configured via TURBO_TOKEN
- **Cache invalidation**: Automatic on source changes
```

**4. Add build size tracking:**

```javascript
// scripts/track-build-sizes.js
// Run after build, track .next folder sizes
// Compare to previous builds
// Fail if size increases significantly
```

**Impact:** Faster builds, better visibility, prevents build regressions.

---

## 7. Documentation: Extensive But Needs Curation

### What's Done Well ✅

- **Comprehensive docs**: Extensive documentation in `docs/` folder
- **Package READMEs**: Each package has documentation
- **Environment variables**: Well-documented in `ENVIRONMENT_VARIABLES.md`
- **Migration guides**: Good historical documentation

### What's Preventing It From Being 'Very Good' ⚠️

- **Documentation bloat**: Many migration-specific docs that are no longer relevant
- **No ADRs**: Missing Architecture Decision Records
- **Outdated content**: Some docs may reference old patterns
- **No documentation standards**: No clear structure for where docs belong
- **Missing quick start**: README is comprehensive but could use a "5-minute quick start"

### Concrete, Minimal Changes

**1. Archive migration docs:**

```bash
# Move completed migration docs
mv docs/ittweb-consolidation-*.md docs/ARCHIVE/
mv docs/ittweb-migration-summary.md docs/ARCHIVE/
# Update docs/ARCHIVE/README.md with descriptions
```

**2. Create ADR template:**

```markdown
# docs/ADRs/template.md

# ADR-XXX: [Title]

## Status

[Proposed | Accepted | Deprecated | Superseded]

## Context

...

## Decision

...

## Consequences

...
```

**3. Add quick start to README:**

```markdown
## Quick Start (5 minutes)

1. `pnpm install`
2. `pnpm dev` (starts all apps)
3. Visit http://localhost:3000

For app-specific dev: `pnpm --filter personalpage dev`
```

**4. Create documentation index:**

```markdown
# docs/README.md

## Getting Started

- [Quick Start](../README.md#quick-start)
- [Environment Setup](./ENVIRONMENT_VARIABLES.md)

## Architecture

- [ADRs](./ADRs/)
- [Package Structure](../README.md#structure)

## Development

- [Scripts](./SCRIPT_NAMING_CONVENTIONS.md)
- [TypeScript Paths](./TYPESCRIPT_PATH_ALIASES.md)
```

**Impact:** Easier onboarding, clearer documentation structure, reduced confusion.

---

## 8. Environment Variable Management: Good Documentation, Missing Automation

### What's Done Well ✅

- **Comprehensive documentation**: `ENVIRONMENT_VARIABLES.md` is excellent
- **Validation exists**: `ittweb` has `validate:env` script
- **Environment files**: Proper `.env*.local` in `.gitignore`

### What's Preventing It From Being 'Very Good' ⚠️

- **Inconsistent validation**: Only one app has validation
- **No shared validation**: Each app would need to implement separately
- **No type safety**: No TypeScript types for environment variables
- **No documentation generation**: Docs are manually maintained

### Concrete, Minimal Changes

**1. Create shared env validation:**

```typescript
// packages/infrastructure/src/config/env.ts
export const validateEnv = (required: string[]) => {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }
};
```

**2. Add env types:**

```typescript
// packages/infrastructure/src/config/env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Shared env vars
      NODE_ENV: "development" | "production" | "test";
      // App-specific can extend
    }
  }
}
```

**3. Standardize validation in build:**

```json
// All apps' package.json
{
  "scripts": {
    "build": "pnpm validate:env && next build",
    "validate:env": "node scripts/validate-env.js"
  }
}
```

**4. Auto-generate env docs:**

```javascript
// scripts/generate-env-docs.js
// Parse .env.example files
// Generate markdown table
// Update ENVIRONMENT_VARIABLES.md
```

**Impact:** Prevents deployment failures, better DX, type safety.

---

## 9. Pre-commit Hooks: Good Setup, Could Be More Comprehensive

### What's Done Well ✅

- **Husky configured**: Pre-commit hooks via Husky
- **lint-staged**: Only runs on changed files
- **Formatting enforced**: Prettier runs on commit
- **Linting enforced**: ESLint runs on commit

### What's Preventing It From Being 'Very Good' ⚠️

- **No type checking**: Type errors can be committed
- **No test on changed files**: Tests aren't run pre-commit
- **No commit message validation**: No conventional commits enforcement
- **Slow on large changes**: No optimization for many files

### Concrete, Minimal Changes

**1. Add type checking (optional, may be slow):**

```json
// .lintstagedrc.json
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write",
    "bash -c 'tsc --noEmit --pretty false' || true" // Soft fail
  ]
}
```

**2. Add commit message linting:**

```bash
# .husky/commit-msg
npx --no -- commitlint --edit $1
```

**3. Optimize for performance:**

```json
// .lintstagedrc.json
{
  "*.{ts,tsx}": [
    {
      "command": "eslint --fix --max-warnings=0",
      "staged": true
    },
    "prettier --write"
  ]
}
```

**Impact:** Catches errors earlier, maintains code quality, faster feedback.

---

## 10. Package Structure: Well-Organized, Minor Inconsistencies

### What's Done Well ✅

- **Clear separation**: Apps vs packages is clear
- **Logical grouping**: Related functionality grouped
- **Consistent naming**: `@websites/*` namespace
- **Proper exports**: Good use of package.json exports

### What's Preventing It From Being 'Very Good' ⚠️

- **Config package inconsistency**: `@websites/config` has broken main field
- **Missing package descriptions**: No `description` fields in package.json
- **No package keywords**: Missing keywords for discoverability
- **Inconsistent file fields**: Some packages list files, others don't

### Concrete, Minimal Changes

**1. Fix config package:**

```json
// packages/config/package.json
{
  "name": "@websites/config",
  "description": "Shared TypeScript and build configuration",
  "version": "1.0.0",
  "private": true,
  "files": ["tsconfig.base.json"],
  // Remove broken "main" field
  "exports": {
    "./tsconfig.base.json": "./tsconfig.base.json"
  }
}
```

**2. Add descriptions to all packages:**

```json
{
  "description": "Shared [purpose] for websites monorepo",
  "keywords": ["monorepo", "websites", "shared"]
}
```

**3. Standardize files field:**

```json
{
  "files": ["src/**/*", "README.md", "package.json"]
}
```

**Impact:** Better package discoverability, clearer package purposes, prevents errors.

---

## Summary: The Gap Between Good and Great

This monorepo is **very close to excellent**. The architecture is sound, tooling is modern, and practices are generally good. However, small gaps prevent it from being truly robust:

### Critical Gaps (Fix Immediately)

1. **UI package dependency** - Next.js should be peer dependency
2. **Config package** - Broken main field
3. **Non-blocking tests** - Tests should block CI

### High-Impact Gaps (Fix Soon)

4. **Path alias standardization** - Inconsistent patterns hurt DX
5. **Test coverage enforcement** - No thresholds or reporting
6. **Environment validation** - Only one app has it

### Quality-of-Life Gaps (Plan For)

7. **Documentation curation** - Archive migration docs
8. **Build optimization** - Add metrics and verification
9. **CI enforcement** - Make quality gates blocking
10. **Package metadata** - Add descriptions and keywords

### The Path Forward

With these minimal changes, this monorepo would transition from "good" (7.5/10) to "excellent" (9/10). The foundation is solid; these are polish items that elevate maintainability, developer experience, and long-term sustainability.

**Estimated effort:**

- Critical: 2-4 hours
- High-impact: 1-2 days
- Quality-of-life: 2-3 days

**ROI:** Very high - small changes, significant impact on maintainability and developer experience.
