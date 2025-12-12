## 🔧 Best Practices Established

### Dependency Management

- Use **workspace protocol** (`workspace:*`) for internal packages
- Consolidate common dependencies (e.g., `date-fns` in infrastructure)
- Use **peer dependencies** for framework code (React, Next.js)

### Configuration

- Shared configs in `@websites/config-*` packages
- Apps extend base configs, add app-specific overrides
- Consistent patterns: ESLint, Prettier, Tailwind, TypeScript

### Documentation

- Keep only **current, actionable** documentation
- Archive completed migration docs (or delete - Git history preserves)
- Document conventions: path aliases, script naming, etc.

---
