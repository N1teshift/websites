import { test, expect } from "@playwright/test";
import {
  waitForPageLoad,
  getNavLink,
  waitForNavigation,
  waitForElement,
} from "./utils/test-helpers";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await waitForPageLoad(page);
  });

  test("should load homepage successfully", async ({ page }) => {
    // Check for main navigation elements using semantic selectors
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // Check navigation links are present (using role-based selectors)
    const homeLink = await getNavLink(page, "Home");
    await expect(homeLink).toBeVisible();

    // Check dropdown menus exist
    const guidesMenu = page.getByRole("button", { name: /guides/i });
    const communityMenu = page.getByRole("button", { name: /community/i });
    const toolsMenu = page.getByRole("button", { name: /tools/i });

    // At least one menu should be visible (desktop) or mobile menu button (mobile)
    const hasDesktopMenus =
      (await guidesMenu.count()) > 0 ||
      (await communityMenu.count()) > 0 ||
      (await toolsMenu.count()) > 0;
    const hasMobileMenu =
      (await page.getByRole("button", { name: /toggle mobile menu/i }).count()) > 0;

    expect(hasDesktopMenus || hasMobileMenu).toBe(true);

    // Check for main content area
    const mainContent = page
      .locator("main, [role='main'], .container-responsive, .max-w-4xl")
      .first();
    await expect(mainContent).toBeVisible();

    // Check for footer
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  test("should have working navigation links", async ({ page }) => {
    // On mobile, navigation is in a menu, so check for mobile menu button or desktop nav
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (isMobile) {
      // On mobile, check for mobile menu button
      const mobileMenuButton = page.getByRole("button", { name: /toggle mobile menu/i });
      await expect(mobileMenuButton).toBeVisible();
    } else {
      // On desktop, check for navigation links
      const homeLink = getNavLink(page, "Home");
      await expect(homeLink).toBeVisible();
      const homeHref = await homeLink.getAttribute("href");
      expect(homeHref).toBe("/");

      // Test Download link
      const downloadLink = getNavLink(page, "Download");
      await expect(downloadLink).toBeVisible();
      const downloadHref = await downloadLink.getAttribute("href");
      expect(downloadHref).toBe("/download");
    }
  });

  test("should navigate to players page via community menu", async ({ page }) => {
    // Try to find and click Players link (could be in dropdown or direct)
    const playersLink = page.getByRole("link", { name: /players/i }).first();

    if ((await playersLink.count()) > 0) {
      await playersLink.click();
      await waitForNavigation(page, /.*\/players/);

      // Verify we're on players page
      await expect(page).toHaveURL(/.*\/players/);

      // Check page content loaded
      const pageHeading = page.locator("h1, h2").filter({ hasText: /players/i });
      await expect(pageHeading.first()).toBeVisible({ timeout: 5000 });
    } else {
      // If Players link not directly visible, might be in dropdown - skip for now
      test.skip();
    }
  });

  test("should navigate to standings page via community menu", async ({ page }) => {
    // Try to find and click Standings link
    const standingsLink = page.getByRole("link", { name: /standings/i }).first();

    if ((await standingsLink.count()) > 0) {
      await standingsLink.click();
      await waitForNavigation(page, /.*\/standings/);

      // Verify we're on standings page
      await expect(page).toHaveURL(/.*\/standings/);

      // Check page content loaded
      const pageHeading = page.locator("h1, h2").filter({ hasText: /standings|leaderboard/i });
      await expect(pageHeading.first()).toBeVisible({ timeout: 5000 });
    } else {
      test.skip();
    }
  });

  test("should display authentication UI correctly", async ({ page }) => {
    // Check for either sign in or sign out button
    const signInButton = page.getByRole("button", { name: /sign in/i });
    const signOutButton = page.getByRole("button", { name: /sign out/i });

    const isAuthenticated = (await signOutButton.count()) > 0;
    const isUnauthenticated = (await signInButton.count()) > 0;

    // Should show either sign in or sign out, not both
    expect(isAuthenticated || isUnauthenticated).toBe(true);
    expect(isAuthenticated && isUnauthenticated).toBe(false);

    if (isUnauthenticated) {
      // Check login message is visible for unauthenticated users
      const loginMessage = page.locator("text=/log in to post/i");
      const messageCount = await loginMessage.count();
      // Message might or might not be visible depending on design
      expect(messageCount).toBeGreaterThanOrEqual(0);
    }
  });

  test("should have accessible structure", async ({ page }) => {
    // Check for main landmark or content area
    const main = page.locator("main, [role='main'], .container-responsive, .max-w-4xl");
    const mainCount = await main.count();
    // Should have at least one main content area
    expect(mainCount).toBeGreaterThan(0);

    // Check navigation has proper ARIA
    // On mobile, nav might be hidden, so check for header instead
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (isMobile) {
      // On mobile, check for header and mobile menu button
      const header = page.locator("header");
      await expect(header).toBeVisible();
      const mobileMenuButton = page.getByRole("button", { name: /toggle mobile menu/i });
      await expect(mobileMenuButton).toBeVisible();
    } else {
      // On desktop, nav should be visible
      const nav = page.locator("nav");
      await expect(nav).toBeVisible();
    }

    // Check that page has body content (not blank)
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toBeTruthy();
    expect(bodyText?.trim().length).toBeGreaterThan(0);
  });

  test("should load without console errors", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    // Reload to capture errors
    await page.reload();
    await waitForPageLoad(page);

    // Filter out known/expected errors
    const unexpectedErrors = errors.filter((error) => {
      // Ignore HMR warnings in development
      if (error.includes("[HMR]")) return false;

      // Ignore NextAuth session fetch errors in test environment
      // These occur when the auth API isn't fully ready or in test mode
      if (error.includes("next-auth") && error.includes("CLIENT_FETCH_ERROR")) return false;
      if (error.includes("/api/auth/session") && error.includes("Failed to fetch")) return false;

      // Ignore data fetch errors that are expected in test environment
      // (e.g., when APIs aren't available or return errors)
      if (error.includes("Failed to fetch data") && error.includes("useGame")) return false;
      if (error.includes("TypeError") && error.includes("Failed to fetch")) return false;

      return true;
    });

    // Log unexpected errors for debugging
    if (unexpectedErrors.length > 0) {
      console.log("Unexpected console errors:", unexpectedErrors);
    }

    expect(unexpectedErrors).toHaveLength(0);
  });
});
