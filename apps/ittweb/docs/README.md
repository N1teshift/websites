# ITT Web Documentation

Welcome to the ITT Web documentation. This documentation is organized into three main sections based on purpose and lifecycle.

## 📁 Documentation Structure

### 🚀 Production Documentation (`production/`)
**What stays when the project is finished** - Custom business logic, domain-specific functionality, and user-facing features that define your website.

- **[API Reference](./production/api/)** - Complete API documentation for your custom endpoints
- **[Database](./production/database/)** - Firestore schemas and indexes
- **[Systems](./production/systems/)** - Game stats, replay parser, data pipeline
- **[Product](./production/product/)** - Feature descriptions and user roles
- **[Security](./production/security/)** - Your security implementations

### 🛠️ Development Documentation (`development/`)
**Internal development docs** - Learning journey, development processes, testing, and operational knowledge. Safe to remove when finished.

- **[Getting Started](./development/getting-started/)** - Setup guides and troubleshooting
- **[Development Guide](./development/)** - Code patterns, architecture, conventions
- **[Operations](./development/operations/)** - Testing, deployment, CI/CD, monitoring
- **[Performance](./development/performance/)** - Optimization strategies
- **[Archive](./development/archive/)** - Historical docs and research notes

### 📚 Shared Reference (`shared/`)
**Reference materials** - Style guides, error handling patterns, and documentation standards.

> **📦 Infrastructure Documentation Migration**: Many shared infrastructure patterns have been moved to `@websites/infrastructure` package. See [Infrastructure Documentation](../../../packages/infrastructure/docs/README.md) for:
> - Error handling, logging, authentication, i18n, caching, API patterns, security, monitoring, and performance guides
> - Module-level API references

- **[Error Handling](../../../packages/infrastructure/docs/guides/error-handling.md)** - Error handling patterns and best practices
- **[Known Issues](./shared/KNOWN_ISSUES.md)** - Technical debt and known issues
- **[Performance](../../../packages/infrastructure/docs/guides/performance.md)** - Performance optimization strategies
- **[Security](../../../packages/infrastructure/docs/guides/security.md)** - Security best practices
- **[Documentation Style](./shared/DOCUMENTATION_STYLE.md)** - Documentation standards
- **[Documentation Lifecycle](./shared/documentation-lifecycle.md)** - Lifecycle management

## 🔗 Module Documentation

All 13 feature modules have README files in `src/features/modules/[module-name]/README.md`:
- `games`, `players`, `standings`, `analytics`, `archives`, `scheduled-games`, `blog`, `guides`, `classes`, `meta`, `map-analyzer`, `tools`, `entries`

## 📖 Quick Start

- **For production docs**: Start with [`production/README.md`](./production/)
- **For development setup**: See [`development/getting-started/setup.md`](./development/getting-started/setup.md)
- **For API reference**: Check [`production/api/README.md`](./production/api/)

---

**Note**: When your project is production-ready, you can safely delete the `development/` folder while keeping `production/` and `shared/`.
