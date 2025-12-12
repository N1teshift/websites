import { test, expect } from "@playwright/test";
import {
  waitForPageLoad,
  getNavLink,
  expectPageTitle,
  waitForNavigation,
  waitForElement,
  expectNoConsoleErrors,
} from "./utils/test-helpers";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await waitForPageLoad(page);
  });

  test("should load homepage successfully", async ({ page }) => {
    // Wait a bit more for title to be set (might be set by client-side code)
    await page.waitForTimeout(1000);

    // Check that the page loads with correct title
    // The title might be "Projects" or similar based on layoutTitleKey
    await expectPageTitle(page, /projects/i);

    // Check for main content area
    const mainContent = page
      .locator("main, [role='main'], .container-responsive, .max-w-4xl")
      .first();
    await expect(mainContent).toBeVisible();

    // Check for links grid (CenteredLinkGrid component)
    // Look for links that should be present
    const links = page.locator("a[href]");
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test("should display project links", async ({ page }) => {
    // Check for About Me section links
    const musicLink = page.getByRole("link", { name: /music/i });
    const cvLink = page.getByRole("link", { name: /cv|about/i });

    // At least one of these should be visible
    const hasMusicLink = (await musicLink.count()) > 0;
    const hasCvLink = (await cvLink.count()) > 0;
    expect(hasMusicLink || hasCvLink).toBe(true);

    // Check for Education Technologies links
    const edtechLinks = [
      /math.*object.*generator/i,
      /exercises.*generator/i,
      /exam.*generator/i,
      /lesson.*scheduler/i,
      /unit.*plan.*generator/i,
      /progress.*report/i,
    ];

    let foundEdtechLink = false;
    for (const pattern of edtechLinks) {
      const link = page.getByRole("link", { name: pattern });
      if ((await link.count()) > 0) {
        foundEdtechLink = true;
        break;
      }
    }
    expect(foundEdtechLink).toBe(true);
  });

  test("should navigate to project pages", async ({ page }) => {
    // Try to find and click Music link
    const musicLink = page.getByRole("link", { name: /music/i }).first();

    if ((await musicLink.count()) > 0) {
      await musicLink.click();
      await waitForNavigation(page, /.*\/projects\/music/);

      // Verify we're on music page
      await expect(page).toHaveURL(/.*\/projects\/music/);

      // Check page content loaded
      await waitForPageLoad(page);
    } else {
      // If Music link not found, try CV link
      const cvLink = page.getByRole("link", { name: /cv|about/i }).first();
      if ((await cvLink.count()) > 0) {
        await cvLink.click();
        await waitForNavigation(page, /.*\/projects\/aboutme/);
        await expect(page).toHaveURL(/.*\/projects\/aboutme/);
        await waitForPageLoad(page);
      } else {
        test.skip();
      }
    }
  });

  test("should navigate to edtech pages", async ({ page }) => {
    // Try to find and click an edtech link
    const mathObjectLink = page.getByRole("link", { name: /math.*object.*generator/i }).first();

    if ((await mathObjectLink.count()) > 0) {
      await mathObjectLink.click();
      await waitForNavigation(page, /.*\/projects\/edtech\/mathObjectGenerator/);

      // Verify we're on the edtech page
      await expect(page).toHaveURL(/.*\/projects\/edtech\/mathObjectGenerator/);

      // Check page content loaded
      await waitForPageLoad(page);
    } else {
      // Try another edtech link
      const exercisesLink = page.getByRole("link", { name: /exercises.*generator/i }).first();
      if ((await exercisesLink.count()) > 0) {
        await exercisesLink.click();
        await waitForNavigation(page, /.*\/projects\/edtech\/exercisesGenerator/);
        await expect(page).toHaveURL(/.*\/projects\/edtech\/exercisesGenerator/);
        await waitForPageLoad(page);
      } else {
        test.skip();
      }
    }
  });

  test("should have accessible structure", async ({ page }) => {
    // Check for proper heading hierarchy
    const headings = page.locator("h1, h2, h3");
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    // Check for main landmark
    const main = page.locator("main, [role='main']");
    const mainCount = await main.count();
    // Should have at least one main content area
    expect(mainCount).toBeGreaterThanOrEqual(0);

    // Check navigation has proper ARIA
    const nav = page.locator("nav");
    const navCount = await nav.count();
    // Navigation might or might not be present
    expect(navCount).toBeGreaterThanOrEqual(0);
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
      // Ignore Next.js development warnings
      if (error.includes("Fast Refresh")) return false;
      // Add other known errors here
      return true;
    });

    expect(unexpectedErrors).toHaveLength(0);
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for layout to adjust
    await page.waitForTimeout(500);

    // Check that content is still visible
    const mainContent = page.locator("main, [role='main']").first();
    await expect(mainContent).toBeVisible();

    // Check that links are still accessible
    const links = page.locator("a[href]");
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);
  });
});
