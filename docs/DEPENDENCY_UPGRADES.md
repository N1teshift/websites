# Dependency Upgrade Process

This document outlines the process for upgrading dependencies in the websites monorepo.

## Table of Contents

- [Critical Dependencies](#critical-dependencies)
- [Package-Specific Dependencies](#package-specific-dependencies)
- [Security Updates](#security-updates)
- [Upgrade Checklist](#upgrade-checklist)
- [Version Management](#version-management)

## Critical Dependencies (Coordinated Upgrades)

These dependencies affect multiple apps and must be upgraded together to ensure compatibility.

### Next.js

Next.js is locked to a specific version in the root `package.json` overrides to ensure all apps use the same version.

**Upgrade Process:**

1. **Review Release Notes**
   - Check [Next.js releases](https://github.com/vercel/next.js/releases)
   - Identify breaking changes
   - Note new features and improvements

2. **Test in Template App First**
   - `templatepage` is the smallest app - use it as a testbed
   ```bash
   pnpm --filter templatepage install next@<new-version>
   pnpm --filter templatepage build
   pnpm --filter templatepage test
   ```

3. **Update Root Override**
   - Update `package.json` at root:
   ```json
   {
     "pnpm": {
       "overrides": {
         "next": "<new-version>"
       }
     }
   }
   ```

4. **Update All Apps**
   ```bash
   pnpm install
   ```

5. **Run Full Test Suite**
   ```bash
   pnpm test
   pnpm type-check
   pnpm lint
   ```

6. **Verify Builds**
   ```bash
   pnpm verify:builds
   ```

7. **Test Each App Manually**
   - Start dev servers
   - Test critical features
   - Check for console errors

**Breaking Changes Checklist:**
- [ ] API routes still work
- [ ] Middleware still functions
- [ ] Image optimization works
- [ ] i18n integration works
- [ ] Server components behave correctly
- [ ] Client components render properly
- [ ] Build output is correct

### React & React-DOM

React versions are tied to Next.js compatibility. Check Next.js documentation for supported React versions.

**Upgrade Process:**

1. Verify Next.js compatibility
2. Update React in one app first (usually `templatepage`)
3. Test thoroughly
4. Update all apps if successful
5. Run full test suite

**Note:** React upgrades often require code changes. Check the [React migration guide](https://react.dev/blog/2022/03/08/react-18-upgrade-guide).

### TypeScript

TypeScript is used across all packages. Upgrades usually require minimal changes but can surface new type errors.

**Upgrade Process:**

1. Update in root `package.json`
2. Run type-check across all packages:
   ```bash
   pnpm type-check
   ```
3. Fix any new type errors
4. Ensure all packages pass type-check

## Package-Specific Dependencies

### @websites/infrastructure

Can upgrade dependencies independently, but breaking changes require testing all consuming apps.

**Process:**

1. Update dependency in `packages/infrastructure/package.json`
2. Install: `pnpm install`
3. Run infrastructure tests:
   ```bash
   pnpm --filter infrastructure test
   pnpm --filter infrastructure type-check
   ```
4. Test in consuming apps:
   ```bash
   pnpm --filter personalpage build
   pnpm --filter ittweb build
   ```
5. Create changeset if breaking:
   ```bash
   pnpm changeset
   ```

**Common Dependencies:**
- `axios` - HTTP client
- `zod` - Schema validation
- `firebase-admin` - Backend Firebase SDK
- `next-i18next` - i18n integration

### @websites/ui

UI dependencies can be upgraded more freely, but visual regressions should be checked.

**Process:**

1. Update in `packages/ui/package.json`
2. Install: `pnpm install`
3. Type-check:
   ```bash
   pnpm --filter ui type-check
   ```
4. Manually test UI components in consuming apps
5. Check for visual regressions
6. Consider using visual testing tools (e.g., Chromatic, Percy)

**Common Dependencies:**
- `framer-motion` - Animations
- `react-icons` - Icon library
- `lucide-react` - Icons
- `nprogress` - Progress bars

### @websites/eslint-config

Upgrading ESLint or configs requires updating all apps.

**Process:**

1. Update in `packages/eslint-config/package.json`
2. Test linting:
   ```bash
   pnpm lint
   ```
3. Fix any new lint errors across all apps
4. Update ESLint config rules if needed

### @websites/config

Configuration packages rarely need updates, but TypeScript config changes can affect all packages.

**Process:**

1. Update `tsconfig.base.json` if needed
2. Run type-check on all packages
3. Fix any resulting type errors

## Security Updates

Security vulnerabilities should be addressed promptly, especially for critical dependencies.

### Process

1. **Check for Vulnerabilities**
   ```bash
   pnpm audit
   ```

2. **Review Vulnerabilities**
   - Check severity (critical, high, moderate, low)
   - Review [npm advisories](https://www.npmjs.com/advisories)
   - Understand impact

3. **Critical/High Severity**
   - Upgrade immediately
   - Test thoroughly
   - Deploy as hotfix if needed
   - Document in changeset

4. **Moderate/Low Severity**
   - Schedule in next sprint
   - Upgrade during regular maintenance
   - Test before deploying

5. **Auto-fix (Use with Caution)**
   ```bash
   pnpm audit --fix
   ```
   - Review changes before committing
   - Test thoroughly
   - Some fixes may require code changes

### Dependency Locking

For critical security-sensitive dependencies, consider locking to specific versions:

```json
{
  "pnpm": {
    "overrides": {
      "next": "15.5.7",
      "react": "^18.3.1"
    }
  }
}
```

## Upgrade Checklist

Use this checklist for any dependency upgrade:

### Pre-Upgrade

- [ ] Review dependency release notes/changelog
- [ ] Check for breaking changes
- [ ] Identify affected packages/apps
- [ ] Check compatibility with other dependencies
- [ ] Review GitHub issues/PRs for known problems
- [ ] Backup current `pnpm-lock.yaml` (git commit)

### During Upgrade

- [ ] Update `package.json` files
- [ ] Run `pnpm install`
- [ ] Check for peer dependency warnings
- [ ] Update type definitions if needed (`@types/*`)
- [ ] Fix immediate compilation errors

### Testing

- [ ] Run type-check: `pnpm type-check`
- [ ] Run linter: `pnpm lint`
- [ ] Run tests: `pnpm test`
- [ ] Build all apps: `pnpm build` or `pnpm verify:builds`
- [ ] Manual testing in development mode
- [ ] Test critical user flows
- [ ] Check console for errors/warnings
- [ ] Verify production builds work

### Post-Upgrade

- [ ] Update documentation if APIs changed
- [ ] Create changeset if breaking change
- [ ] Update this document if process changed
- [ ] Commit changes with descriptive message
- [ ] Deploy to staging first (if applicable)
- [ ] Monitor for issues after deployment

## Version Management

### Lockfile Strategy

We use `pnpm-lock.yaml` for deterministic installs. Always commit lockfile changes.

**Best Practices:**
- Never manually edit `pnpm-lock.yaml`
- Always run `pnpm install` after updating `package.json`
- Commit lockfile with dependency changes
- Use `pnpm install --frozen-lockfile` in CI

### Version Ranges

**Current Strategy:**

- **Exact versions** for critical deps: `"next": "15.5.7"`
- **Caret ranges** for most deps: `"react": "^18.3.1"`
- **Workspace protocol** for internal: `"@websites/ui": "workspace:*"`

**When to use exact versions:**
- Core framework (Next.js)
- Security-sensitive packages
- Known problematic dependencies

**When to use ranges:**
- Utility libraries
- Dev dependencies
- Stable packages with good versioning

### Peer Dependencies

Peer dependencies must match across the monorepo. We use `strict-peer-dependencies=false` currently, but aim to fix peer dep issues over time.

**Checking peer deps:**
```bash
pnpm list --depth 0
```

### Dependency Audit

Run regularly (weekly/monthly):
```bash
pnpm audit
pnpm outdated
```

Review outdated packages and plan upgrades.

## Troubleshooting

### Peer Dependency Warnings

If you see peer dependency warnings:

1. Check which package requires the peer dep
2. Ensure version compatibility
3. Add to `devDependencies` if needed for development
4. Use `pnpm.overrides` for resolution if necessary

### Build Failures After Upgrade

1. Clear caches:
   ```bash
   pnpm clean
   rm -rf node_modules
   pnpm install
   ```

2. Check for breaking changes in release notes
3. Review TypeScript errors
4. Check for deprecated APIs

### Type Errors After Upgrade

1. Update `@types/*` packages if needed
2. Check TypeScript version compatibility
3. Review type definition changes
4. Add type assertions if needed (temporary)

## Resources

- [Next.js Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading)
- [React Upgrade Guide](https://react.dev/blog/2022/03/08/react-18-upgrade-guide)
- [pnpm Documentation](https://pnpm.io/)
- [npm Security Advisories](https://www.npmjs.com/advisories)
- [TypeScript Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes.html)

## Version History

| Date | Dependency | Version | Notes |
|------|-----------|---------|-------|
| 2024-XX-XX | Next.js | 15.5.7 | Current version |
| 2024-XX-XX | React | ^18.3.1 | Current version |
| 2024-XX-XX | TypeScript | ^5.7.2 | Current version |

(Update this table when major upgrades are completed)
