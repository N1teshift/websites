# Design Decisions

**Key architectural decisions and rationale for @websites/infrastructure**

## Documentation Architecture

### Decision: Hybrid Approach

**Chosen Approach:** Code-proximity for API docs + Centralized guides

**Rationale:**
- Module-level READMEs stay close to code, making them easy to find and update
- Package-level guides provide comprehensive patterns and best practices
- Balances discoverability with maintainability

**Structure:**
- `src/*/README.md` - API references and quick starts
- `docs/guides/` - Cross-cutting patterns and comprehensive guides
- `docs/architecture/` - Design decisions and system architecture

## Logging System

### Decision: Console-Based Logging

**Chosen Approach:** Custom console-based logger instead of external library (e.g., Winston)

**Rationale:**
- Zero dependencies
- Works client and server side
- No bundle size impact
- Simple API matching console methods
- Easy migration path if needed later

**Trade-offs:**
- Less features than Winston (file logging, remote logging)
- Manual implementation of advanced features if needed

## Error Handling

### Decision: Three-Layer Error Pattern

**Chosen Approach:** Service → API → Component error handling layers

**Rationale:**
- Clear separation of concerns
- Errors logged with full context at service layer
- User-friendly messages at component layer
- Appropriate HTTP status codes at API layer

## Authentication

### Decision: Generic Session Type

**Chosen Approach:** `GenericSession` type that can be extended by apps

**Rationale:**
- Supports different auth providers (NextAuth, JWT, custom)
- Apps can use their own session types
- Infrastructure package remains framework-agnostic

## Internationalization

### Decision: Namespace-Based i18n

**Chosen Approach:** Namespace strategy with fallback support

**Rationale:**
- Organized translations by feature
- Reduces bundle size (only load needed namespaces)
- Clear fallback hierarchy
- Works with next-i18next

## Caching

### Decision: Multi-Layer Caching

**Chosen Approach:** In-memory + localStorage + optional persistence

**Rationale:**
- Performance optimization
- User preference persistence
- Cross-tab support via localStorage
- Configurable expiry and persistence

## API Handlers

### Decision: createApiHandler Wrapper

**Chosen Approach:** Wrapper function for consistent error handling

**Rationale:**
- Automatic error catching and logging
- Consistent response format
- Production-safe error messages
- Built-in validation support

## Related Documentation

- [Package README](../README.md) - Package overview
- [Getting Started Guide](../guides/getting-started.md) - Setup instructions
