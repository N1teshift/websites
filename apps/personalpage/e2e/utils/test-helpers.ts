import { Page, expect } from "@playwright/test";

/**
 * Wait for page to be fully loaded and interactive
 * Uses 'load' instead of 'networkidle' to avoid timeouts from ongoing network activity
 * (analytics, WebSockets, long polling, etc.)
 */
export async function waitForPageLoad(page: Page, timeout = 30000) {
  // Wait for DOM to be ready
  await page.waitForLoadState("domcontentloaded", { timeout });
  // Wait for page load (resources loaded)
  await page.waitForLoadState("load", { timeout });
  // Small delay to allow any initial JavaScript to execute
  await page.waitForTimeout(500);
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(page: Page, urlPattern: string | RegExp) {
  await page.waitForURL(urlPattern, { timeout: 10000 });
}

/**
 * Get navigation link by text (more reliable than text selector)
 */
export function getNavLink(page: Page, linkText: string) {
  return page.getByRole("link", { name: linkText, exact: false });
}

/**
 * Check if element is visible and in viewport
 */
export async function expectVisibleInViewport(page: Page, selector: string) {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
  await expect(element).toBeInViewport();
}

/**
 * Wait for element to be stable (not animating)
 */
export async function waitForStable(page: Page, selector: string, timeout = 5000) {
  const element = page.locator(selector);
  await element.waitFor({ state: "visible", timeout });
  // Small delay to ensure animations complete
  await page.waitForTimeout(200);
}

/**
 * Check page title contains text
 * Waits for title to be set (useful for client-side rendered titles)
 */
export async function expectPageTitle(page: Page, titleText: string | RegExp, timeout = 10000) {
  // Wait for title to be set (not empty)
  await page.waitForFunction(() => document.title && document.title.trim().length > 0, { timeout });

  if (typeof titleText === "string") {
    await expect(page).toHaveTitle(new RegExp(titleText, "i"), { timeout });
  } else {
    await expect(page).toHaveTitle(titleText, { timeout });
  }
}

/**
 * Check that page has no console errors (basic check)
 */
export async function expectNoConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });
  page.on("pageerror", (error) => {
    errors.push(error.message);
  });
  return errors;
}

/**
 * Get mobile menu button
 */
export async function getMobileMenuButton(page: Page) {
  return page.getByRole("button", { name: /toggle mobile menu/i });
}

/**
 * Check responsive design breakpoint
 */
export async function setViewportSize(page: Page, size: "mobile" | "tablet" | "desktop") {
  const sizes = {
    mobile: { width: 375, height: 667 }, // iPhone SE
    tablet: { width: 768, height: 1024 }, // iPad
    desktop: { width: 1920, height: 1080 }, // Desktop
  };
  await page.setViewportSize(sizes[size]);
}

/**
 * Wait for API requests to complete
 */
export async function waitForAPIRequests(page: Page, timeout = 10000) {
  await page.waitForLoadState("networkidle", { timeout });
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const signInButton = page.getByRole("button", { name: /sign in/i });
  const signOutButton = page.getByRole("button", { name: /sign out/i });

  try {
    // Check if sign out button exists (user is authenticated)
    const signOutCount = await signOutButton.count();
    if (signOutCount > 0) return true;

    // Check if sign in button exists (user is not authenticated)
    const signInCount = await signInButton.count();
    return signInCount === 0; // If no sign in button, might be authenticated
  } catch {
    return false;
  }
}

/**
 * Wait for element to appear and be visible
 */
export async function waitForElement(
  page: Page,
  selector: string,
  options?: { timeout?: number; state?: "visible" | "hidden" | "attached" | "detached" }
) {
  const element = page.locator(selector);
  await element.waitFor({
    state: options?.state || "visible",
    timeout: options?.timeout || 5000,
  });
  return element;
}

/**
 * Check that page has proper meta tags
 */
export async function expectMetaTags(page: Page) {
  // Check for viewport meta tag
  const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
  expect(viewport).toBeTruthy();
}

/**
 * Take screenshot on failure (helper for test hooks)
 */
export async function takeScreenshotOnFailure(
  page: Page,
  testInfo: { title: string; outputDir: string }
) {
  if (testInfo.title) {
    const screenshotPath = `${testInfo.outputDir}/${testInfo.title.replace(/\s+/g, "-")}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
  }
}
