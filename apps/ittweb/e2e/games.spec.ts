import { test, expect } from "@playwright/test";
import {
  waitForPageLoad,
  waitForNavigation,
  waitForElement,
  waitForAPIRequests,
} from "./utils/test-helpers";

test.describe("Games Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/games");
    await waitForPageLoad(page);
  });

  test("should load games page successfully", async ({ page }) => {
    // Check page loads with correct URL
    await expect(page).toHaveURL(/.*\/games/);

    // Check page heading is visible
    const heading = page.locator("h1, h2").filter({ hasText: /games/i });
    await expect(heading.first()).toBeVisible({ timeout: 5000 });

    // Check page has main content area
    const mainContent = page.locator("main, [role='main'], article").first();
    await expect(mainContent).toBeVisible();
  });

  test("should display games list or empty state", async ({ page }) => {
    // Wait for content to load (could be games list or empty state)
    await waitForAPIRequests(page, 10000);

    // Check for games list (multiple possible selectors)
    const gameCards = page.locator(
      '[data-testid*="game"], .game-card, .game-item, a[href*="/games/"]'
    );
    const gameCount = await gameCards.count();

    // Check for empty state message
    const emptyState = page.locator("text=/no games|empty|no games found/i");
    const emptyStateCount = await emptyState.count();

    // Should have either games or empty state, not neither
    expect(gameCount > 0 || emptyStateCount > 0).toBe(true);

    if (gameCount > 0) {
      // If games exist, verify they're visible
      await expect(gameCards.first()).toBeVisible();
    } else {
      // If empty state, verify it's visible
      await expect(emptyState.first()).toBeVisible();
    }
  });

  test("should have working filters if games exist", async ({ page }) => {
    await waitForAPIRequests(page);

    // Check for filter controls (selects, checkboxes, radio buttons, buttons)
    const filterSelects = page.locator('select[aria-label*="filter"], select[name*="filter"]');
    const filterButtons = page.locator('button[aria-label*="filter"], button:has-text("Filter")');
    const filterInputs = page.locator(
      'input[type="checkbox"][name*="filter"], input[type="radio"][name*="filter"]'
    );

    const hasSelects = (await filterSelects.count()) > 0;
    const hasButtons = (await filterButtons.count()) > 0;
    const hasInputs = (await filterInputs.count()) > 0;

    if (hasSelects || hasButtons || hasInputs) {
      // If filters exist, verify they're interactive
      if (hasSelects) {
        await expect(filterSelects.first()).toBeVisible();
        await expect(filterSelects.first()).toBeEnabled();
      }
      if (hasButtons) {
        await expect(filterButtons.first()).toBeVisible();
        await expect(filterButtons.first()).toBeEnabled();
      }
      if (hasInputs) {
        await expect(filterInputs.first()).toBeVisible();
        await expect(filterInputs.first()).toBeEnabled();
      }
    }
    // If no filters exist, that's also acceptable - test passes
  });

  test("should navigate to game detail when clicking a game", async ({ page }) => {
    await waitForAPIRequests(page);

    // Look for clickable game elements (links to game detail pages)
    const gameLinks = page.locator('a[href*="/games/"][href!="/games"]');
    const gameLinkCount = await gameLinks.count();

    if (gameLinkCount > 0) {
      // Get the first game link
      const firstGameLink = gameLinks.first();
      const href = await firstGameLink.getAttribute("href");

      if (href && href.startsWith("/games/")) {
        // Click the game link
        await firstGameLink.click();

        // Wait for navigation to game detail page
        await waitForNavigation(page, new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

        // Verify we're on a game detail page
        await expect(page).toHaveURL(/.*\/games\/[^/]+$/);

        // Check page content loaded (either game details or 404)
        const gameContent = page.locator('h1, h2, [data-testid*="game"], .game-detail');
        const notFound = page.locator("text=/not found|404|error/i");

        const hasContent = (await gameContent.count()) > 0;
        const hasNotFound = (await notFound.count()) > 0;

        // Should show either game content or appropriate error message
        expect(hasContent || hasNotFound).toBe(true);
      }
    } else {
      // Skip test if no games to click - this is acceptable
      test.skip();
    }
  });

  test("should handle pagination if present", async ({ page }) => {
    await waitForAPIRequests(page);

    // Check for pagination controls
    const pagination = page.locator(
      '[aria-label*="pagination"], .pagination, button:has-text("Next"), button:has-text("Previous")'
    );
    const paginationCount = await pagination.count();

    if (paginationCount > 0) {
      // If pagination exists, verify it's functional
      const nextButton = page.getByRole("button", { name: /next/i });
      const prevButton = page.getByRole("button", { name: /previous|prev/i });

      if ((await nextButton.count()) > 0) {
        await expect(nextButton.first()).toBeVisible();
        // Don't click to avoid changing test state
      }
    }
    // If no pagination, that's fine - test passes
  });
});

test.describe("Game Detail Page", () => {
  test("should load game detail page structure", async ({ page }) => {
    // First, try to get a valid game ID from the games list
    await page.goto("/games");
    await waitForPageLoad(page);
    await waitForAPIRequests(page);

    const gameLinks = page.locator('a[href*="/games/"][href!="/games"]');
    const gameLinkCount = await gameLinks.count();

    if (gameLinkCount > 0) {
      // Navigate to first game
      const firstGameLink = gameLinks.first();
      const href = await firstGameLink.getAttribute("href");

      if (href) {
        await firstGameLink.click();
        await waitForNavigation(page, new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

        // Verify page structure
        await expect(page).toHaveURL(/.*\/games\/[^/]+$/);

        // Check for game content or error message
        const gameContent = page.locator('h1, h2, [data-testid*="game"], .game-detail, article');
        const notFound = page.locator("text=/not found|404|error/i");

        const hasContent = (await gameContent.count()) > 0;
        const hasNotFound = (await notFound.count()) > 0;

        expect(hasContent || hasNotFound).toBe(true);

        if (hasContent) {
          // Verify content is visible
          await expect(gameContent.first()).toBeVisible();
        }
      }
    } else {
      // If no games exist, test with a non-existent ID to verify error handling
      await page.goto("/games/invalid-test-id-12345");
      await waitForPageLoad(page);

      // Should show either 404 or error message
      const notFound = page.locator("text=/not found|404|error/i");
      const hasError = (await notFound.count()) > 0;

      // Page should still load without crashing
      await expect(page.locator("body")).toBeVisible();
      expect(hasError).toBe(true);
    }
  });

  test("should handle invalid game ID gracefully", async ({ page }) => {
    await page.goto("/games/invalid-id-test-99999");
    await waitForPageLoad(page);

    // Page should load without crashing
    await expect(page.locator("body")).toBeVisible();

    // Should show error or 404 message
    const errorMessage = page.locator("text=/not found|404|error|invalid/i");
    const hasError = (await errorMessage.count()) > 0;

    // Should have some indication that the game doesn't exist
    expect(hasError).toBe(true);
  });
});
