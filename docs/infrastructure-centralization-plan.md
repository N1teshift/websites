# Infrastructure Centralization Plan

Consolidate shared infrastructure functionality from individual apps into the monorepo's `packages` folder to eliminate duplication, standardize best practices, and simplify maintenance across all 4 websites.

## User Review Required

> [!IMPORTANT]
> **Major Architectural Changes**
> This plan involves extracting significant infrastructure code from individual apps into shared packages. This will:
> - Change import paths across multiple apps
> - Require coordinated updates to all apps
> - Potentially affect existing functionality if not done carefully
> 
> **Decision Points:**
> 1. Which infrastructure areas should be prioritized first?
> 2. Should we migrate incrementally (one package at a time) or comprehensively?
> 3. Are there any app-specific customizations that should remain local?

> [!WARNING]
> **Breaking Changes**
> - All apps will need to update their imports from local paths to workspace packages
> - Some configuration may need to be externalized to environment variables
> - Testing will be required across all apps after each migration

## Current State Analysis

### Existing Packages

The monorepo already has 4 packages:

1. **[@websites/infrastructure](file:///c:/Users/user/source/repos/websites/packages/infrastructure)** - Currently minimal
   - i18n utilities (useFallbackTranslation, TranslationNamespaceContext)
   - Logging utilities (Logger, createComponentLogger, error handling)

2. **[@websites/ui](file:///c:/Users/user/source/repos/websites/packages/ui)** - Well-established
   - 30+ shared UI components (Button, Card, Layout, etc.)
   - Already used by all apps

3. **[@websites/config](file:///c:/Users/user/source/repos/websites/packages/config)** - Minimal
   - Base TypeScript configuration

4. **[@websites/test-utils](file:///c:/Users/user/source/repos/websites/packages/test-utils)** - Established
   - Jest configuration
   - Testing utilities

### App Infrastructure Analysis

#### [ittweb](file:///c:/Users/user/source/repos/websites/apps/ittweb/src/features/infrastructure)
**Most Advanced** - Extensive infrastructure with best practices:
- **API** - Route handlers, query parsing, Zod validation, Firebase integration
- **Lib** - Cache utilities (SWR, request cache, analytics cache), Next.js helpers, services
- **Hooks** - Translation hooks, data fetching hooks, accessibility hooks
- **Utils** - Object utils, time utils, accessibility helpers, service helpers
- **Components** - Layout, loading, feedback components
- **Logging** - Component logger
- **Monitoring** - Performance monitoring

#### [personalpage](file:///c:/Users/user/source/repos/websites/apps/personalpage/src/features/infrastructure)
**Comprehensive** - Different strengths:
- **API** - Self-contained API clients (OpenAI, Firebase, Google, Microsoft), route handlers
- **Auth** - Complete OAuth system (Google), JWT session management, user service
- **Cache** - Caching strategies
- **Shared** - UI components and utilities

#### [MafaldaGarcia](file:///c:/Users/user/source/repos/websites/apps/MafaldaGarcia)
**Minimal** - No infrastructure folder, relies on packages

#### [templatepage](file:///c:/Users/user/source/repos/websites/apps/templatepage)
**Minimal** - No infrastructure folder, relies on packages

### Key Findings

**Duplication Identified:**
- ✅ **Firebase** - Both ittweb and personalpage have Firebase clients
- ✅ **API Route Handlers** - Both have similar route handler patterns
- ✅ **Authentication** - personalpage has OAuth, ittweb uses next-auth
- ✅ **Caching** - Both have cache utilities (SWR, request cache)
- ✅ **Logging** - ittweb has advanced logging (already partially in @websites/infrastructure)
- ✅ **API Clients** - personalpage has self-contained clients (OpenAI, Google, Microsoft)

**Best Practices to Consolidate:**
- ittweb's Zod validation patterns
- ittweb's route handler utilities
- personalpage's self-contained API client architecture
- personalpage's OAuth infrastructure
- ittweb's caching strategies
- ittweb's monitoring utilities

## Proposed Changes

### Phase 1: Core API Infrastructure

Expand `@websites/infrastructure` with core API utilities from ittweb.

#### [NEW] [@websites/infrastructure/api](file:///c:/Users/user/source/repos/websites/packages/infrastructure/src/api)

**From ittweb:**
- `routeHandlers.ts` - Standardized API route handler utilities
- `queryParser.ts` - Query parameter parsing
- `zodValidation.ts` - Zod validation helpers
- `schemas.ts` - Common Zod schemas

**Benefits:**
- Standardize API patterns across all apps
- Type-safe request validation
- Consistent error handling

---

### Phase 2: Firebase Integration

Consolidate Firebase implementations into a single, comprehensive package.

#### [EXPAND] [@websites/infrastructure/firebase](file:///c:/Users/user/source/repos/websites/packages/infrastructure/src/firebase)

**From ittweb:**
- Firebase Admin SDK setup
- Firestore helpers
- Server/client awareness

**From personalpage:**
- Firebase client configuration
- Error handling patterns

**New Structure:**
```
firebase/
├── admin.ts          # Server-side Admin SDK
├── client.ts         # Client-side SDK
├── helpers.ts        # Firestore helpers
├── errorHandler.ts   # Firebase-specific errors
└── index.ts          # Exports
```

---

### Phase 3: Authentication & Authorization

Create a new authentication package combining best practices.

#### [NEW] [@websites/infrastructure/auth](file:///c:/Users/user/source/repos/websites/packages/infrastructure/src/auth)

**From personalpage:**
- OAuth utilities (Google, Microsoft)
- JWT session management
- User service patterns

**From ittweb:**
- next-auth integration patterns
- Session helpers

**New Structure:**
```
auth/
├── oauth/
│   ├── google.ts     # Google OAuth
│   └── microsoft.ts  # Microsoft OAuth
├── session.ts        # JWT session management
├── userService.ts    # User CRUD operations
├── AuthContext.tsx   # React context
└── index.ts
```

---

### Phase 4: External API Clients

Create self-contained API client packages.

#### [NEW] [@websites/infrastructure/clients](file:///c:/Users/user/source/repos/websites/packages/infrastructure/src/clients)

**From personalpage:**
- OpenAI client
- Google Calendar client
- Microsoft Graph client
- Email client

**Structure:**
```
clients/
├── openai/
│   ├── client.ts
│   ├── config.ts
│   ├── errorHandler.ts
│   └── types.ts
├── google/
│   ├── calendar.ts
│   └── auth.ts
├── microsoft/
│   └── calendar.ts
└── email/
    └── client.ts
```

---

### Phase 5: Caching & Performance

Consolidate caching strategies.

#### [NEW] [@websites/infrastructure/cache](file:///c:/Users/user/source/repos/websites/packages/infrastructure/src/cache)

**From ittweb:**
- SWR configuration
- Request cache
- Analytics cache

**From personalpage:**
- Cache strategies

**Structure:**
```
cache/
├── swr.ts            # SWR config
├── request.ts        # Request-scoped cache
├── firestore.ts      # Firestore cache
└── index.ts
```

---

### Phase 6: Utilities & Hooks

Consolidate shared utilities and hooks.

#### [NEW] [@websites/infrastructure/hooks](file:///c:/Users/user/source/repos/websites/packages/infrastructure/src/hooks)

**From ittweb:**
- `useFallbackTranslation` (already exists)
- `useDataFetch` hooks
- `useAccessibility` hooks

#### [NEW] [@websites/infrastructure/utils](file:///c:/Users/user/source/repos/websites/packages/infrastructure/src/utils)

**From ittweb:**
- Object utilities
- Time/timestamp utilities
- Accessibility helpers
- Service helpers

**From personalpage:**
- Shared utilities

---

### Phase 7: Monitoring & Observability

Create monitoring package.

#### [NEW] [@websites/infrastructure/monitoring](file:///c:/Users/user/source/repos/websites/packages/infrastructure/src/monitoring)

**From ittweb:**
- Performance monitoring
- Error tracking
- Analytics integration

---

### Phase 8: Testing Infrastructure

Expand test utilities.

#### [EXPAND] [@websites/test-utils](file:///c:/Users/user/source/repos/websites/packages/test-utils)

**From ittweb:**
- Jest configuration (already exists)
- Testing utilities
- Mock factories

**From personalpage:**
- Test helpers
- Fixture utilities

---

## Migration Strategy

### Approach: Incremental Migration

1. **Phase-by-phase** - Migrate one infrastructure area at a time
2. **Test after each phase** - Ensure all apps work after each migration
3. **Backward compatibility** - Keep old imports working temporarily with deprecation warnings
4. **Documentation** - Update READMEs and migration guides

### Per-Phase Steps

For each phase:

1. **Extract** - Copy code to `@websites/infrastructure`
2. **Adapt** - Make code generic, remove app-specific logic
3. **Test** - Add unit tests for the package
4. **Integrate** - Update one app to use the package
5. **Validate** - Test the app thoroughly
6. **Rollout** - Update remaining apps
7. **Cleanup** - Remove old code from apps

### Dependency Management

```json
// All apps will depend on:
{
  "dependencies": {
    "@websites/infrastructure": "workspace:*",
    "@websites/ui": "workspace:*"
  }
}
```

### Import Path Changes

**Before:**
```typescript
import { createApiHandler } from '@/features/infrastructure/api';
import { getFirestoreAdmin } from '@/features/infrastructure/api/firebase/admin';
```

**After:**
```typescript
import { createApiHandler } from '@websites/infrastructure/api';
import { getFirestoreAdmin } from '@websites/infrastructure/firebase';
```

---

## Package Structure (Final State)

```
packages/
├── infrastructure/
│   ├── src/
│   │   ├── api/              # API route handlers, validation
│   │   ├── auth/             # Authentication & authorization
│   │   ├── cache/            # Caching strategies
│   │   ├── clients/          # External API clients
│   │   ├── firebase/         # Firebase integration
│   │   ├── hooks/            # React hooks
│   │   ├── i18n/             # Internationalization (existing)
│   │   ├── logging/          # Logging utilities (existing)
│   │   ├── monitoring/       # Performance & error tracking
│   │   ├── utils/            # Shared utilities
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── ui/                       # Existing, no changes
├── config/                   # Existing, no changes
└── test-utils/               # Expand with more utilities
```

---

## Verification Plan

### Automated Tests

#### Package-Level Tests
```bash
# Run tests for infrastructure package
cd packages/infrastructure
pnpm test

# Type checking
pnpm type-check
```

#### App-Level Tests
```bash
# Test each app after migration
cd apps/ittweb
pnpm test
pnpm type-check
pnpm build

cd apps/personalpage
pnpm test
pnpm type-check
pnpm build

cd apps/MafaldaGarcia
pnpm type-check
pnpm build

cd apps/templatepage
pnpm type-check
pnpm build
```

#### Integration Tests
```bash
# From monorepo root
pnpm test          # Run all tests
pnpm type-check    # Type check all packages
pnpm build         # Build all apps
```

### Manual Verification

After each phase migration:

1. **Start dev servers** for all apps:
   ```bash
   pnpm dev
   ```

2. **Test core functionality** in each app:
   - ittweb: Navigate to main pages, test replay upload, check analytics
   - personalpage: Test authentication, calendar integration, math generator
   - MafaldaGarcia: Navigate pages, check image loading
   - templatepage: Navigate pages, check basic functionality

3. **Test migrated features specifically**:
   - Phase 1 (API): Test API routes in ittweb and personalpage
   - Phase 2 (Firebase): Test Firestore operations
   - Phase 3 (Auth): Test login/logout flows
   - Phase 4 (Clients): Test external API integrations
   - Phase 5 (Cache): Verify caching behavior
   - Phase 6 (Utils): Test utility functions
   - Phase 7 (Monitoring): Check error tracking
   - Phase 8 (Testing): Run test suites

4. **Check for errors**:
   - Browser console errors
   - Server console errors
   - Build warnings
   - Type errors

### Success Criteria

- ✅ All apps build successfully
- ✅ All tests pass
- ✅ No TypeScript errors
- ✅ No runtime errors in dev mode
- ✅ All core functionality works in each app
- ✅ Code duplication eliminated
- ✅ Import paths updated consistently
- ✅ Documentation updated

---

## Risk Mitigation

### Risks

1. **Breaking changes** - Apps may break during migration
2. **Configuration drift** - Apps may have subtle config differences
3. **Hidden dependencies** - Code may have unexpected dependencies
4. **Testing gaps** - Not all functionality may be covered by tests

### Mitigation Strategies

1. **Incremental approach** - Migrate one phase at a time
2. **Feature flags** - Use flags to toggle between old/new implementations
3. **Comprehensive testing** - Test thoroughly after each phase
4. **Rollback plan** - Keep old code until migration is verified
5. **Documentation** - Document all changes and migration steps
6. **Code review** - Review all changes before merging

---

## Timeline Estimate

- **Phase 1** (API Infrastructure): 2-3 days
- **Phase 2** (Firebase): 1-2 days
- **Phase 3** (Auth): 2-3 days
- **Phase 4** (API Clients): 2-3 days
- **Phase 5** (Caching): 1-2 days
- **Phase 6** (Utils/Hooks): 1-2 days
- **Phase 7** (Monitoring): 1-2 days
- **Phase 8** (Testing): 1-2 days

**Total: 11-19 days** (depending on complexity and testing)

---

## Next Steps

1. **Review this plan** - Discuss priorities and approach
2. **Choose starting phase** - Decide which phase to tackle first
3. **Create detailed implementation plan** - For the chosen phase
4. **Begin migration** - Start with the selected phase
5. **Iterate** - Complete remaining phases incrementally
