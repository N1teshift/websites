# Monorepo Review - websites/

**Review Date:** 2024  
**Overall Score: 7.5/10**

## Executive Summary

This is a well-structured monorepo with good foundational tooling and clear separation of concerns. The migration from separate repositories appears to have been executed thoughtfully, with shared packages for infrastructure, UI components, and configuration. However, there are several areas where consistency, testing rigor, and documentation maintenance could be improved to enhance long-term maintainability.

---

## What's Done Well ✅

### 1. **Monorepo Structure & Organization**

- **Clear separation**: Well-organized `apps/` and `packages/` structure
- **Logical grouping**: Shared infrastructure, UI components, and configs are properly extracted
- **Package naming**: Consistent `@websites/*` namespace convention
- **Workspace setup**: Proper pnpm workspace configuration

### 2. **Build System & Tooling**

- **Turborepo integration**: Excellent use of Turborepo for task orchestration and caching
- **Dependency management**: pnpm with workspace protocol (`workspace:*`) for internal packages
- **Version pinning**: Critical dependencies (Next.js) are pinned via root `package.json` overrides
- **Package manager lock**: Single `pnpm-lock.yaml` ensures reproducible installs

### 3. **Shared Packages Architecture**

- **Infrastructure package**: Well-designed with proper exports for i18n, logging, auth, Firebase, etc.
- **UI package**: Shared components reduce duplication
- **Config packages**: ESLint, Prettier, Tailwind, and TypeScript configs are centralized
- **Test utilities**: Shared test setup and mocks

### 4. **Developer Experience**

- **Pre-commit hooks**: Husky + lint-staged for code quality
- **Formatting**: Prettier configured and enforced
- **TypeScript**: Consistent TypeScript usage across apps
- **Scripts**: Root-level scripts for common operations (`dev`, `build`, `lint`, `test`)

### 5. **CI/CD Pipeline**

- **Comprehensive workflow**: Quality checks, testing, and builds
- **Parallel execution**: Jobs run in parallel for efficiency
- **Artifact management**: Build artifacts and test results are preserved
- **Changeset validation**: Automated changeset checking on PRs

### 6. **Documentation**

- **Extensive docs**: Large `docs/` folder with migration guides and setup instructions
- **Root README**: Clear getting started guide
- **Package READMEs**: Individual packages have documentation
- **Migration history**: Good documentation of consolidation efforts

### 7. **Version Management**

- **Changesets**: Proper versioning workflow with Changesets
- **App exclusions**: Apps correctly excluded from versioning (private apps)

---

## What's Problematic or Risky ⚠️

### 1. **Testing Strategy (HIGH PRIORITY)**

- **Non-blocking tests**: Tests can fail but CI still passes (`continue-on-error: true`)
- **Inconsistent coverage**: Some apps have extensive tests (ittweb), others may have minimal coverage
- **No coverage thresholds**: No minimum coverage requirements enforced
- **Test utilities**: `@websites/test-utils` has React as dev dependency instead of peer dependency
- **Risk**: Technical debt accumulates, regressions go unnoticed

### 2. **Configuration Inconsistencies (MEDIUM PRIORITY)**

- **ESLint configs**: Not all apps may have `eslint.config.js` files (grep found none in apps/)
- **Prettier configs**: Inconsistent `.prettierrc.json` presence across apps
- **TypeScript paths**: Different path alias patterns across apps (e.g., `@/*` vs `@lib/*` vs `@utils/*`)
- **Next.js configs**: Different configuration patterns (some use `.ts`, some may use `.js`)
- **Risk**: Developer confusion, inconsistent code style, harder onboarding

### 3. **Dependency Management (MEDIUM PRIORITY)**

- **Duplication**: Common dependencies still duplicated:
  - `date-fns` in multiple apps
  - `autoprefixer`, `postcss`, `tailwindcss` in each app
  - `@types/*` packages repeated
- **Infrastructure package**: Has React as both `peerDependencies` and `devDependencies`
- **UI package**: Has Next.js as dependency (should be peer dependency)
- **Risk**: Bundle size bloat, version conflicts, harder updates

### 4. **Documentation Maintenance (LOW-MEDIUM PRIORITY)**

- **Migration docs**: Many docs appear to be from migration phase (e.g., `ittweb-consolidation-*.md`)
- **Outdated content**: Some docs may reference old patterns or completed migrations
- **No ADRs**: Missing Architecture Decision Records for major decisions
- **Risk**: Confusion about current state, outdated guidance

### 5. **Environment Variable Management (MEDIUM PRIORITY)**

- **No clear strategy**: `.env` files found in apps but no documented approach
- **No validation**: No clear validation of required env vars at build time
- **Secrets management**: No documented approach for secrets in CI/CD
- **Risk**: Deployment failures, security issues, configuration drift

### 6. **Script Inconsistencies (LOW PRIORITY)**

- **App-specific scripts**: `personalpage` has many custom scripts (e.g., `test:openai`, `migrate:weekly-to-classwork`)
- **Different patterns**: Apps have different script naming conventions
- **Risk**: Harder to discover available commands, inconsistent developer experience

### 7. **TypeScript Configuration (LOW PRIORITY)**

- **Path alias inconsistency**:
  - `ittweb` uses `@lib/*`, `@utils/*`, `@math/*`, etc.
  - `personalpage` uses `@/*`, `@lib/*`, `@utils/*`, `@math/*`, etc.
  - Different patterns make it harder to share code
- **Base config**: Some apps extend `./config/tsconfig.base.json`, others extend `@websites/config/tsconfig.base.json`
- **Risk**: Confusion when moving code between apps, harder refactoring

### 8. **Build Verification (LOW PRIORITY)**

- **Manual checks**: CI has manual build artifact verification (checking for `.next` directories)
- **No size analysis**: No bundle size tracking or alerts
- **Risk**: Performance regressions go unnoticed

---

## Specific, Prioritized Improvements

### 🔴 **CRITICAL (Do First)**

#### 1. **Make Tests Blocking in CI**

**File**: `.github/workflows/ci.yml`  
**Action**: Remove `continue-on-error: true` from test job, or make it conditional based on test coverage thresholds.

```yaml
# Current (line 70):
continue-on-error: true

# Should be:
continue-on-error: false  # Or remove entirely
```

**Impact**: Prevents regressions from being merged.

---

#### 2. **Fix Test Utilities Package Dependencies**

**File**: `packages/test-utils/package.json`  
**Action**: Move React/React-DOM to `peerDependencies` instead of `devDependencies`.

```json
{
  "peerDependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    // Remove react and react-dom from here
  }
}
```

**Impact**: Prevents version conflicts, follows npm best practices.

---

#### 3. **Standardize ESLint Configuration**

**Action**:

- Ensure all apps have `eslint.config.js` files
- Verify they extend `@websites/eslint-config`
- Add a script to validate ESLint config presence

**Impact**: Consistent linting across all apps.

---

### 🟠 **HIGH PRIORITY (Do Soon)**

#### 4. **Consolidate Common Dependencies**

**Action**: Move frequently duplicated dependencies to shared packages:

- `date-fns` → `@websites/infrastructure` (or create `@websites/utils`)
- `autoprefixer`, `postcss`, `tailwindcss` → Consider a `@websites/config-postcss` package
- `@types/*` packages → Keep in apps (TypeScript requirement)

**Impact**: Reduced bundle size, easier updates, single source of truth.

---

#### 5. **Fix Infrastructure Package Dependencies**

**File**: `packages/infrastructure/package.json`  
**Action**: Remove React from `devDependencies` (keep only in `peerDependencies`).

**Impact**: Prevents accidental React version conflicts.

---

#### 6. **Add Test Coverage Thresholds**

**Action**:

- Add coverage thresholds to Jest configs
- Enforce minimum coverage in CI
- Add coverage reporting (e.g., Codecov)

**Example**:

```javascript
coverageThresholds: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

**Impact**: Maintains code quality, prevents coverage regression.

---

#### 7. **Document Environment Variable Strategy**

**Action**: Create `docs/ENVIRONMENT_VARIABLES.md` with:

- Required vs optional variables per app
- Validation approach
- Secrets management (Vercel, GitHub Secrets)
- Example `.env.example` files for each app

**Impact**: Prevents deployment failures, improves onboarding.

---

### 🟡 **MEDIUM PRIORITY (Plan For)**

#### 8. **Standardize TypeScript Path Aliases**

**Action**:

- Create a convention document for path aliases
- Consider using a shared alias pattern (e.g., `@/features/*`, `@/lib/*`, `@/utils/*`)
- Gradually migrate apps to consistent patterns

**Impact**: Easier code sharing, better developer experience.

---

#### 9. **Clean Up Documentation**

**Action**:

- Archive or remove migration-specific docs
- Create a `docs/ARCHIVE/` folder for historical reference
- Update main README to reference current patterns only
- Add Architecture Decision Records (ADRs) for major decisions

**Impact**: Clearer documentation, easier onboarding.

---

#### 10. **Add Bundle Size Analysis**

**Action**:

- Add `@next/bundle-analyzer` to CI (already in some apps)
- Track bundle sizes over time
- Set size budgets and fail CI if exceeded

**Impact**: Prevents performance regressions.

---

#### 11. **Standardize Script Naming**

**Action**:

- Document standard script names in root README
- Consider creating a script naming convention
- Keep app-specific scripts but document them

**Impact**: Better developer experience, easier discovery.

---

### 🟢 **LOW PRIORITY (Nice to Have)**

#### 12. **Add Pre-commit Type Checking**

**Action**: Add `type-check` to lint-staged for changed files (may be slow, consider caching).

**Impact**: Catches type errors before commit.

---

#### 13. **Create App Template Generator**

**Action**: Create a script or template (enhance `templatepage`) to generate new apps with all configs pre-setup.

**Impact**: Faster app creation, ensures consistency.

---

#### 14. **Add Dependency Update Automation**

**Action**:

- Use Dependabot (already configured) more aggressively
- Consider Renovate for more control
- Add automated security updates

**Impact**: Keeps dependencies up-to-date, reduces security risk.

---

#### 15. **Improve Turborepo Remote Caching**

**Action**:

- Document remote caching setup
- Ensure team members use it
- Monitor cache hit rates

**Impact**: Faster CI/CD, better developer experience.

---

## Additional Observations

### Positive Patterns

- Good use of workspace protocol for internal dependencies
- Proper use of `peerDependencies` in shared packages
- Comprehensive CI/CD pipeline
- Good separation of concerns in package structure

### Areas for Future Consideration

- **Micro-frontends**: If apps grow, consider module federation
- **Shared state management**: If needed, consider extracting to infrastructure package
- **API layer**: Consider shared API client patterns
- **Error boundaries**: Standardize error handling patterns

---

## Summary

This monorepo demonstrates solid engineering practices with good tooling choices and thoughtful architecture. The main areas for improvement are:

1. **Testing rigor** - Make tests blocking and add coverage thresholds
2. **Configuration consistency** - Standardize ESLint, Prettier, and TypeScript configs
3. **Dependency consolidation** - Reduce duplication of common dependencies
4. **Documentation maintenance** - Clean up migration docs and add ADRs

With these improvements, this monorepo would score **9/10** and be production-ready for long-term maintenance.

---

**Reviewer Notes:**

- Review based on code structure, configuration files, and documentation
- No runtime testing performed
- Recommendations are based on industry best practices for monorepo management
