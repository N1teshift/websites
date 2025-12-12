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

## Validation

To ensure scripts follow conventions, you can validate them:

```bash
# Check if an app has all standard scripts
node scripts/validate-scripts.js <app-name>
```

## Documentation

When adding app-specific scripts:

1. **Document them in the app's README** - List all custom scripts with descriptions
2. **Use clear, descriptive names** - Script names should be self-explanatory
3. **Follow the naming patterns above** - Use colons for namespacing, kebab-case for multi-word names
4. **Group related scripts with colons** - `test:unit`, `test:integration`, `test:e2e`
5. **Keep scripts organized** - Group related scripts together in package.json

## Script Organization in package.json

Organize scripts in this order:

1. Standard scripts (dev, build, start, lint, format, type-check, test)
2. Test variants (test:watch, test:coverage, test:unit, etc.)
3. Analysis scripts (analyze, analyze:server, analyze:browser)
4. Validation scripts (validate:_, check:_)
5. Migration/utility scripts (migrate:_, fix:_)
6. App-specific scripts

Example:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "analyze": "cross-env ANALYZE=true next build",
    "validate:translations": "node scripts/validateTranslations.js"
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

## Common Patterns by Category

### Development

- `dev` - Standard development server
- `dev:verbose` - Development with verbose logging
- `dev:debug` - Development with debugging enabled

### Building

- `build` - Production build
- `build:check` - Type check and build
- `build:test` - Build for testing
- `build:analyze` - Build with bundle analysis

### Testing

- `test` - Run all tests
- `test:watch` - Watch mode
- `test:coverage` - With coverage
- `test:unit` - Unit tests only
- `test:integration` - Integration tests
- `test:e2e` - End-to-end tests
- `test:api` - API tests

### Analysis

- `analyze` - Full bundle analysis
- `analyze:server` - Server bundle only
- `analyze:browser` - Browser bundle only
- `analyze:coverage` - Coverage analysis

### Validation

- `validate:env` - Environment variables
- `validate:translations` - Translation files
- `validate:types` - Type checking
- `check:*` - Various check scripts

### Migration/Conversion

- `migrate:*` - Data migration scripts
- `convert:*` - Format conversion scripts
