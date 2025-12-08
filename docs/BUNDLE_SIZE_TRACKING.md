# Bundle Size Tracking

This document describes the bundle size tracking and budget system for the monorepo.

## Overview

Bundle size tracking helps prevent performance regressions by monitoring the size of JavaScript bundles across all apps. The system compares current bundle sizes against:

1. **Baseline sizes** - Previously recorded sizes for comparison
2. **Size budgets** - Maximum allowed sizes per app and chunk

## Configuration

### Budget File

Bundle size budgets are defined in `bundle-size-budgets.json` at the root of the monorepo:

```json
{
  "ittweb": {
    "main.js": 500000,
    "framework.js": 200000,
    "pages/_app.js": 300000,
    "_total": 5000000
  }
}
```

Sizes are specified in **bytes**. Update budgets as needed based on:

- App requirements
- Performance targets
- Historical sizes

### Baseline File

The baseline file (`bundle-sizes-baseline.json`) is automatically generated after each analysis. It stores the current bundle sizes for comparison in future runs.

## Usage

### Check Bundle Sizes

```bash
# Check current bundle sizes (non-blocking)
pnpm check:bundle-size

# Check and fail if budgets are exceeded
pnpm check:bundle-size:fail

# Output as JSON
pnpm check:bundle-size --json
```

### Update Budgets

Edit `bundle-size-budgets.json` to adjust size limits:

```json
{
  "personalpage": {
    "main.js": 800000, // Increase from 600000
    "_total": 8000000 // Increase from 6000000
  }
}
```

### Update Baseline

The baseline is automatically updated after each run. To manually reset it:

```bash
# Delete the baseline file to start fresh
rm bundle-sizes-baseline.json

# Run analysis to create new baseline
pnpm check:bundle-size
```

## CI Integration

Bundle size checking is integrated into the CI pipeline:

1. **After builds complete** - Bundle sizes are analyzed
2. **On pull requests** - Results are posted to the PR summary
3. **Budget enforcement** - Warnings are shown if budgets are exceeded (currently non-blocking)

### Making Budget Checks Blocking

To make budget failures block CI, update `.github/workflows/ci.yml`:

```yaml
- name: Check bundle size budgets
  run: pnpm check:bundle-size:fail # Remove the "|| echo" part
```

## Understanding Results

### Size Comparison

The tool shows:

- **Current size** - Size of each chunk in bytes and human-readable format
- **Difference from baseline** - How much the size changed (e.g., `+50KB, +5.2%`)
- **Budget status** - Whether the chunk is within or exceeds its budget

### Example Output

```
📦 Bundle Size Analysis
============================================================

ittweb:
------------------------------------------------------------
  main.js                   500.00 KB (+25.00 KB, +5.26%) | Budget: 500.00 KB ✅ OK
  framework.js              200.00 KB (+0.00 KB, +0.00%) | Budget: 200.00 KB ✅ OK
  pages/_app.js             300.00 KB (+10.00 KB, +3.45%) | Budget: 300.00 KB ✅ OK
  TOTAL                     5.00 MB
```

### Budget Exceeded

If a bundle exceeds its budget:

```
⚠️  Budget Exceeded:
  ittweb/main.js: 550.00 KB (budget: 500.00 KB, over by 50.00 KB)
```

## Best Practices

1. **Set realistic budgets** - Base budgets on current sizes + reasonable growth
2. **Review regularly** - Check bundle sizes periodically, not just on PRs
3. **Investigate increases** - Large size increases may indicate:
   - New dependencies
   - Code splitting issues
   - Unused code being bundled
4. **Update budgets when needed** - If a legitimate feature requires more code, update the budget
5. **Use bundle analyzer** - For detailed analysis, use `pnpm --filter <app> analyze`

## Troubleshooting

### "No .next directory found"

**Problem**: Bundle size check fails because `.next` directory doesn't exist.

**Solution**: Build the app first:

```bash
pnpm --filter <app-name> build
pnpm check:bundle-size
```

### Budgets Too Strict

**Problem**: Legitimate changes cause budget failures.

**Solution**: Update budgets in `bundle-size-budgets.json` to reflect new requirements.

### Inconsistent Results

**Problem**: Bundle sizes vary between runs.

**Possible causes**:

- Non-deterministic builds
- Different Node.js versions
- Cached builds

**Solution**: Ensure consistent build environment and clear caches:

```bash
pnpm clean
pnpm build
pnpm check:bundle-size
```

## Related Tools

- **Bundle Analyzer**: `pnpm --filter <app> analyze` - Visual bundle analysis
- **Dependency Analysis**: `pnpm analyze:dependencies` - Analyze dependency usage
- **Build Verification**: `pnpm verify:builds` - Verify all apps build successfully

## Future Improvements

Potential enhancements:

- [ ] Track bundle sizes over time (historical data)
- [ ] Integrate with services like Bundlephobia
- [ ] Automatic PR comments with size changes
- [ ] Size regression detection
- [ ] Per-route bundle size tracking
