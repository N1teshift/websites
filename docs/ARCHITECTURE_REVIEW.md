# Architecture Review: "Almost Right" Patterns

**Date:** 2025-01-27  
**Reviewer:** Senior Infrastructure/Architecture Reviewer  
**Scope:** Monorepo infrastructure, tooling, and architectural patterns

This review identifies patterns that demonstrate good architectural intent but are currently incomplete, fragile, or under-leveraged. Each section explains what the design aims for, where it falls short, and pragmatic changes to make it solid.

---

## 1. Configuration Validation Pattern

### What It's Aiming For

Centralized, validated configuration management with clear error messages. The pattern exists in `firebase/config.ts` and `clients/email/config.ts` with `validate*Config()` functions.

### Where It Falls Short

- **Inconsistent enforcement**: Validation functions exist but are only called in some places (e.g., `emailService.ts` validates, but `firebase/client.ts` doesn't validate before initialization)
- **No startup validation**: Configs are validated lazily at runtime, not at app startup
- **Missing validation for other services**: Google, Microsoft, OpenAI clients lack similar validation patterns
- **No schema-based validation**: Using manual checks instead of Zod (which is already a dependency)

### Pragmatic Fixes

1. **Add startup validation hook**: Create `packages/infrastructure/src/config/validateAll.ts` that validates all configs at app startup
2. **Use Zod schemas**: Convert manual validation to Zod schemas for type safety and better error messages
3. **Enforce validation in client initialization**: Make `initializeFirebaseApp()` call `validateFirebaseClientConfig()` before proceeding
4. **Add validation to other clients**: Extend pattern to Google/Microsoft/OpenAI configs

**Example:**

```typescript
// packages/infrastructure/src/config/validateAll.ts
export async function validateAllConfigs(): Promise<void> {
  const errors: string[] = [];

  // Validate Firebase
  const firebaseConfig = getFirebaseClientConfig();
  errors.push(
    ...validateFirebaseClientConfig(firebaseConfig).map(
      (e) => `Firebase: ${e}`,
    ),
  );

  // Validate Email (if used)
  if (process.env.EMAIL_HOST) {
    const emailConfig = getEmailConfig();
    errors.push(...validateEmailConfig(emailConfig).map((e) => `Email: ${e}`));
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join("\n")}`);
  }
}
```

---

## 2. Error Handling Abstraction

### What It's Aiming For

Consistent error handling across all client services with proper categorization, logging, and context. The pattern exists with `errorHandler.ts` files in multiple client directories.

### Where It Falls Short

- **Inconsistent error types**: Email uses simple `Error`, Google uses `ApiError` with types, others use different patterns
- **No unified error interface**: Each service defines its own error handling signature
- **Missing error recovery strategies**: No retry logic, circuit breakers, or fallback mechanisms
- **Error tracking is a stub**: `monitoring/errorTracking.ts` just logs to console - no actual integration

### Pragmatic Fixes

1. **Create unified error base class**: `packages/infrastructure/src/errors/BaseServiceError.ts`
2. **Standardize error handler signatures**: All `handle*Error()` functions should return the same error type
3. **Add retry utilities**: Create `packages/infrastructure/src/utils/retry.ts` for common retry patterns
4. **Integrate real error tracking**: Add Sentry/LogRocket integration (or at least structured logging to a service)

**Example:**

```typescript
// packages/infrastructure/src/errors/BaseServiceError.ts
export class BaseServiceError extends Error {
  constructor(
    message: string,
    public readonly service: string,
    public readonly category: ErrorCategory,
    public readonly retryable: boolean = false,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = `${service}Error`;
  }
}
```

---

## 3. TypeScript Path Aliases

### What It's Aiming For

Clean imports using `@websites/*` aliases instead of relative paths. The base config exists in `packages/config/tsconfig.base.json` with a comment about the pattern.

### Where It Falls Short

- **No actual path mappings in base config**: The comment says apps should add paths, but the base doesn't provide common workspace paths
- **Inconsistent usage**: Apps define their own paths (e.g., `ittweb` has `@/*`, `@/features/*`, etc.) but don't use `@websites/*` consistently
- **Infrastructure package not aliased**: Apps can't use `@websites/infrastructure` - they use relative imports or full package names
- **No shared path config**: Each app duplicates path configuration

### Pragmatic Fixes

1. **Add workspace paths to base config**: Include common `@websites/*` mappings in `tsconfig.base.json`
2. **Create path alias helper**: `packages/config/tsconfig-paths.json` that apps can extend
3. **Update apps to use aliases**: Migrate apps to use `@websites/infrastructure` instead of relative paths
4. **Document the pattern**: Add to `docs/TYPESCRIPT_PATH_ALIASES.md` (which exists but may need updating)

**Example:**

```json
// packages/config/tsconfig.base.json
{
  "compilerOptions": {
    "paths": {
      "@websites/infrastructure": ["../infrastructure/src"],
      "@websites/infrastructure/*": ["../infrastructure/src/*"],
      "@websites/ui": ["../ui/src"],
      "@websites/ui/*": ["../ui/src/*"]
    }
  }
}
```

---

## 4. Testing Infrastructure

### What It's Aiming For

Shared testing utilities, mocks, and configuration across all apps. The `@websites/test-utils` package exists with Jest base config.

### Where It Falls Short

- **Minimal exports**: `test-utils/src/index.ts` only exports setup and mocks - no test helpers, utilities, or custom matchers
- **Underutilized**: Apps may not be using the shared test utils consistently
- **No E2E test utilities**: Only unit test setup, no Playwright/Cypress helpers
- **Missing test data factories**: No faker/fixture utilities for generating test data

### Pragmatic Fixes

1. **Add test helpers**: Create `test-utils/src/helpers/` with common utilities (renderWithProviders, waitForAsync, etc.)
2. **Add test data factories**: Create `test-utils/src/factories/` for generating test data
3. **Add custom matchers**: Extend Jest matchers for common assertions (e.g., `toHaveFirestoreData()`)
4. **Create E2E utilities**: Add Playwright helpers if apps use E2E testing

**Example:**

```typescript
// packages/test-utils/src/helpers/renderWithProviders.tsx
export function renderWithProviders(
  ui: React.ReactElement,
  options?: { locale?: string },
) {
  // Wrapper that provides i18n, theme, etc.
}
```

---

## 5. Bundle Size Tracking

### What It's Aiming For

Proactive bundle size monitoring with budgets and CI integration. The `bundle-size-budgets.json` exists and CI has a bundle-size job.

### Where It Falls Short

- **Non-blocking in CI**: Bundle size checks are informational only - they don't fail PRs
- **No historical tracking**: No comparison to previous builds or trend analysis
- **Manual budget updates**: Budgets are static JSON, not derived from performance budgets
- **No per-route analysis**: Only tracks top-level chunks, not route-specific bundles

### Pragmatic Fixes

1. **Make bundle size checks blocking**: Add `--fail-on-exceed` to CI (script already supports it)
2. **Add trend tracking**: Store bundle sizes in a file/artifact and compare against previous builds
3. **Add route-level analysis**: Extend script to analyze route-specific bundles
4. **Create performance budgets**: Derive budgets from Core Web Vitals targets

**Example:**

```yaml
# .github/workflows/ci.yml
- name: Check bundle size budgets
  run: pnpm check:bundle-size:fail # Use :fail variant
```

---

## 6. Logging Infrastructure

### What It's Aiming For

Structured, component-scoped logging with throttling and categorization. The `logging/logger.ts` has sophisticated deduplication and component loggers.

### Where It Falls Short

- **Console-only output**: No structured logging to files or external services
- **No log levels in production**: Defaults to 'warn' in production, making debugging difficult
- **Throttling may hide issues**: Aggressive throttling (3 logs per 5s) might hide real problems
- **No correlation IDs**: No request/session correlation for tracing requests across services

### Pragmatic Fixes

1. **Add structured output**: Support JSON logging format for log aggregation services
2. **Add correlation IDs**: Generate request IDs and include in all logs
3. **Make throttling configurable**: Allow apps to adjust throttling per environment
4. **Add log shipping**: Integrate with a log service (or at least structured file output)

**Example:**

```typescript
// packages/infrastructure/src/logging/logger.ts
export function createComponentLogger(
  componentName: string,
  options?: { correlationId?: string },
) {
  const meta = options?.correlationId
    ? { correlationId: options.correlationId }
    : {};
  // Include correlationId in all logs
}
```

---

## 7. Firebase Client/Server Separation

### What It's Aiming For

Clear separation between client-side Firebase (safe for browser) and server-side Admin SDK. The structure exists with `firebase/client.ts` and `firebase/admin.ts`.

### Where It Falls Short

- **Utils file is minimal**: `firebase/utils.ts` only has `isServerSide()` - could provide more shared utilities
- **No type guards**: No runtime checks to prevent importing admin code in client components
- **Config validation missing**: Client initialization doesn't validate config before proceeding
- **No initialization helpers**: Apps must manually call `initializeFirebaseApp()` - no automatic setup

### Pragmatic Fixes

1. **Add more utilities**: Add helpers for common Firebase operations (e.g., `safeGetDoc`, `safeGetCollection`)
2. **Add type guards**: Create `isClientContext()` and `isServerContext()` with better type narrowing
3. **Enforce validation**: Make initialization validate config and throw early if invalid
4. **Add auto-initialization option**: Provide a way to auto-initialize on import (with opt-out)

**Example:**

```typescript
// packages/infrastructure/src/firebase/utils.ts
export function safeGetDoc<T>(
  ref: DocumentReference<T>,
): Promise<DocumentSnapshot<T> | null> {
  try {
    return getDoc(ref);
  } catch (error) {
    logger.error("Failed to get document", error);
    return null;
  }
}
```

---

## 8. Infrastructure Package Exports

### What It's Aiming For

Clean, organized exports with subpath exports for better tree-shaking. The `package.json` has extensive `exports` field configuration.

### Where It Falls Short

- **Barrel exports in index.ts**: Main `index.ts` uses `export *` which can cause circular dependencies
- **No export validation**: No check to ensure all exports are actually usable (some might be server-only exported to client)
- **Inconsistent export patterns**: Some modules export everything, others export selectively
- **No deprecation markers**: No way to mark exports as deprecated

### Pragmatic Fixes

1. **Use explicit exports**: Replace `export *` with named exports to avoid circular dependency issues
2. **Add export validation script**: Check that client-safe exports don't include server-only code
3. **Document export patterns**: Add JSDoc comments explaining which exports are client-safe vs server-only
4. **Add deprecation support**: Use JSDoc `@deprecated` tags and TypeScript deprecation markers

**Example:**

```typescript
// packages/infrastructure/src/index.ts
// Explicit exports instead of export *
export { createComponentLogger, logError } from "./logging";
export { initializeFirebaseApp, getFirestoreInstance } from "./firebase/client";
// ... etc
```

---

## 9. CI/CD Pipeline Configuration

### What It's Aiming For

Comprehensive CI with quality checks, tests, builds, and bundle analysis. The workflow is well-structured with multiple jobs.

### Where It Falls Short

- **Non-blocking tests**: Tests can fail but CI still passes (`continue-on-error: true`)
- **Hardcoded job toggles**: Using `if: true` instead of environment variables for toggling jobs
- **No parallelization strategy**: Jobs run sequentially when some could run in parallel
- **No deployment integration**: CI builds but doesn't deploy (may be intentional, but no clear separation)

### Pragmatic Fixes

1. **Make tests blocking**: Remove `continue-on-error` or make it configurable via env var
2. **Use workflow variables**: Replace `if: true` with `vars.ENABLE_*` for easier toggling
3. **Optimize job dependencies**: Run quality, test, and build in parallel where possible
4. **Add deployment job**: Create separate deployment job that runs on main branch after all checks pass

**Example:**

```yaml
# .github/workflows/ci.yml
test:
  if: vars.ENABLE_TESTS != 'false' # Use vars instead of hardcoded true
  steps:
    - name: Run tests
      run: pnpm test
      # Remove continue-on-error or make it conditional
```

---

## 10. Environment Variable Management

### What It's Aiming For

Centralized environment variable access with validation. Config files exist for Firebase and Email.

### Where It Falls Short

- **No env var schema**: No single source of truth for all environment variables
- **Inconsistent naming**: Mix of `NEXT_PUBLIC_*`, `FIREBASE_*`, `EMAIL_*`, `SMTP_*` patterns
- **No validation at startup**: Env vars are read lazily, not validated at app startup
- **No documentation**: No `.env.example` or documentation of required variables

### Pragmatic Fixes

1. **Create env var schema**: Use Zod to define all environment variables in one place
2. **Add startup validation**: Validate all required env vars when app starts
3. **Create .env.example**: Document all required and optional variables
4. **Standardize naming**: Use consistent prefixes (`NEXT_PUBLIC_*` for client, no prefix for server)

**Example:**

```typescript
// packages/infrastructure/src/config/env.ts
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  // ... etc
});

export const env = envSchema.parse(process.env);
```

---

## 11. Error Tracking Integration

### What It's Aiming For

Centralized error tracking with context and categorization. The `monitoring/errorTracking.ts` exists with a clean interface.

### Where It Falls Short

- **Console-only implementation**: Just logs to console, no actual error tracking service
- **No error aggregation**: No grouping or deduplication of similar errors
- **Missing user context**: `setUserContext()` is a no-op
- **No error boundaries integration**: Not integrated with React error boundaries

### Pragmatic Fixes

1. **Add real error tracking**: Integrate Sentry, LogRocket, or similar (or at least structured logging)
2. **Add error grouping**: Group similar errors by stack trace or message pattern
3. **Implement user context**: Store user context in a context provider or global state
4. **Create error boundary wrapper**: Provide a React error boundary that uses error tracking

**Example:**

```typescript
// packages/infrastructure/src/monitoring/errorTracking.ts
export function captureError(error: Error, context?: ErrorContext): void {
  // Group by error message + stack trace
  const errorKey = `${error.message}:${error.stack?.split("\n")[0]}`;

  // Send to actual service (Sentry, etc.)
  if (typeof window !== "undefined" && window.Sentry) {
    window.Sentry.captureException(error, { contexts: { custom: context } });
  }

  // Fallback to console
  console.error("[Error]", error, context);
}
```

---

## 12. Package Dependency Management

### What It's Aiming For

Clean dependency management with peer dependencies for framework code. The infrastructure package uses `peerDependencies` correctly.

### Where It Falls Short

- **No dependency validation**: No check to ensure peer dependencies are satisfied
- **Inconsistent peer deps**: Some packages have peer deps, others don't
- **No version alignment**: No check to ensure all packages use the same version of shared deps (e.g., React)
- **Changeset ignores apps**: Apps are ignored in changeset config, but they might need versioning for deployments

### Pragmatic Fixes

1. **Add peer dep validation**: Script to check all peer dependencies are installed
2. **Standardize peer deps**: Ensure all packages that should have peer deps do
3. **Add version alignment check**: Script to ensure React, Next.js, etc. versions are aligned
4. **Review changeset config**: Consider if apps need versioning (even if private)

**Example:**

```json
// package.json scripts
{
  "validate:deps": "node scripts/validate-peer-deps.js"
}
```

---

## Summary: Quick Wins

These are the highest-impact, lowest-effort improvements:

1. **Make tests blocking in CI** (5 min) - Remove `continue-on-error: true`
2. **Add Firebase config validation** (15 min) - Call `validateFirebaseClientConfig()` in `initializeFirebaseApp()`
3. **Add TypeScript path aliases to base config** (10 min) - Add `@websites/*` paths to `tsconfig.base.json`
4. **Create .env.example** (30 min) - Document all environment variables
5. **Make bundle size checks blocking** (2 min) - Use `:fail` variant in CI
6. **Add explicit exports to index.ts** (1 hour) - Replace `export *` with named exports

These changes would significantly improve the robustness and maintainability of the monorepo with minimal effort.
