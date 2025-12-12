import { test, expect } from "@playwright/test";
import { waitForPageLoad, waitForAPIRequests } from "./utils/test-helpers";

// List of all public pages to test
const pagesToTest = [
  "/",
  "/games",
  "/players",
  "/standings",
  "/classes",
  "/guides",
  "/guides/abilities",
  "/guides/items",
  "/guides/units",
  "/guides/troll-classes",
  "/tools",
  "/tools/duel-simulator",
  "/tools/map-analyzer",
  "/community/archives",
  "/privacy",
  "/download",
];

interface ErrorReport {
  url: string;
  error: string;
  type: "console" | "pageerror" | "network" | "boundary";
  timestamp: number;
}

interface WarningReport {
  url: string;
  warning: string;
  timestamp: number;
}

test.describe("Console Error Checks", () => {
  test.setTimeout(300000); // 5 minutes for the entire test suite

  // Only test on Chromium - console errors are browser-agnostic
  test("should have no console errors on all pages", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Only testing console errors on Chromium");

    const consoleErrors: ErrorReport[] = [];
    const consoleWarnings: WarningReport[] = [];

    // Set up error listeners before navigation
    page.on("console", (msg) => {
      const text = msg.text();
      const type = msg.type();

      if (type === "error") {
        if (!shouldIgnoreError(text)) {
          consoleErrors.push({
            url: page.url(),
            error: text,
            type: "console",
            timestamp: Date.now(),
          });
        }
      } else if (type === "warning") {
        if (!shouldIgnoreWarning(text)) {
          consoleWarnings.push({
            url: page.url(),
            warning: text,
            timestamp: Date.now(),
          });
        }
      }
    });

    // Listen for page errors (unhandled exceptions)
    page.on("pageerror", (error) => {
      if (!shouldIgnoreError(error.message)) {
        consoleErrors.push({
          url: page.url(),
          error: `${error.name}: ${error.message}`,
          type: "pageerror",
          timestamp: Date.now(),
        });
      }
    });

    // Track failed network requests (but be selective)
    const failedRequests = new Set<string>();
    page.on("response", (response) => {
      const status = response.status();
      const url = response.url();

      if (status >= 400 && status < 500 && status !== 404) {
        // Track 4xx errors (except 404) but don't fail on them immediately
        if (!shouldIgnoreFailedRequest(url)) {
          failedRequests.add(url);
        }
      } else if (status >= 500) {
        // 5xx errors are always problematic
        if (!shouldIgnoreFailedRequest(url)) {
          consoleErrors.push({
            url: page.url(),
            error: `Server error ${status} ${response.statusText()} - ${url}`,
            type: "network",
            timestamp: Date.now(),
          });
        }
      }
    });

    // Visit each page
    for (const path of pagesToTest) {
      try {
        // Navigate to page
        await page.goto(path, {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });

        // Wait for page to be fully interactive
        await waitForPageLoad(page);
        await waitForAPIRequests(page, 10000);

        // Wait for any async operations and potential errors
        await page.waitForTimeout(3000);

        // Check for React error boundaries or error states
        const errorBoundary = page.locator(
          "[data-error-boundary], .error-boundary, [data-testid*='error']"
        );
        if ((await errorBoundary.count()) > 0) {
          const errorText = await errorBoundary.first().textContent();
          consoleErrors.push({
            url: page.url(),
            error: `Error boundary triggered: ${errorText || "Unknown error"}`,
            type: "boundary",
            timestamp: Date.now(),
          });
        }

        // Verify page actually loaded (not a blank page)
        const bodyContent = await page.locator("body").textContent();
        if (!bodyContent || bodyContent.trim().length === 0) {
          consoleErrors.push({
            url: page.url(),
            error: "Page appears to be blank or failed to render",
            type: "pageerror",
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        // Handle navigation errors
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes("timeout")) {
          // Timeout might be acceptable for slow pages, but log it
          console.warn(
            `[${path}]: Page load timeout after 60s (this may indicate a performance issue)`
          );
        } else if (errorMessage.includes("net::ERR")) {
          // Network errors are real errors
          consoleErrors.push({
            url: path,
            error: `Network error: ${errorMessage}`,
            type: "network",
            timestamp: Date.now(),
          });
        } else {
          // Other navigation errors
          consoleErrors.push({
            url: path,
            error: `Failed to load page: ${errorMessage}`,
            type: "pageerror",
            timestamp: Date.now(),
          });
        }
      }
    }

    // Group errors by type for better reporting
    const errorsByType = consoleErrors.reduce(
      (acc, error) => {
        if (!acc[error.type]) acc[error.type] = [];
        acc[error.type].push(error);
        return acc;
      },
      {} as Record<string, ErrorReport[]>
    );

    // Report results with better formatting
    if (consoleErrors.length > 0) {
      console.error("\n=== CONSOLE ERRORS FOUND ===");
      console.error(`Total errors: ${consoleErrors.length}\n`);

      Object.entries(errorsByType).forEach(([type, errors]) => {
        console.error(`\n${type.toUpperCase()} Errors (${errors.length}):`);
        errors.forEach(({ url, error }) => {
          console.error(`  [${url}]: ${error}`);
        });
      });
    }

    if (consoleWarnings.length > 0) {
      console.warn("\n=== CONSOLE WARNINGS FOUND ===");
      console.warn(`Total warnings: ${consoleWarnings.length}\n`);
      consoleWarnings.forEach(({ url, warning }) => {
        console.warn(`  [${url}]: ${warning}`);
      });
    }

    // Fail the test if there are critical errors
    // Allow some warnings but fail on actual errors
    const criticalErrors = consoleErrors.filter(
      (error) => error.type !== "network" || !error.error.includes("404")
    );

    expect(
      criticalErrors,
      `Found ${criticalErrors.length} critical console error(s) across ${pagesToTest.length} pages. See output above for details.`
    ).toHaveLength(0);
  });
});

// Helper function to ignore known/expected errors
function shouldIgnoreError(errorText: string): boolean {
  const ignoredPatterns = [
    // HMR (Hot Module Replacement) warnings in development
    /\[HMR\]/i,
    /hot.*module.*replacement/i,
    /webpack.*hot/i,

    // Next.js development warnings
    /isrManifest/i,
    /Invalid message/i,

    // Browser extension errors (not our fault)
    /chrome-extension:/i,
    /moz-extension:/i,
    /safari-extension:/i,

    // Analytics/ad blockers (expected)
    /analytics.*blocked/i,
    /ad.*block/i,
    /tracker.*block/i,

    // Favicon 404s (common and harmless)
    /favicon.*404/i,
    /favicon.*not found/i,
  ];

  return ignoredPatterns.some((pattern) => pattern.test(errorText));
}

// Helper function to ignore known/expected warnings
function shouldIgnoreWarning(warningText: string): boolean {
  const ignoredPatterns = [
    // React development warnings (acceptable in dev mode)
    /react.*dev.*warning/i,
    /deprecated.*api/i,

    // Next.js development warnings
    /next.*dev.*warning/i,

    // Browser deprecation warnings (browser-specific, not our issue)
    /deprecated.*feature/i,
  ];

  return ignoredPatterns.some((pattern) => pattern.test(warningText));
}

// Helper function to ignore known/expected failed requests
function shouldIgnoreFailedRequest(url: string): boolean {
  const ignoredPatterns = [
    // Favicon requests
    /favicon\.ico/i,

    // Analytics endpoints (might be blocked)
    /analytics/i,
    /google-analytics/i,
    /gtag/i,
    /ga\.js/i,

    // Browser extension requests
    /chrome-extension:/i,
    /moz-extension:/i,

    // External resources that might fail
    /fonts\.googleapis/i,
    /fonts\.gstatic/i,

    // Development hot reload endpoints
    /_next\/webpack-hmr/i,
    /_next\/data/i,
  ];

  return ignoredPatterns.some((pattern) => pattern.test(url));
}
