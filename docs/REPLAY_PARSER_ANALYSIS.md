# Replay Parser Analysis: Monorepo vs Standalone

## Problem Summary

When uploading a replay file in the monorepo version, `w3gjs` throws multiple `RangeError: The value of "offset" is out of range` errors during parsing. The same replay files work correctly in the standalone version.

## Key Differences Found

### 1. Next.js Configuration

**Monorepo (`apps/ittweb/config/next.config.ts`):**

- Uses `createBaseNextConfig()` from `@websites/infrastructure/config`
- Base config includes:
  - `transpilePackages: ['@websites/infrastructure', '@websites/ui']`
  - `serverExternalPackages` list (does NOT include `w3gjs`)
  - Webpack configuration for ES modules
  - Node.js module fallbacks for client-side

**Standalone (`C:\Users\user\source\repos\ittweb\config\next.config.ts`):**

- Custom webpack configuration
- No `transpilePackages` specified
- No `serverExternalPackages` specified
- Similar ES module handling, but applied differently

### 2. Parser Implementation

**Code Differences:**

- **Monorepo:** Line 28: `const parsed = (await replay.parse(buffer)) as unknown as ParsedReplay;`
- **Standalone:** Line 23: `const parsed = await replay.parse(buffer) as unknown as ParsedReplay;`
  - Minor syntax difference (parentheses), but functionally identical

**Logic Differences:**

- **Monorepo:** Uses slot index matching first, then name matching
- **Standalone:** Uses name matching first, then slot index
- **Standalone:** Has additional `matchedSlotIndices` tracking
- **Standalone:** Has `ParsingSummary` return value
- **Standalone:** Has more sophisticated flag derivation using ITT metadata `result` field

### 3. Package Versions

Both projects use:

- `w3gjs: ^3.0.0` (same version)
- `formidable: ^3.5.4` (same version)
- Both have `"type": "module"` in package.json

### 4. Buffer Handling

**Both versions:**

- Read file: `const fileBuffer = await fs.readFile(replayFile.filepath);`
- Pass directly: `await parseReplayFile(fileBuffer, {...})`
- No differences in buffer reading or passing

## Root Cause Hypothesis

The `RangeError: offset out of range` errors suggest that **`w3gjs` is being bundled/transpiled incorrectly by webpack in the monorepo**, causing it to mishandle Buffer objects.

### Why This Happens:

1. **Webpack Bundling:** The base config doesn't exclude `w3gjs` from bundling. If webpack tries to bundle it, it may:
   - Transform Buffer operations incorrectly
   - Break internal offset calculations
   - Corrupt binary data handling

2. **Module Resolution:** The base config's webpack setup might be resolving `w3gjs` differently, potentially:
   - Using a different entry point
   - Bundling dependencies incorrectly
   - Breaking ESM/CJS interop

3. **Transpilation:** While `w3gjs` isn't in `transpilePackages`, the webpack ES module rules might still affect it:
   - The `fullySpecified: false` rule could cause incorrect module resolution
   - The `extensionAlias` configuration might interfere

## Evidence

1. **Error Pattern:** The errors are consistent `RangeError` about offset being out of range, which is a classic sign of:
   - Buffer corruption
   - Incorrect buffer slicing/reading
   - Webpack transforming binary operations incorrectly

2. **Works in Standalone:** The standalone version works, and the main difference is the webpack configuration

3. **Error Location:** Errors occur at `replay.parse(buffer)` - the exact point where w3gjs reads the buffer

4. **Stack Trace Anomaly:** The stack trace shows `default.requireAuth` which suggests there might also be an export/import issue, but that's separate from the RangeError

## Recommended Solutions

### Solution 1: Exclude w3gjs from Webpack Bundling (Recommended)

Add `w3gjs` to `serverExternalPackages` in the base config or app config:

```typescript
serverExternalPackages: [
  ...SERVER_ONLY_PACKAGES,
  'next-i18next',
  '@reduxjs/toolkit',
  'redux',
  'react-redux',
  'w3gjs', // Add this
],
```

### Solution 2: Add w3gjs to Webpack Externals

In the app's webpack config, explicitly externalize w3gjs:

```typescript
if (isServer) {
  config.externals = config.externals || [];
  if (Array.isArray(config.externals)) {
    config.externals.push({
      w3gjs: "commonjs w3gjs",
    });
  }
}
```

### Solution 3: Add to transpilePackages (Alternative)

If w3gjs needs to be transpiled, add it explicitly:

```typescript
transpilePackages: [
  '@websites/infrastructure',
  '@websites/ui',
  'w3gjs', // Add this
],
```

### Solution 4: Verify Buffer Handling

Ensure the buffer is a proper Node.js Buffer before passing to w3gjs:

```typescript
// Ensure buffer is a proper Buffer instance
if (!Buffer.isBuffer(fileBuffer)) {
  fileBuffer = Buffer.from(fileBuffer);
}
```

## Additional Observations

1. **Parser Logic Differences:** The standalone version has more sophisticated player matching and flag derivation. Consider porting those improvements to the monorepo version.

2. **Error Handling:** The standalone version might be silently catching these errors (the comment in `parse-replay.mjs` mentions "RangeErrors from w3gjs are automatically suppressed"), but the monorepo version is letting them through.

3. **Module System:** Both use ESM (`"type": "module"`), but webpack might be handling the import differently in the monorepo due to the base config.

## Next Steps

1. **Immediate:** Add `w3gjs` to `serverExternalPackages` or webpack externals
2. **Verify:** Test with the same replay file that's failing
3. **Port Improvements:** Consider porting the improved parser logic from standalone to monorepo
4. **Error Handling:** Add better error handling for w3gjs parse errors (they might be non-fatal)

## Files to Check

- `packages/infrastructure/src/config/next.config.base.ts` - Base webpack config
- `apps/ittweb/config/next.config.ts` - App webpack config
- `apps/ittweb/src/features/modules/game-management/lib/mechanics/replay/parser.ts` - Parser implementation
- Compare with standalone: `C:\Users\user\source\repos\ittweb\src\features\modules\game-management\lib\mechanics\replay\parser.ts`
