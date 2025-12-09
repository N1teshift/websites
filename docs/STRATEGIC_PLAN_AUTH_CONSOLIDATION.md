# Strategic Plan: Authentication Consolidation for API Handlers

## Executive Summary

**Objective:** Consolidate three variations of API handler authentication patterns into a single, unified approach in the `packages/infrastructure` layer, eliminating app-specific wrappers and preventing authentication bugs.

**Current Problem:**

- Inconsistent authentication patterns across apps lead to bugs (e.g., `/api/games` failing due to missing `authConfig`)
- Code duplication with app-specific wrappers doing the same thing
- Developers must remember which import to use and when to provide `authConfig`

**Solution:** Enhance the generic infrastructure handler to support a default `authConfig` provider that apps can register once, making session always available when configured, regardless of `requireAuth` setting.

---

## 1. Current State Analysis

### 1.1 Existing Patterns

#### Pattern A: Generic Handler (Broken for Optional Auth)

**Location:** `packages/infrastructure/src/api/handlers/routeHandlers.ts`

- **Usage:** Direct import from `@websites/infrastructure/api`
- **Issue:** Session only fetched if `authConfig` provided in options
- **Example:** `/api/games/index.ts` - fails because `requireAuth: false` but needs session for POST

#### Pattern B: App Wrapper (Working)

**Locations:**

- `apps/ittweb/src/lib/api-wrapper.ts`
- `apps/ittweb/src/features/infrastructure/api/handlers/routeHandlers.ts`
- `apps/personalpage/src/features/infrastructure/api/routeHandlers.ts`
- **Usage:** Auto-injects `authConfig` when `requireAuth: true`
- **Issue:** Doesn't help with `requireAuth: false` + optional auth scenarios
- **Example:** `/api/games/[id]/join.ts` - works because `requireAuth: true`

#### Pattern C: Manual AuthConfig (Working but Verbose)

**Usage:** Provides `authConfig` directly in handler options

- **Issue:** Repetitive, easy to forget
- **Example:** `/api/user/me.ts` - works but verbose

### 1.2 Statistics

- **Total API handlers:** ~45 files in `apps/ittweb/src/pages/api`
- **Using generic directly:** ~1 file (the broken one)
- **Using wrapper:** ~30+ files
- **Using manual authConfig:** ~4 files
- **Apps affected:** 2 (ittweb, personalpage)

### 1.3 Current Behavior

```typescript
// Current: Session only fetched if authConfig provided
let session: GenericSession | null = null;
if (authConfig) {
  session = await authConfig.getSession(req, res);
}
```

**Problem:** When `requireAuth: false` and no `authConfig` provided, session is never fetched, even if app has authentication configured.

---

## 2. Goals and Objectives

### 2.1 Primary Goals

1. **Single Source of Truth:** One authentication pattern in `packages/infrastructure`
2. **Zero Configuration:** Apps register auth once, all handlers benefit
3. **Backward Compatible:** Existing handlers continue working
4. **Optional Auth Support:** Handlers can access session even with `requireAuth: false`
5. **Type Safety:** Maintain full TypeScript support

### 2.2 Success Criteria

- ✅ No app-specific authentication wrappers needed
- ✅ All handlers can access session when auth is configured
- ✅ Zero breaking changes to existing handlers
- ✅ All tests pass
- ✅ Documentation updated
- ✅ No authentication bugs in production

### 2.3 Non-Goals

- Changing authentication libraries (NextAuth, custom sessions)
- Modifying session structure or format
- Changing response formats
- Supporting multiple auth providers per app (one per app is sufficient)

---

## 3. Design Approach

### 3.1 Core Design: Default Auth Config Provider

**Concept:** Apps register a default `AuthConfig` provider once. The generic handler uses it when:

1. No `authConfig` provided in handler options, AND
2. App has registered a default provider

**Key Insight:** The handler already supports optional session fetching (line 186-188). We just need to make `authConfig` available by default.

### 3.2 Architecture

```
┌─────────────────────────────────────────────────────────┐
│ packages/infrastructure/src/api/handlers/routeHandlers.ts│
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Global Auth Config Registry                         │ │
│  │ - registerDefaultAuthConfig(authConfig)            │ │
│  │ - getDefaultAuthConfig(): AuthConfig | null        │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  createApiHandler() {                                     │
│    const authConfig = options.authConfig ||              │
│                       getDefaultAuthConfig() ||           │
│                       null;                               │
│    // Use authConfig to fetch session...                 │
│  }                                                        │
└─────────────────────────────────────────────────────────┘
                            ▲
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────┴────────┐                    ┌────────┴────────┐
│ apps/ittweb   │                    │ apps/personalpage│
│               │                    │                  │
│ _app.tsx or   │                    │ _app.tsx or      │
│ config file   │                    │ config file      │
│               │                    │                  │
│ registerDefault│                    │ registerDefault  │
│ AuthConfig()   │                    │ AuthConfig()     │
└───────────────┘                    └──────────────────┘
```

### 3.3 API Design

#### 3.3.1 Registration API

```typescript
// In packages/infrastructure/src/api/handlers/routeHandlers.ts

/**
 * Register a default auth configuration for the app
 * Should be called once during app initialization
 */
export function registerDefaultAuthConfig(authConfig: AuthConfig): void;

/**
 * Get the registered default auth configuration
 * Internal use only
 */
function getDefaultAuthConfig(): AuthConfig | null;
```

#### 3.3.2 Usage in Apps

```typescript
// apps/ittweb/src/pages/_app.tsx or config file
import { registerDefaultAuthConfig } from "@websites/infrastructure/api";
import { getIttwebAuthConfig } from "@/lib/auth-config";

// Register once at app startup
registerDefaultAuthConfig(getIttwebAuthConfig());
```

#### 3.3.3 Handler Behavior

```typescript
// Enhanced createApiHandler logic
const effectiveAuthConfig =
  options.authConfig || // Explicit override (highest priority)
  getDefaultAuthConfig() || // App default (medium priority)
  null; // No auth (lowest priority)

// Always fetch session if authConfig available (existing behavior)
let session: GenericSession | null = null;
if (effectiveAuthConfig) {
  session = await effectiveAuthConfig.getSession(req, res);
}
```

### 3.4 Design Decisions

#### Decision 1: Global Registry vs. Context-Based

**Chosen:** Global registry
**Rationale:**

- Simpler implementation
- Next.js API routes are stateless
- One auth config per app is sufficient
- No performance overhead

#### Decision 2: Registration Location

**Chosen:** App initialization (e.g., `_app.tsx` or config file)
**Rationale:**

- Clear, explicit setup
- Runs once per app instance
- Easy to find and maintain

#### Decision 3: Priority Order

**Chosen:** Handler options > Default > None
**Rationale:**

- Allows per-handler overrides when needed
- Maintains backward compatibility
- Flexible for edge cases

#### Decision 4: Session Fetching Strategy

**Chosen:** Always fetch if `authConfig` available (current behavior)
**Rationale:**

- Already implemented correctly
- Supports optional auth scenarios
- No breaking changes

---

## 4. Implementation Strategy

### 4.1 Phase 1: Core Infrastructure (packages/infrastructure)

#### Step 1.1: Add Registry to Generic Handler

**File:** `packages/infrastructure/src/api/handlers/routeHandlers.ts`

**Changes:**

1. Add global registry variable (module-level)
2. Implement `registerDefaultAuthConfig()` function
3. Implement internal `getDefaultAuthConfig()` function
4. Modify `createApiHandler` to use default when no explicit `authConfig`

**Code Changes:**

```typescript
// Module-level registry
let defaultAuthConfig: AuthConfig | null = null;

export function registerDefaultAuthConfig(authConfig: AuthConfig): void {
  if (defaultAuthConfig) {
    // Warn in development, allow override in production
    if (process.env.NODE_ENV === "development") {
      console.warn("Default auth config already registered. Overriding...");
    }
  }
  defaultAuthConfig = authConfig;
}

function getDefaultAuthConfig(): AuthConfig | null {
  return defaultAuthConfig;
}

// In createApiHandler:
const effectiveAuthConfig = options.authConfig || getDefaultAuthConfig();
```

#### Step 1.2: Export Registration Function

**File:** `packages/infrastructure/src/api/handlers/index.ts`

**Changes:**

- Export `registerDefaultAuthConfig`

#### Step 1.3: Update Type Definitions

**File:** `packages/infrastructure/src/api/handlers/routeHandlers.ts`

**Changes:**

- Document that `authConfig` in options is optional if default is registered
- Update JSDoc comments

### 4.2 Phase 2: App Integration (apps/ittweb)

#### Step 2.1: Create Auth Config Module

**File:** `apps/ittweb/src/lib/auth-config.ts` (new file)

**Purpose:** Centralize auth config creation

**Content:**

```typescript
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import type { AuthConfig, GenericSession } from "@websites/infrastructure/api";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getUserDataByDiscordIdServer } from "@/features/modules/community/users/services/userDataService.server";
import { isAdmin } from "@/features/modules/community/users";

export function getIttwebAuthConfig(): AuthConfig {
  return {
    getSession: async (
      req: NextApiRequest,
      res: NextApiResponse,
    ): Promise<Session | null> => {
      return await getServerSession(req, res, authOptions);
    },
    checkAdmin: async (session: GenericSession): Promise<boolean> => {
      const userData = await getUserDataByDiscordIdServer(
        session.discordId || "",
      );
      return isAdmin(userData?.role);
    },
  };
}
```

#### Step 2.2: Register in App Initialization

**File:** `apps/ittweb/src/pages/_app.tsx` or `apps/ittweb/src/lib/app-init.ts`

**Changes:**

- Import and call `registerDefaultAuthConfig(getIttwebAuthConfig())` once at startup

**Alternative:** Create `apps/ittweb/src/config/auth.ts` that gets imported by `_app.tsx`

#### Step 2.3: Update Wrapper (Deprecate, Keep for Compatibility)

**File:** `apps/ittweb/src/lib/api-wrapper.ts`

**Changes:**

- Add deprecation notice
- Keep functionality for backward compatibility
- Update to use default if available (optional enhancement)

#### Step 2.4: Fix Broken Handler

**File:** `apps/ittweb/src/pages/api/games/index.ts`

**Changes:**

- Remove manual `authConfig` requirement
- Rely on default auth config
- Session will now be available in context

### 4.3 Phase 3: App Integration (apps/personalpage)

#### Step 3.1: Create Auth Config Module

**File:** `apps/personalpage/src/lib/auth-config.ts` (new file)

**Similar to ittweb but with personalpage's auth system**

#### Step 3.2: Register in App Initialization

**Similar to ittweb**

### 4.4 Phase 4: Migration & Cleanup

#### Step 4.1: Update All Handlers to Use Generic Import

**Strategy:** Gradual migration

- Update imports from wrapper to generic
- Remove manual `authConfig` where default works
- Keep explicit `authConfig` only when needed for overrides

#### Step 4.2: Remove App-Specific Wrappers (Future)

**After all handlers migrated:**

- Mark wrappers as deprecated
- Remove in next major version
- Update documentation

---

## 5. Migration Plan

### 5.1 Migration Strategy: Gradual Rollout

**Principle:** Zero downtime, backward compatible, incremental

### 5.2 Migration Phases

#### Phase 1: Infrastructure (Week 1)

- ✅ Implement registry in `packages/infrastructure`
- ✅ Add tests for registry
- ✅ Update infrastructure package version

#### Phase 2: ITT Web Integration (Week 1-2)

- ✅ Create `auth-config.ts`
- ✅ Register in app initialization
- ✅ Fix `/api/games/index.ts` (the broken one)
- ✅ Test all existing handlers still work
- ✅ Update 5-10 handlers to use generic import

#### Phase 3: Personalpage Integration (Week 2)

- ✅ Similar to ITT web
- ✅ Test all handlers

#### Phase 4: Full Migration (Week 3-4)

- ✅ Update remaining handlers to use generic import
- ✅ Remove manual `authConfig` where not needed
- ✅ Update documentation

#### Phase 5: Cleanup (Week 5+)

- ✅ Mark wrappers as deprecated
- ✅ Add migration guide
- ✅ Plan removal in next major version

### 5.3 Migration Checklist per Handler

For each API handler:

- [ ] Change import from wrapper to generic (if using wrapper)
- [ ] Remove manual `authConfig` if using default
- [ ] Test handler still works
- [ ] Verify session available when expected
- [ ] Update any related tests

### 5.4 Rollback Plan

If issues arise:

1. Wrappers still exist and work (backward compatible)
2. Can revert to explicit `authConfig` in handlers
3. Registry is additive, doesn't break existing code

---

## 6. Testing Strategy

### 6.1 Unit Tests

#### Infrastructure Tests

**File:** `packages/infrastructure/src/api/handlers/__tests__/routeHandlers.test.ts` (new or update)

**Test Cases:**

1. ✅ Registry stores and retrieves default auth config
2. ✅ Handler uses explicit `authConfig` when provided (priority)
3. ✅ Handler uses default `authConfig` when no explicit provided
4. ✅ Handler works without any auth config (backward compatible)
5. ✅ Session fetched when default auth config registered
6. ✅ Session available in context even with `requireAuth: false`
7. ✅ Multiple registrations warn in development

#### App-Specific Tests

**File:** `apps/ittweb/__tests__/infrastructure/api/routeHandlers.test.ts` (update)

**Test Cases:**

1. ✅ Default auth config registered at app startup
2. ✅ Handlers get session from default config
3. ✅ Explicit `authConfig` overrides default

### 6.2 Integration Tests

#### Test Scenarios

1. ✅ Public endpoint (no auth) - works
2. ✅ Authenticated endpoint (`requireAuth: true`) - works
3. ✅ Optional auth endpoint (`requireAuth: false` but checks session) - **NEW - this was broken**
4. ✅ Admin endpoint (`requireAdmin: true`) - works
5. ✅ Handler with explicit `authConfig` override - works

### 6.3 E2E Tests

**File:** `apps/ittweb/e2e/api-auth.spec.ts` (update or create)

**Test Cases:**

1. ✅ Schedule game flow (the broken scenario)
2. ✅ Public API endpoints accessible
3. ✅ Protected endpoints require auth
4. ✅ Admin endpoints require admin role

### 6.4 Regression Tests

**Strategy:** Run full test suite after each phase

- All existing tests must pass
- No new failures introduced

---

## 7. Risk Mitigation

### 7.1 Identified Risks

#### Risk 1: Registry Not Initialized

**Impact:** High - Handlers won't get session
**Mitigation:**

- Clear documentation on registration
- Runtime warning if handler needs auth but no config
- TypeScript types guide correct usage

#### Risk 2: Multiple Registrations

**Impact:** Medium - Confusion, potential bugs
**Mitigation:**

- Warn in development mode
- Last registration wins (simple rule)
- Document best practice: register once in `_app.tsx`

#### Risk 3: Breaking Changes

**Impact:** High - Production issues
**Mitigation:**

- Fully backward compatible design
- Wrappers still work during migration
- Gradual rollout with testing

#### Risk 4: Performance Impact

**Impact:** Low - Registry lookup is O(1)
**Mitigation:**

- Module-level variable (no function call overhead)
- Only checked when no explicit `authConfig`
- Minimal performance impact

#### Risk 5: Type Safety

**Impact:** Medium - Runtime errors possible
**Mitigation:**

- Maintain full TypeScript support
- Generic types preserved
- Session type remains flexible

### 7.2 Rollback Procedures

1. **Immediate:** Revert to explicit `authConfig` in handlers
2. **Short-term:** Use app wrappers (still work)
3. **Long-term:** Revert infrastructure changes if needed

---

## 8. Documentation Updates

### 8.1 Code Documentation

#### Update Files:

1. `packages/infrastructure/src/api/handlers/routeHandlers.ts`
   - Document `registerDefaultAuthConfig()`
   - Update `ApiHandlerOptions` JSDoc
   - Explain default auth config behavior

2. `packages/infrastructure/src/api/README.md`
   - Add section on default auth config
   - Migration guide from wrappers

### 8.2 App Documentation

#### Update Files:

1. `apps/ittweb/docs/development/adding-api-routes.md`
   - Update examples to show default auth config
   - Remove wrapper usage examples
   - Add app initialization section

2. `apps/ittweb/docs/development/patterns/api-route-patterns.md`
   - Update authentication patterns
   - Show optional auth example (the fixed scenario)

3. `apps/ittweb/README.md`
   - Add note about auth configuration

### 8.3 Migration Guide

**New File:** `docs/MIGRATION_AUTH_CONSOLIDATION.md`

**Contents:**

- Why we're consolidating
- Step-by-step migration guide
- Common patterns and examples
- Troubleshooting

---

## 9. Success Metrics

### 9.1 Quantitative Metrics

- ✅ Zero authentication-related bugs in production
- ✅ 100% of handlers using unified pattern (post-migration)
- ✅ Zero app-specific authentication wrappers (post-cleanup)
- ✅ All tests passing
- ✅ Documentation coverage: 100%

### 9.2 Qualitative Metrics

- ✅ Developer experience: Easier to add new handlers
- ✅ Code maintainability: Single source of truth
- ✅ Onboarding: Clear, consistent patterns
- ✅ Bug prevention: Impossible to forget `authConfig`

---

## 10. Timeline and Milestones

### Week 1: Foundation

- **Day 1-2:** Implement registry in infrastructure
- **Day 3-4:** Write tests for registry
- **Day 5:** Code review, merge infrastructure changes

### Week 2: ITT Web Integration

- **Day 1:** Create auth config module, register in app
- **Day 2:** Fix broken `/api/games` handler
- **Day 3-4:** Migrate 10-15 handlers
- **Day 5:** Testing, bug fixes

### Week 3: Personalpage & Testing

- **Day 1-2:** Personalpage integration
- **Day 3-4:** Full test suite, E2E tests
- **Day 5:** Documentation updates

### Week 4: Full Migration

- **Day 1-3:** Migrate remaining handlers
- **Day 4:** Final testing
- **Day 5:** Documentation review, prepare for cleanup phase

### Week 5+: Cleanup

- Mark wrappers deprecated
- Plan removal in next major version

---

## 11. Implementation Checklist

### Infrastructure

- [ ] Add `registerDefaultAuthConfig()` function
- [ ] Add `getDefaultAuthConfig()` internal function
- [ ] Modify `createApiHandler` to use default
- [ ] Export registration function
- [ ] Add unit tests
- [ ] Update JSDoc comments
- [ ] Update infrastructure README

### ITT Web App

- [ ] Create `src/lib/auth-config.ts`
- [ ] Register in app initialization
- [ ] Fix `/api/games/index.ts`
- [ ] Update 5 handlers as proof of concept
- [ ] Test all handlers still work
- [ ] Update remaining handlers (gradual)
- [ ] Update documentation

### Personalpage App

- [ ] Create `src/lib/auth-config.ts`
- [ ] Register in app initialization
- [ ] Test all handlers
- [ ] Update documentation

### Testing

- [ ] Unit tests for registry
- [ ] Integration tests for handlers
- [ ] E2E tests for auth flows
- [ ] Regression test suite
- [ ] Performance testing

### Documentation

- [ ] Update infrastructure README
- [ ] Update API route patterns doc
- [ ] Update adding API routes guide
- [ ] Create migration guide
- [ ] Update app READMEs

### Cleanup (Future)

- [ ] Mark wrappers as deprecated
- [ ] Add deprecation warnings
- [ ] Plan removal timeline

---

## 12. Open Questions & Decisions Needed

### Q1: Registration Location

**Options:**

- A) `_app.tsx` (runs on every request in dev, once in prod)
- B) Config file imported by `_app.tsx`
- C) Next.js config file
- **Recommendation:** B - Config file for clarity

### Q2: Multiple App Instances

**Question:** What if app has multiple instances (edge functions, etc.)?
**Answer:** Each instance registers independently (stateless, safe)

### Q3: Wrapper Deprecation Timeline

**Question:** When to remove wrappers?
**Answer:** After full migration + 1 major version (6+ months)

### Q4: Error Handling

**Question:** What if default auth config fails to fetch session?
**Answer:** Same as current behavior - session is `null`, handler decides

---

## 13. Conclusion

This strategic plan provides a comprehensive approach to consolidating authentication patterns into a single, unified solution. The design is:

- **Backward Compatible:** Existing code continues working
- **Developer Friendly:** Zero configuration after setup
- **Type Safe:** Full TypeScript support maintained
- **Testable:** Clear testing strategy
- **Maintainable:** Single source of truth
- **Scalable:** Works for all current and future apps

The phased approach ensures zero downtime and allows for gradual migration with full rollback capability.

**Next Steps:**

1. Review and approve this plan
2. Begin Phase 1 implementation
3. Set up tracking for migration progress
4. Schedule regular check-ins during migration
