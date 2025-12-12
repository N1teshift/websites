# Prettier Setup Complete

Prettier has been successfully set up across the monorepo for consistent code formatting.

## What Was Added

### 1. Shared Prettier Config Package

- **Location**: `packages/prettier-config/`
- **Package**: `@websites/prettier-config`
- Provides consistent formatting rules across all apps

### 2. Configuration Files

- Root `.prettierignore` - Excludes build artifacts, dependencies, etc.
- Each app has `.prettierrc.json` that extends the shared config

### 3. Format Scripts

- Root: `pnpm format` and `pnpm format:check`
- Each app: `format` and `format:check` scripts
- Integrated with Turborepo for parallel execution

### 4. Pre-commit Hooks

- **Husky**: Git hooks manager
- **lint-staged**: Runs formatters/linters on staged files only
- Automatically formats and lints code before commits

## Usage

### Format All Code

```bash
pnpm format
```

### Check Formatting (CI-friendly)

```bash
pnpm format:check
```

### Format Specific App

```bash
pnpm --filter personalpage format
```

### Manual Formatting

Prettier will automatically format on commit, but you can also:

- Use your editor's format-on-save (recommended)
- Run `pnpm format` manually
- Use Prettier VS Code extension

## Configuration

The shared config enforces:

- **Semicolons**: `true`
- **Quotes**: Double quotes (single for JSX)
- **Tab width**: 2 spaces
- **Trailing commas**: ES5 compatible
- **Print width**: 100 characters
- **Line endings**: LF (Unix-style)

## App-Specific Overrides

If an app needs different settings, override in `.prettierrc.json`:

```json
{
  "@websites/prettier-config",
  "printWidth": 120
}
```

## Integration with ESLint

Prettier works alongside ESLint:

- **Prettier**: Handles formatting (spacing, quotes, line breaks)
- **ESLint**: Handles code quality (best practices, potential bugs)

No conflicts expected, but if you see any, ensure `eslint-config-prettier` is installed (disables conflicting ESLint rules).

## Next Steps

1. **Install dependencies** (if not done):

   ```bash
   pnpm install
   ```

2. **Initialize Husky** (runs automatically on install):

   ```bash
   pnpm prepare
   ```

3. **Format existing code** (one-time):

   ```bash
   pnpm format
   ```

4. **Commit the changes** - Prettier will now run automatically on future commits!

## Troubleshooting

### Husky not running

- Run `pnpm prepare` manually
- Ensure `.husky/pre-commit` is executable (Unix/Mac)
- Check that Husky is installed: `pnpm list husky`

### Formatting conflicts

- Run `pnpm format` to fix all formatting
- Check `.prettierignore` if files aren't being formatted
- Verify `.prettierrc.json` extends the shared config

### Editor integration

- Install Prettier extension for your editor
- Enable format-on-save for best experience
- VS Code: Settings → Format On Save → ✅

## Files Changed

### New Files

- `packages/prettier-config/` - Shared Prettier config package
- `.prettierignore` - Root ignore file
- `.lintstagedrc.json` - lint-staged configuration
- `.husky/pre-commit` - Pre-commit hook
- `apps/*/.prettierrc.json` - App-specific configs

### Updated Files

- `package.json` (root) - Added Prettier, Husky, lint-staged
- `package.json` (all apps) - Added format scripts and prettier-config dependency
- `turbo.json` - Added format tasks
- `README.md` - Added Prettier documentation
