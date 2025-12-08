# @websites/prettier-config

Shared Prettier configuration for all apps in the websites monorepo.

## Usage

### In your app's `.prettierrc.json`:

```json
{
  "extends": "@websites/prettier-config"
}
```

Or reference it directly:

```json
"@websites/prettier-config"
```

### In your app's `package.json`:

```json
{
  "prettier": "@websites/prettier-config"
}
```

## Configuration

This config enforces:
- Semicolons: `true`
- Quotes: Double quotes (single for JSX)
- Tab width: 2 spaces
- Trailing commas: ES5 compatible
- Print width: 100 characters
- Arrow parens: Always include
- Line endings: LF (Unix-style)
- Bracket spacing: `true`

## App-Specific Overrides

You can override specific rules in your app's `.prettierrc.json`:

```json
{
  "extends": "@websites/prettier-config",
  "printWidth": 120
}
```

## Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,css,md}\""
  }
}
```

## Integration with ESLint

This config works alongside `@websites/eslint-config`. Prettier handles formatting, ESLint handles code quality.

To avoid conflicts, ensure you have `eslint-config-prettier` installed (disables ESLint rules that conflict with Prettier).
