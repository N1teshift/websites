# @websites/eslint-config

Shared ESLint configuration for all apps in the websites monorepo.

## Usage

In your app's `.eslintrc.json`:

```json
{
  "extends": ["@websites/eslint-config"],
  "rules": {
    // Add app-specific overrides here if needed
  }
}
```

## Installation

This package is automatically available via the workspace. No installation needed.

If you're adding it to a new app, ensure the app has `eslint` installed:

```json
{
  "devDependencies": {
    "eslint": "^9.0.0"
  }
}
```

## Rules

This config:
- Extends Next.js recommended rules and TypeScript rules
- Allows unused variables/parameters prefixed with `_`
- Allows `console` statements (useful for development)
- Relaxes rules for test files
- Ignores common build/dependency directories

## Customization

Each app can override specific rules in their `.eslintrc.json`:

```json
{
  "extends": ["@websites/eslint-config"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "no-console": "error"
  }
}
```
