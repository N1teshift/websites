# @websites/eslint-config

Shared ESLint configuration for all apps in the websites monorepo.
Uses ESLint v9 flat config format.

## Usage

In your app's `eslint.config.js`:

```javascript
import baseConfig from "@websites/eslint-config";

export default [...baseConfig];
```

### With App-Specific Overrides

```javascript
import baseConfig from "@websites/eslint-config";

export default [
  ...baseConfig,
  {
    rules: {
      // Add app-specific rule overrides here
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": "error",
    },
  },
];
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

## Migration from Old Format

If you're migrating from `.eslintrc.json`:

1. Delete `.eslintrc.json`
2. Create `eslint.config.js` with:
   ```javascript
   import baseConfig from "@websites/eslint-config";
   export default [...baseConfig];
   ```
3. Ensure your app's `package.json` has `"type": "module"` (or use `.mjs` extension)

## Rules

This config:

- Extends Next.js recommended rules and TypeScript rules
- Allows unused variables/parameters prefixed with `_`
- Allows `console` statements (useful for development)
- Relaxes rules for test files
- Ignores common build/dependency directories

## Dependencies

This package requires:

- `eslint@^9.0.0`
- `@eslint/eslintrc@^3.2.0` (for compatibility with Next.js configs)
- `@eslint/js@^9.18.0` (base recommended rules)
- `eslint-config-next@^15.5.7` (Next.js ESLint config)
