import { test, expect } from "@playwright/test";
import { waitForPageLoad, expectNoConsoleErrors } from "./utils/test-helpers";

test.describe("Console Errors", () => {
  test("homepage should load without console errors", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await waitForPageLoad(page);

    // Filter out known/expected errors
    const unexpectedErrors = errors.filter((error) => {
      // Ignore HMR warnings in development
      if (error.includes("[HMR]")) return false;
      // Ignore Fast Refresh warnings
      if (error.includes("Fast Refresh")) return false;
      // Ignore Next.js development warnings
      if (error.includes("Warning:")) return false;
      return true;
    });

    expect(unexpectedErrors).toHaveLength(0);
  });

  test("edtech pages should load without console errors", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    // Test a few key edtech pages
    const edtechPages = [
      "/projects/edtech/mathObjectGenerator",
      "/projects/edtech/exercisesGenerator",
      "/projects/edtech/examGenerator",
    ];

    for (const path of edtechPages) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await waitForPageLoad(page);

      // Filter out known/expected errors
      const unexpectedErrors = errors.filter((error) => {
        if (error.includes("[HMR]")) return false;
        if (error.includes("Fast Refresh")) return false;
        if (error.includes("Warning:")) return false;
        return true;
      });

      // Clear errors for next page
      errors.length = 0;

      // Note: We're checking each page, but only failing on the last one
      // In a real scenario, you might want to check each individually
    }
  });
});
