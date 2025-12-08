# Script Naming Conventions

This document defines the standard script naming conventions for all apps in the monorepo.

## Standard Scripts (All Apps)

All apps should implement these standard scripts:

### Development

- `dev` - Start development server
- `dev:verbose` - Start development server with verbose logging (optional)

### Building

- `build` - Build for production
- `build:check` - Type check and build (optional)
- `start` - Start production server

### Code Quality

- `lint` - Run ESLint
- `format` - Format code with Prettier
- `format:check` - Check formatting without making changes
- `type-check` - Run TypeScript type checking

### Testing

- `test` - Run tests
- `test:watch` - Run tests in watch mode (optional)
- `test:coverage` - Run tests with coverage (optional)

## App-Specific Scripts

Apps may define additional scripts for their specific needs. Follow these patterns:

### Naming Patterns

- Use colons (`:`) to separate namespaces: `test:unit`, `test:integration`
- Use kebab-case for multi-word names: `validate:translations`
- Prefix related scripts with a common namespace: `test:unit`, `test:e2e`

### Common Patterns

#### Analysis

- `analyze` - Bundle size analysis
- `analyze:server` - Server bundle analysis
- `analyze:browser` - Browser bundle analysis

#### Validation

- `validate:*` - Validation scripts (e.g., `validate:translations`, `validate:env`)

#### Migration/Conversion

- `migrate:*` - Data migration scripts (e.g., `migrate:weekly-to-classwork`)

#### Testing Variants

- `test:unit` - Unit tests only
- `test:integration` - Integration tests only
- `test:e2e` - End-to-end tests
- `test:api` - API tests

## Examples

### Good ✅

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "test": "jest",
    "test:unit": "jest --testNamePattern='unit'",
    "test:e2e": "playwright test",
    "analyze": "cross-env ANALYZE=true next build",
    "validate:translations": "node scripts/validateTranslations.js"
  }
}
```

### Avoid ❌

```json
{
  "scripts": {
    "devServer": "next dev", // Should be "dev"
    "runTests": "jest", // Should be "test"
    "check_types": "tsc --noEmit", // Should be "type-check" (kebab-case)
    "testUnit": "jest --unit" // Should be "test:unit" (use colon)
  }
}
```

## Root-Level Scripts

The root `package.json` provides these scripts that work across all apps:

- `dev` - Run dev for all apps
- `build` - Build all apps
- `lint` - Lint all apps
- `format` - Format all apps
- `format:check` - Check formatting for all apps
- `type-check` - Type check all apps
- `test` - Test all apps
- `clean` - Clean all build artifacts

## Documentation

When adding app-specific scripts:

1. Document them in the app's README
2. Use clear, descriptive names
3. Follow the naming patterns above
4. Group related scripts with colons
