# @websites/infrastructure Documentation

Shared infrastructure documentation for all websites in the monorepo.

## 📁 Documentation Structure

This package uses a **hybrid documentation approach**:

- **Module-level READMEs** (`src/*/README.md`) - API references and usage examples co-located with code
- **Package-level guides** (`docs/guides/`) - Cross-cutting patterns, best practices, and comprehensive guides
- **Architecture docs** (`docs/architecture/`) - Design decisions and system architecture

## 📚 Quick Navigation

### Getting Started
- **[Getting Started Guide](./guides/getting-started.md)** - Environment setup, configuration, initial setup

### Core Infrastructure Guides
- **[Error Handling](./guides/error-handling.md)** - Complete error handling patterns and best practices ✅
- **[Logging](./guides/logging.md)** - Logging system usage and patterns ✅
- **[Authentication](./guides/authentication.md)** - Authentication and authorization patterns ✅
- **[Internationalization (i18n)](./guides/i18n.md)** - i18n setup and usage patterns ✅
- **[Caching](./guides/caching.md)** - Caching strategies and patterns ✅
- **[API Patterns](./guides/api-patterns.md)** - API route handler patterns ✅
- **[Security](./guides/security.md)** - Security best practices and patterns ✅
- **[Monitoring](./guides/monitoring.md)** - Error tracking and performance monitoring ✅
- **[Performance](./guides/performance.md)** - Performance optimization strategies ✅

### Architecture
- **[Design Decisions](./architecture/design-decisions.md)** - Key architectural decisions and rationale

## 🔗 Module Documentation

Each module has its own README with API reference:

- **[Logging Module](../src/logging/README.md)** - `@websites/infrastructure/logging` ✅
- **[Auth Module](../src/auth/README.md)** - `@websites/infrastructure/auth` ✅
- **[API Module](../src/api/README.md)** - `@websites/infrastructure/api` ✅
- **[i18n Module](../src/i18n/README.md)** - `@websites/infrastructure/i18n` ✅
- **[Cache Module](../src/cache/README.md)** - `@websites/infrastructure/cache` ✅
- **[Monitoring Module](../src/monitoring/README.md)** - `@websites/infrastructure/monitoring` ✅
- **[Firebase Module](../src/firebase/README.md)** - `@websites/infrastructure/firebase` ✅
- **[Clients Module](../src/clients/README.md)** - `@websites/infrastructure/clients` ✅

## 📖 Usage

### Importing Infrastructure

```typescript
// Logging
import { createComponentLogger, logError } from '@websites/infrastructure/logging';

// Authentication
import { UserService } from '@websites/infrastructure/auth';

// i18n
import { useFallbackTranslation } from '@websites/infrastructure/i18n';

// API Handlers
import { createApiHandler } from '@websites/infrastructure/api';

// Monitoring
import { captureError } from '@websites/infrastructure/monitoring';
```

## 🎯 Documentation Philosophy

This package follows a **hybrid documentation approach**:

1. **Code-Proximity**: Module-level READMEs live next to the code they document (`src/*/README.md`)
   - API references
   - Usage examples
   - Quick start guides

2. **Centralized Guides**: Package-level guides in `docs/guides/` for:
   - Cross-cutting patterns
   - Best practices
   - Comprehensive tutorials
   - Architecture decisions

3. **App-Specific Docs**: Stay in app `docs/` directories:
   - Business logic documentation
   - Feature-specific guides
   - App-specific setup

## 🔄 Migration Status

This documentation structure has been migrated from app-level docs:
- ✅ Structure created
- ✅ Core guides migrated from `apps/ittweb/docs/shared/` and `apps/personalpage/docs/architecture/`
- ✅ Module READMEs created in `src/*/README.md`
- ✅ App-level docs updated with references to package docs
- ✅ Migration notices added to migrated files

See [Migration Summary](./MIGRATION-SUMMARY.md) for complete migration details.

## 📝 Contributing

When adding new infrastructure features:

1. **Create module-level README** in `src/[module]/README.md` with:
   - API reference
   - Basic usage examples
   - Quick start

2. **Update package guide** in `docs/guides/` if needed for:
   - Cross-cutting patterns
   - Best practices
   - Comprehensive tutorials

3. **Update this README** to link to new documentation
