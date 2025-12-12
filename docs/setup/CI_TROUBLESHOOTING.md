# CI Troubleshooting Guide

This guide helps you debug and fix CI failures.

## Quick Debugging Steps

### 1. Check GitHub Actions Logs

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Click on the failing workflow run
4. Click on each failing job to see detailed logs
5. Look for error messages (usually in red)

### 2. Run CI Checks Locally

Before pushing, always run these locally:

```bash
# Check formatting
pnpm format:check

# Lint code
pnpm lint

# Type check
pnpm type-check

# Run tests
pnpm test

# Build all apps
pnpm build
```

If any of these fail locally, fix them before pushing.

## Common Issues and Fixes

### Issue: Code Quality Fails

**Symptoms:**

- `pnpm format:check` fails
- `pnpm lint` fails
- `pnpm type-check` fails

**Fixes:**

1. **Formatting errors:**

   ```bash
   pnpm format
   git add .
   git commit -m "fix: format code"
   ```

2. **Linting errors:**

   ```bash
   pnpm lint
   # Fix errors shown, or add ESLint disable comments if needed
   ```

3. **Type errors:**
   ```bash
   pnpm type-check
   # Fix TypeScript errors shown
   ```

### Issue: Build Fails

**Symptoms:**

- Build job fails
- `.next` directories not found

**Common Causes:**

1. **Missing environment variables:**
   - Check if apps need `.env` files
   - Add required env vars to GitHub Secrets if needed

2. **Dependency issues:**

   ```bash
   pnpm install
   pnpm build
   ```

3. **Build errors:**
   - Check build logs for specific errors
   - Common: TypeScript errors, missing imports, etc.

**Fix:**

```bash
# Test build locally
pnpm build

# If it fails, check error messages
# Fix errors and test again
```

### Issue: Tests Fail

**Symptoms:**

- Test job shows failures
- Currently non-blocking but should be fixed

**Fixes:**

1. **Run tests locally:**

   ```bash
   pnpm test
   ```

2. **Check test output:**
   - Look for specific failing tests
   - Fix test code or update test expectations

3. **Check test coverage:**
   - Review coverage reports in artifacts
   - Add tests for uncovered code

### Issue: Vercel Deployment Fails

**Note:** Vercel deployments are separate from CI.

**Fixes:**

1. **Check Vercel dashboard:**
   - Go to Vercel dashboard
   - Check deployment logs
   - Look for build errors

2. **Common issues:**
   - Missing environment variables in Vercel
   - Build command issues
   - Root directory configuration

3. **Fix in Vercel:**
   - Add missing env vars in project settings
   - Verify build settings
   - Check root directory is set correctly

## Step-by-Step Debugging

### For Code Quality Failures:

1. **Check the error:**

   ```bash
   pnpm format:check
   pnpm lint
   pnpm type-check
   ```

2. **Fix the issues:**
   - Format: `pnpm format`
   - Lint: Fix errors or add disable comments
   - Types: Fix TypeScript errors

3. **Test locally:**

   ```bash
   pnpm format:check && pnpm lint && pnpm type-check
   ```

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "fix: resolve CI quality checks"
   git push
   ```

### For Build Failures:

1. **Check build logs in GitHub Actions**
2. **Reproduce locally:**

   ```bash
   pnpm install
   pnpm build
   ```

3. **Fix errors:**
   - Missing dependencies: `pnpm install`
   - Type errors: Fix TypeScript issues
   - Missing env vars: Add to GitHub Secrets

4. **Test and push:**
   ```bash
   pnpm build  # Should succeed
   git push
   ```

## Getting Help

### If you can't fix it:

1. **Copy the error message** from GitHub Actions logs
2. **Check if it fails locally:**

   ```bash
   pnpm format:check
   pnpm lint
   pnpm type-check
   pnpm test
   pnpm build
   ```

3. **Share:**
   - Error message
   - Which command fails locally
   - What you've tried

## Prevention

### Before Pushing:

Always run these locally first:

```bash
# Quick check script
pnpm format:check && \
pnpm lint && \
pnpm type-check && \
pnpm test && \
pnpm build && \
echo "✅ All checks passed!"
```

### Use Pre-commit Hooks:

The pre-commit hook (Husky) should catch formatting/linting issues before you commit.

If it's not running:

```bash
pnpm prepare
```

## CI Status Job

The "CI Status" job fails when other jobs fail. It's a summary job - fix the underlying issues first.

## Test Job Note

Tests are currently set to `continue-on-error: true`, so they won't block CI, but you should still fix failing tests.

To make tests blocking, edit `.github/workflows/ci.yml`:

```yaml
- name: Run tests
  run: pnpm test
  # Remove: continue-on-error: true
```
