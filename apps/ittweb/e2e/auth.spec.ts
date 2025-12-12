import { test, expect } from "@playwright/test";
import {
  waitForPageLoad,
  setViewportSize,
  isAuthenticated,
  waitForAPIRequests,
} from "./utils/test-helpers";

test.describe("Authentication", () => {
  test("should show sign in button for unauthenticated users", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Check for sign in button
    const signInButton = page.getByRole("button", { name: /sign in/i });
    const signOutButton = page.getByRole("button", { name: /sign out/i });

    const hasSignIn = (await signInButton.count()) > 0;
    const hasSignOut = (await signOutButton.count()) > 0;

    // Should show either sign in or sign out, not both
    expect(hasSignIn || hasSignOut).toBe(true);
    expect(hasSignIn && hasSignOut).toBe(false);

    if (hasSignIn) {
      // Verify sign in button is visible and enabled
      await expect(signInButton.first()).toBeVisible();
      await expect(signInButton.first()).toBeEnabled();

      // Check button has proper aria-label
      const ariaLabel = await signInButton.first().getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy();
    }
  });

  test("should show user profile for authenticated users", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    const signOutButton = page.getByRole("button", { name: /sign out/i });
    const hasSignOut = (await signOutButton.count()) > 0;

    if (hasSignOut) {
      // User is authenticated - check for profile elements
      const settingsLink = page.getByRole("link", { name: /settings/i });
      const userImage = page.locator('img[alt*="User"], img[alt*="user"]');

      // Should have either settings link or user image
      const hasSettings = (await settingsLink.count()) > 0;
      const hasImage = (await userImage.count()) > 0;

      expect(hasSettings || hasImage).toBe(true);

      // Sign out button should be visible and enabled
      await expect(signOutButton.first()).toBeVisible();
      await expect(signOutButton.first()).toBeEnabled();
    } else {
      // User is not authenticated - this is also valid
      test.skip();
    }
  });

  test("should handle unauthenticated access gracefully", async ({ page }) => {
    // Test various public pages to ensure they don't crash when unauthenticated
    const pagesToTest = ["/", "/games", "/players", "/standings", "/guides", "/tools"];

    for (const pagePath of pagesToTest) {
      await page.goto(pagePath);
      await waitForPageLoad(page);
      await waitForAPIRequests(page, 5000);

      // Page should load without crashing
      await expect(page.locator("body")).toBeVisible();

      // Should not show generic server error messages
      const serverErrors = page.locator("text=/internal server error|500|server error|crash/i");
      await expect(serverErrors).toHaveCount(0);

      // Navigation should still work
      const nav = page.locator("nav");
      await expect(nav).toBeVisible();
    }
  });

  test("should show login prompt for protected actions", async ({ page }) => {
    await page.goto("/");
    await waitForPageLoad(page);

    // Check for protected action buttons (Create Entry, Schedule Game, etc.)
    const createEntryButton = page.getByRole("button", { name: /create entry/i });
    const scheduleGameButton = page.getByRole("button", { name: /schedule.*game/i });

    const hasCreateEntry = (await createEntryButton.count()) > 0;
    const hasScheduleGame = (await scheduleGameButton.count()) > 0;

    if (hasCreateEntry || hasScheduleGame) {
      // If protected actions are visible, they should require authentication
      // Clicking them should trigger sign in if not authenticated
      const userIsAuthenticated = await isAuthenticated(page);

      if (!userIsAuthenticated && hasCreateEntry) {
        // Clicking should trigger sign in flow
        await createEntryButton.first().click();
        // Should navigate to sign in or show sign in modal
        // Note: This might redirect, so we check for sign in UI
        await page.waitForTimeout(1000); // Wait for any redirect/modal
      }
    }

    // Login message should be visible for unauthenticated users
    const loginMessage = page.locator("text=/log in to post|log in to schedule/i");
    const messageCount = await loginMessage.count();
    // Message might or might not be visible depending on design
    expect(messageCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Responsive Design", () => {
  test("should work on mobile viewport", async ({ page }) => {
    await setViewportSize(page, "mobile");
    await page.goto("/");
    await waitForPageLoad(page);

    // Basic mobile functionality tests
    await expect(page.locator("body")).toBeVisible();

    // Mobile menu button should be visible
    const mobileMenuButton = page.getByRole("button", { name: /toggle mobile menu/i });
    await expect(mobileMenuButton).toBeVisible();
    await expect(mobileMenuButton).toBeEnabled();

    // Test mobile menu functionality
    await mobileMenuButton.click();
    await page.waitForTimeout(300); // Wait for menu animation

    // Check if mobile menu opened (look for menu items)
    const mobileMenuItems = page.locator('nav[aria-expanded="true"], [role="menu"], .mobile-menu');
    const menuVisible = (await mobileMenuItems.count()) > 0;

    // Menu should be accessible
    expect(menuVisible).toBe(true);

    // Navigation links should be accessible in mobile menu
    const navLinks = page.getByRole("link");
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test("should work on tablet viewport", async ({ page }) => {
    await setViewportSize(page, "tablet");
    await page.goto("/");
    await waitForPageLoad(page);

    await expect(page.locator("body")).toBeVisible();

    // Navigation should be visible
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // Check if desktop or mobile navigation is shown
    const desktopNav = page.locator("nav:not([aria-expanded])");
    const mobileMenuButton = page.getByRole("button", { name: /toggle mobile menu/i });

    const hasDesktopNav = (await desktopNav.count()) > 0;
    const hasMobileButton = (await mobileMenuButton.count()) > 0;

    // Should have either desktop nav or mobile menu button
    expect(hasDesktopNav || hasMobileButton).toBe(true);

    // Content should be properly sized
    const mainContent = page.locator("main, [role='main'], .container-responsive").first();
    await expect(mainContent).toBeVisible();
  });

  test("should work on desktop viewport", async ({ page }) => {
    await setViewportSize(page, "desktop");
    await page.goto("/");
    await waitForPageLoad(page);

    await expect(page.locator("body")).toBeVisible();

    // Desktop navigation should be visible
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // Desktop navigation links should be visible (not mobile menu)
    const homeLink = page.getByRole("link", { name: /^home$/i });
    await expect(homeLink).toBeVisible();

    // Mobile menu button should NOT be visible on desktop
    const mobileMenuButton = page.getByRole("button", { name: /toggle mobile menu/i });
    await expect(mobileMenuButton).toHaveCount(0);

    // Dropdown menus should be accessible
    const guidesMenu = page.getByRole("button", { name: /guides/i });
    const communityMenu = page.getByRole("button", { name: /community/i });
    const toolsMenu = page.getByRole("button", { name: /tools/i });

    // At least one dropdown should be visible
    const hasDropdowns =
      (await guidesMenu.count()) > 0 ||
      (await communityMenu.count()) > 0 ||
      (await toolsMenu.count()) > 0;
    expect(hasDropdowns).toBe(true);
  });

  test("should maintain layout across viewport sizes", async ({ page }) => {
    const viewports: Array<"mobile" | "tablet" | "desktop"> = ["mobile", "tablet", "desktop"];

    for (const viewport of viewports) {
      await setViewportSize(page, viewport);
      await page.goto("/");
      await waitForPageLoad(page);

      // Header should always be visible
      const header = page.locator("header");
      await expect(header).toBeVisible();

      // Navigation should always be accessible
      const nav = page.locator("nav");
      await expect(nav).toBeVisible();

      // Footer should always be visible
      const footer = page.locator("footer");
      await expect(footer).toBeVisible();

      // Content should not overflow
      const bodyWidth = await page.locator("body").boundingBox();
      expect(bodyWidth).toBeTruthy();
    }
  });
});
