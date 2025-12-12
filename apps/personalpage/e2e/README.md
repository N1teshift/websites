# E2E Tests for Personalpage

This directory contains end-to-end tests for the personalpage website using Playwright.

## Test Structure

- `homepage.spec.ts` - Tests for the homepage/landing page
- `projects.spec.ts` - Tests for project pages (music, aboutme, edtech, etc.)
- `console-errors.spec.ts` - Tests to ensure pages load without console errors
- `utils/test-helpers.ts` - Shared test utilities and helper functions

## Running Tests

### Run all tests

```bash
pnpm test:e2e
```

### Run tests in UI mode (interactive)

```bash
pnpm test:e2e:ui
```

### Run tests in headed mode (see browser)

```bash
pnpm test:e2e:headed
```

### Run tests in debug mode

```bash
pnpm test:e2e:debug
```

### Run specific test file

```bash
npx playwright test e2e/homepage.spec.ts
```

### Run tests for specific browser

```bash
npx playwright test --project=chromium
```

## Test Configuration

Tests are configured in `playwright.config.ts` at the root of the app. The configuration includes:

- Multiple browser projects (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari)
- Automatic dev server startup
- Screenshot and video capture on failure
- Trace collection on retry

## Writing New Tests

When writing new tests:

1. Use the helper functions from `utils/test-helpers.ts` for common operations
2. Follow the existing test patterns
3. Use semantic selectors (roles, text) when possible
4. Add appropriate waits for page loads
5. Filter out known/expected console errors

## Example Test

```typescript
import { test, expect } from "@playwright/test";
import { waitForPageLoad } from "./utils/test-helpers";

test("should load page successfully", async ({ page }) => {
  await page.goto("/your-page", { waitUntil: "domcontentloaded" });
  await waitForPageLoad(page);

  await expect(page).toHaveURL(/.*\/your-page/);

  const mainContent = page.locator("main, [role='main']").first();
  await expect(mainContent).toBeVisible();
});
```

## CI/CD

Tests are configured to:

- Retry failed tests 2 times on CI
- Run with 1 worker on CI (sequential)
- Generate HTML reports
- Capture screenshots and videos on failure
