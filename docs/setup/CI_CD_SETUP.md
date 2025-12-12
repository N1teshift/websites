# CI/CD Setup

This document describes the CI/CD setup for the websites monorepo.

## Overview

The monorepo uses GitHub Actions for continuous integration and deployment. All shared workflows are defined in `.github/workflows/`.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and pull request to `main`/`master` branch.

**Jobs:**

1. **Code Quality**
   - Checks code formatting (`pnpm format:check`)
   - Runs linting (`pnpm lint`)
   - Type checks all packages and apps (`pnpm type-check`)

2. **Test**
   - Runs all tests (`pnpm test`)
   - Uploads test results and coverage as artifacts
   - Blocking (fails CI on test failures)

3. **Build**
   - Builds all apps and packages using Turborepo (`pnpm build`)
   - Uses Turborepo remote caching (if configured)
   - Verifies build artifacts exist
   - Uploads build artifacts on main branch pushes

4. **Changeset Validation** (PRs only)
   - Checks if changesets are present for package changes
   - Blocking when `packages/` files change and no changeset is present

5. **Bundle Size Analysis** (PRs only, after build)
   - Runs `pnpm check:bundle-size`
   - Fails when budgets are exceeded; summarizes results in the PR

6. **CI Status**
   - Final status check that ensures all jobs passed

## App-specific workflows

Per-app workflows in `apps/ittweb/.github/workflows` and `apps/personalpage/.github/workflows` have been retired to avoid duplication. All lint/type-check/test/build/bundle-size/changeset checks run from the root CI with pnpm/turbo. Add an app-level workflow only if the app needs unique tasks (e.g., a bespoke deploy); align any new workflows with pnpm, Node 20, and the shared conventions above.

## Turborepo Remote Caching

To enable remote caching (faster CI builds):

1. **Sign up for Turborepo Vercel Integration:**

   ```bash
   npx turbo login
   ```

2. **Link your repository:**

   ```bash
   npx turbo link
   ```

3. **Add secrets to GitHub:**
   - Go to repository Settings → Secrets and variables → Actions
   - Add `TURBO_TOKEN` (from Turborepo dashboard)
   - Add `TURBO_TEAM` (your team name)

4. **Benefits:**
   - CI builds use cached results from previous builds
   - Only changed packages/apps rebuild
   - Significantly faster CI times

## Dependabot

Automated dependency updates are configured via `.github/dependabot.yml`.

**Configuration:**

- Weekly checks for npm dependencies
- Monthly checks for GitHub Actions
- Groups patch and minor updates together
- Ignores major version updates (handle manually)
- Auto-merge workflow for patch updates (optional)

**To enable auto-merge:**

1. Ensure `.github/workflows/dependabot.yml` exists
2. Dependabot will automatically create PRs
3. Patch updates will auto-merge if CI passes

## Manual Workflows

### Format Check

```bash
pnpm format:check
```

### Lint

```bash
pnpm lint
```

### Type Check

```bash
pnpm type-check
```

### Test

```bash
pnpm test
```

### Build

```bash
pnpm build
```

## CI Best Practices

1. **Always run CI locally before pushing:**

   ```bash
   pnpm format:check
   pnpm lint
   pnpm type-check
   pnpm test
   pnpm build
   ```

2. **Use Turborepo remote caching** for faster builds

3. **Add changesets** when modifying packages:

   ```bash
   pnpm changeset
   ```

4. **Check CI status** before merging PRs

5. **Review dependency updates** before auto-merging

## Troubleshooting

### CI fails on formatting

- Run `pnpm format` locally and commit
- Ensure `.prettierrc.json` extends `@websites/prettier-config`

### CI fails on linting

- Run `pnpm lint` locally
- Fix linting errors or add appropriate ESLint disable comments

### Build fails

- Check if all dependencies are installed: `pnpm install`
- Verify environment variables are set (if needed)
- Check build logs for specific errors

### Tests fail

- Run tests locally: `pnpm test`
- Check test coverage reports in artifacts
- Ensure test environment matches CI

### Turborepo caching not working

- Verify `TURBO_TOKEN` and `TURBO_TEAM` secrets are set
- Check Turborepo dashboard for cache status
- Ensure `turborepo/setup-action@v1` is in workflow

## Future Improvements

- [ ] Add deployment workflows for each app
- [ ] Add performance monitoring
- [ ] Add bundle size tracking
- [ ] Add security scanning
- [ ] Add E2E test workflows
- [ ] Add release automation
