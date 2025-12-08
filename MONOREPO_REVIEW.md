# Monorepo Review - websites/

**Review Date:** January 2025  
**Overall Score: 7.5/10**

## Executive Summary

This is a well-structured monorepo with solid foundational tooling and clear separation of concerns. The migration from separate repositories appears to have been executed thoughtfully, with shared packages for infrastructure, UI components, and configuration. However, there are several areas where consistency, testing rigor, dependency management, and documentation maintenance could be improved to enhance long-term maintainability.

---

## What's Done Well ✅

### 1. **Monorepo Structure & Organization**

- **Clear separation**: Well-organized `apps/` and `packages/` structure
- **Logical grouping**: Shared infrastructure, UI components, and configs are properly extracted
- **Package naming**: Consistent `@websites/*` namespace convention
- **Workspace setup**: Proper pnpm workspace configuration with `workspace:*` protocol
- **App isolation**: Each app can be developed and deployed independently

### 2. **Build System & Tooling**

- **Turborepo integration**: Excellent use of Turborepo for task orchestration and caching
- **Dependency management**: pnpm with workspace protocol (`workspace:*`) for internal packages
- **Version pinning**: Critical dependencies (Next.js) are pinned via root `package.json` overrides
- **Package manager lock**: Single `pnpm-lock.yaml` ensures reproducible installs
- **Task dependencies**: Proper `dependsOn` configuration in `turbo.json` ensures correct build order

### 3. **Shared Packages Architecture**

- **Infrastructure package**: Well-designed with proper exports for i18n, logging, auth, Firebase, etc.
- **UI package**: Shared components reduce duplication
- **Config packages**: ESLint, Prettier, Tailwind, and TypeScript configs are centralized
- **Test utilities**: Shared test setup and mocks via `@websites/test-utils`
- **Proper exports**: Good use of package.json `exports` field for subpath exports

### 4. **Developer Experience**

- **Pre-commit hooks**: Husky + lint-staged for code quality enforcement
- **Formatting**: Prettier configured and enforced across all apps
- **TypeScript**: Consistent TypeScript usage across apps
- **Scripts**: Root-level scripts for common operations (`dev`, `build`, `lint`, `test`)
- **ESLint consistency**: All apps have `eslint.config.js` files extending shared config ✅

### 5. **CI/CD Pipeline**

- **Comprehensive workflow**: Quality checks, testing, and builds
- **Parallel execution**: Jobs run in parallel for efficiency
- **Artifact management**: Build artifacts and test results are preserved
- **Changeset validation**: Automated changeset checking on PRs
- **Bundle size analysis**: Bundle size job runs on PRs
- **Build verification**: Manual verification of build artifacts

### 6. **Documentation**

- **Extensive docs**: Large `docs/` folder with migration guides and setup instructions
- **Root README**: Clear getting started guide with examples
- **Package READMEs**: Individual packages have documentation
- **Environment variables**: Comprehensive `ENVIRONMENT_VARIABLES.md` with app-specific requirements
- **TypeScript paths**: Documented path alias conventions
- **Migration history**: Good documentation of consolidation efforts

### 7. **Version Management**

- **Changesets**: Proper versioning workflow with Changesets
- **App exclusions**: Apps correctly excluded from versioning (private apps)
- **Linked packages**: Proper configuration for internal dependencies

### 8. **Code Quality Tools**

- **ESLint v9**: Modern flat config format used consistently
- **Shared ESLint config**: All apps extend `@websites/eslint-config`
- **Prettier**: Shared Prettier config ensures consistent formatting
- **Type checking**: TypeScript type-checking integrated into CI

---

## What's Problematic or Risky ⚠️

### 1. **Testing Strategy (HIGH PRIORITY)**

- **Non-blocking tests**: Tests can fail but CI still passes (`continue-on-error: true` in `.github/workflows/ci.yml:70`)
- **Inconsistent coverage**: Some apps have extensive tests (ittweb with coverage analysis), others may have minimal coverage
- **No coverage thresholds**: No minimum coverage requirements enforced in Jest configs
- **Test utilities**: `@websites/test-utils` correctly has React as peer dependency ✅ (this is good)
- **Risk**: Technical debt accumulates, regressions go unnoticed, quality degrades over time

### 2. **Dependency Management (MEDIUM-HIGH PRIORITY)**

- **UI package dependency issue**: `@websites/ui` has Next.js as `dependencies` instead of `peerDependencies` (line 14 in `packages/ui/package.json`)
  - **Risk**: Version conflicts, unnecessary bundling, harder updates
- **Duplication of build tools**: Common dependencies duplicated across apps:
  - `autoprefixer`, `postcss`, `tailwindcss` in each app (found in 4 apps)
  - `date-fns` used in apps but also in infrastructure package (could be consolidated)
  - `@types/*` packages repeated (acceptable, but could be optimized)
- **Risk**: Bundle size bloat, version conflicts, harder updates, inconsistent versions

### 3. **TypeScript Path Alias Inconsistency (MEDIUM PRIORITY)**

- **Different patterns across apps**:
  - `ittweb` uses: `@lib/*`, `@utils/*`, `@math/*`, etc.
  - `personalpage` uses: `@/*`, `@lib/*`, `@utils/*`, `@math/*`, `@ai/*`, etc.
  - `templatepage` uses: `@/*`, `@/features/*`, `@/utils/*`, etc.
- **Documentation exists** (`docs/TYPESCRIPT_PATH_ALIASES.md`) but patterns are still inconsistent
- **Risk**: Confusion when moving code between apps, harder refactoring, inconsistent developer experience

### 4. **Documentation Maintenance (LOW-MEDIUM PRIORITY)**

- **Migration docs**: Many docs appear to be from migration phase:
  - `ittweb-consolidation-*.md` (multiple files)
  - `ittweb-migration-summary.md`
  - `ittweb-utils-migration-summary.md`
  - `monorepo-cleanup-verification.md`
  - `build-errors-fixes.md`
  - `build-fixes-summary.md`
  - And many more...
- **Outdated content**: Some docs may reference old patterns or completed migrations
- **No ADRs**: Missing Architecture Decision Records for major decisions
- **Risk**: Confusion about current state, outdated guidance, harder onboarding

### 5. **Environment Variable Management (LOW PRIORITY)**

- **Good documentation**: `ENVIRONMENT_VARIABLES.md` is comprehensive ✅
- **Inconsistent validation**: Only `ittweb` has automated validation (`validate:env` script)
- **Missing validation**: Other apps (personalpage, MafaldaGarcia, templatepage) don't have validation
- **Risk**: Deployment failures, configuration drift, harder debugging

### 6. **Test Coverage Enforcement (MEDIUM PRIORITY)**

- **No CI enforcement**: Coverage thresholds exist in `ittweb` scripts but aren't enforced in CI
- **No coverage reporting**: No integration with coverage services (Codecov, Coveralls)
- **Inconsistent coverage**: Different apps have different coverage expectations
- **Risk**: Coverage can degrade over time without enforcement

### 7. **Build Tool Duplication (LOW-MEDIUM PRIORITY)**

- **PostCSS/Tailwind duplication**: Each app has its own `postcss.config.mjs` and `tailwind.config.ts`
- **Could be consolidated**: While some apps may need custom configs, base configs could be shared more
- **Risk**: Inconsistent build configurations, harder maintenance

### 8. **Script Inconsistencies (LOW PRIORITY)**

- **App-specific scripts**: `personalpage` has many custom scripts (e.g., `test:openai`, `migrate:weekly-to-classwork`)
- **Different patterns**: Apps have different script naming conventions
- **No standardization**: No documented standard for app-specific scripts
- **Risk**: Harder to discover available commands, inconsistent developer experience

---

## Specific, Prioritized Improvements

### 🔴 **CRITICAL (Do First)**

#### 1. **Make Tests Blocking in CI**

**File**: `.github/workflows/ci.yml`  
**Line**: 70  
**Action**: Remove `continue-on-error: true` from test job, or make it conditional based on test coverage thresholds.

```yaml
# Current (line 70):
continue-on-error: true

# Should be:
continue-on-error: false  # Or remove entirely
```

**Impact**: Prevents regressions from being merged, maintains code quality.

**Alternative**: If you want to allow test failures temporarily, add a comment explaining why and a timeline for fixing:

```yaml
continue-on-error: true # TODO: Remove by [date] after fixing failing tests
```

---

#### 2. **Fix UI Package Dependencies**

**File**: `packages/ui/package.json`  
**Line**: 14  
**Action**: Move Next.js to `peerDependencies` instead of `dependencies`.

```json
{
  "dependencies": {
    // Remove "next": "15.5.7" from here
    "react": "^18.3.1",
    "react-dom": "^18.2.0",
    "framer-motion": "^12.23.24",
    "react-icons": "^5.5.0",
    "nprogress": "^0.2.0",
    "lucide-react": "^0.554.0"
  },
  "peerDependencies": {
    "@websites/infrastructure": "workspace:*",
    "next": "^15.0.0" // Add here
  }
}
```

**Impact**: Prevents version conflicts, follows npm best practices, reduces bundle size.

---

### 🟠 **HIGH PRIORITY (Do Soon)**

#### 3. **Add Test Coverage Thresholds**

**Action**: Add coverage thresholds to Jest configs and enforce in CI.

**Files to update**:

- `apps/ittweb/config/jest.config.cjs`
- `apps/personalpage/jest.config.js` (if exists)
- Other app Jest configs

**Example**:

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

**CI Integration**: Update `.github/workflows/ci.yml` to fail if coverage drops below thresholds.

**Impact**: Maintains code quality, prevents coverage regression.

---

#### 4. **Consolidate Common Dependencies**

**Action**: Move frequently duplicated dependencies to shared packages:

**Option A: Create `@websites/config-postcss` package**

- Move `autoprefixer`, `postcss`, `tailwindcss` to shared package
- Export base PostCSS and Tailwind configs
- Apps extend base configs

**Option B: Keep in apps but document versions**

- Document required versions in root README
- Use pnpm overrides to ensure consistent versions

**Option C: Move `date-fns` usage to infrastructure**

- Apps should import from `@websites/infrastructure/date-fns` instead of direct imports
- Already partially done (infrastructure has `date-fns` export)

**Impact**: Reduced bundle size, easier updates, single source of truth.

---

#### 5. **Standardize TypeScript Path Aliases**

**Action**: Create a migration plan to standardize path aliases:

1. **Define standard aliases** (already in `docs/TYPESCRIPT_PATH_ALIASES.md`):
   - `@/*` - Root source directory (required)
   - `@/features/*` - Feature modules
   - `@/lib/*` - Shared libraries
   - `@/utils/*` - Utility functions
   - `@/components/*` - React components
   - `@/types/*` - TypeScript types
   - `@/styles/*` - Style files
   - `@/config/*` - Configuration files

2. **Migrate apps gradually**:
   - Start with `templatepage` (simplest)
   - Then `MafaldaGarcia`
   - Then `ittweb` and `personalpage` (more complex)

3. **Create migration script**: Script to automatically update imports

**Impact**: Easier code sharing, better developer experience, consistent patterns.

---

#### 6. **Add Environment Variable Validation**

**Action**: Add validation scripts to apps that don't have them:

1. **Copy `ittweb/scripts/utils/validate-env.js`** to other apps
2. **Update required variables** per app
3. **Add to build scripts**: `"build": "pnpm validate:env && next build"`

**Apps needing validation**:

- `personalpage` (has many env vars: Azure, OpenAI, Google)
- `MafaldaGarcia` (if using Firebase)

**Impact**: Prevents deployment failures, improves developer experience.

---

### 🟡 **MEDIUM PRIORITY (Plan For)**

#### 7. **Clean Up Documentation**

**Action**: Organize and archive migration-specific docs:

1. **Move to archive**: Move completed migration docs to `docs/ARCHIVE/`
   - `ittweb-consolidation-*.md` files
   - `ittweb-migration-summary.md`
   - `build-errors-fixes.md`
   - `build-fixes-summary.md`
   - Other completed migration docs

2. **Create index**: Update `docs/ARCHIVE/README.md` with descriptions

3. **Update main README**: Remove references to completed migrations

4. **Add ADRs**: Create `docs/ADRs/` folder for Architecture Decision Records

**Impact**: Clearer documentation, easier onboarding, less confusion.

---

#### 8. **Add Bundle Size Tracking**

**Action**: Enhance bundle size analysis:

1. **Add size budgets**: Set size limits in CI
2. **Track over time**: Use a service like Bundlephobia or custom tracking
3. **Fail CI on regression**: If bundle size increases significantly, fail CI
4. **Add to PR comments**: Automatically comment bundle size changes on PRs

**Example**:

```yaml
- name: Check bundle size
  run: |
    # Compare bundle sizes and fail if > 10% increase
    node scripts/check-bundle-size.js
```

**Impact**: Prevents performance regressions, maintains performance standards.

---

#### 9. **Standardize Script Naming**

**Action**: Document standard script names and conventions:

1. **Create `docs/SCRIPT_NAMING_CONVENTIONS.md`** (already exists, enhance it)
2. **Define standard scripts**: `dev`, `build`, `test`, `lint`, `format`, `type-check`
3. **Document app-specific scripts**: Each app should document its custom scripts in its README
4. **Add to root README**: Link to script naming conventions

**Impact**: Better developer experience, easier discovery of commands.

---

#### 10. **Improve Test Coverage Reporting**

**Action**: Integrate coverage reporting service:

1. **Add Codecov or Coveralls**: Integrate coverage service
2. **Add coverage badge**: Add to README
3. **PR comments**: Automatically comment coverage changes on PRs
4. **Enforce minimums**: Set minimum coverage requirements

**Impact**: Visibility into coverage trends, encourages maintaining coverage.

---

### 🟢 **LOW PRIORITY (Nice to Have)**

#### 11. **Add Pre-commit Type Checking**

**Action**: Add `type-check` to lint-staged for changed files (may be slow, consider caching).

**File**: `.lintstagedrc.json`

```json
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write",
    "bash -c 'pnpm type-check --filter $(pwd)'"
  ]
}
```

**Note**: This may be slow. Consider only running on staged files or using a faster type checker.

**Impact**: Catches type errors before commit.

---

#### 12. **Create App Template Generator**

**Action**: Enhance `templatepage` or create a script to generate new apps:

1. **Enhance `templatepage`**: Ensure it has all best practices
2. **Create generator script**: `scripts/create-app.js` that:
   - Copies `templatepage` structure
   - Updates package.json with app name
   - Sets up all configs (ESLint, Prettier, Tailwind, TypeScript)
   - Creates initial README

**Impact**: Faster app creation, ensures consistency.

---

#### 13. **Add Dependency Update Automation**

**Action**: Enhance Dependabot configuration:

1. **Review `.github/dependabot.yml`**: Ensure it covers all package managers
2. **Consider Renovate**: More flexible than Dependabot
3. **Automated security updates**: Enable automatic security patches
4. **Group updates**: Group related dependency updates

**Impact**: Keeps dependencies up-to-date, reduces security risk.

---

#### 14. **Improve Turborepo Remote Caching**

**Action**: Document and optimize remote caching:

1. **Document setup**: Add to README how to set up remote caching
2. **Monitor cache hits**: Track cache hit rates
3. **Optimize cache keys**: Ensure cache keys are optimal
4. **Team adoption**: Ensure all team members use remote caching

**Impact**: Faster CI/CD, better developer experience.

---

#### 15. **Add Architecture Decision Records (ADRs)**

**Action**: Create ADR process for major decisions:

1. **Create `docs/ADRs/` folder**
2. **Add ADR template**: Standard ADR format
3. **Document recent decisions**:
   - Why Turborepo was chosen
   - Why pnpm over npm/yarn
   - Why Changesets for versioning
   - Package structure decisions

**Impact**: Better understanding of decisions, easier onboarding.

---

## Additional Observations

### Positive Patterns

- ✅ Good use of workspace protocol for internal dependencies
- ✅ Proper use of `peerDependencies` in most shared packages
- ✅ Comprehensive CI/CD pipeline
- ✅ Good separation of concerns in package structure
- ✅ All apps have ESLint configs extending shared config
- ✅ Environment variables are well-documented
- ✅ Test utilities correctly use peer dependencies

### Areas for Future Consideration

- **Micro-frontends**: If apps grow, consider module federation
- **Shared state management**: If needed, consider extracting to infrastructure package
- **API layer**: Consider shared API client patterns
- **Error boundaries**: Standardize error handling patterns
- **Monitoring**: Consider shared monitoring/analytics setup
- **Storybook**: Consider adding Storybook for UI component documentation

---

## Summary

This monorepo demonstrates solid engineering practices with good tooling choices and thoughtful architecture. The main areas for improvement are:

1. **Testing rigor** - Make tests blocking and add coverage thresholds
2. **Dependency management** - Fix UI package dependencies and consolidate duplicates
3. **TypeScript path aliases** - Standardize across apps
4. **Documentation maintenance** - Clean up migration docs and add ADRs

### Current State: 7.5/10

**Strengths:**

- Excellent monorepo structure
- Good tooling (Turborepo, pnpm, ESLint, Prettier)
- Comprehensive CI/CD
- Well-documented environment variables
- Consistent ESLint configuration

**Weaknesses:**

- Non-blocking tests
- Dependency management issues
- Inconsistent TypeScript path aliases
- Documentation bloat from migrations

### Target State: 9/10

With the critical and high-priority improvements implemented, this monorepo would be production-ready for long-term maintenance and could easily reach a 9/10 score.

---

**Reviewer Notes:**

- Review based on code structure, configuration files, and documentation
- No runtime testing performed
- Recommendations are based on industry best practices for monorepo management
- All file paths are relative to `websites/` directory root
