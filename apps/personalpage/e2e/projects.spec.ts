import { test, expect } from "@playwright/test";
import { waitForPageLoad, waitForNavigation } from "./utils/test-helpers";

test.describe("Project Pages", () => {
  test("should load music page", async ({ page }) => {
    await page.goto("/projects/music", { waitUntil: "domcontentloaded" });
    await waitForPageLoad(page);

    // Check that page loaded successfully
    await expect(page).toHaveURL(/.*\/projects\/music/);

    // Check for main content
    const mainContent = page.locator("main, [role='main']").first();
    await expect(mainContent).toBeVisible();
  });

  test("should load aboutme page", async ({ page }) => {
    await page.goto("/projects/aboutme", { waitUntil: "domcontentloaded" });
    await waitForPageLoad(page);

    // Check that page loaded successfully
    await expect(page).toHaveURL(/.*\/projects\/aboutme/);

    // Check for main content
    const mainContent = page.locator("main, [role='main']").first();
    await expect(mainContent).toBeVisible();
  });

  test("should load connecting-vessels page", async ({ page }) => {
    await page.goto("/projects/connecting-vessels", { waitUntil: "domcontentloaded" });
    await waitForPageLoad(page);

    // Check that page loaded successfully
    await expect(page).toHaveURL(/.*\/projects\/connecting-vessels/);

    // Check for main content
    const mainContent = page.locator("main, [role='main']").first();
    await expect(mainContent).toBeVisible();
  });

  test("should load emw page", async ({ page }) => {
    await page.goto("/projects/emw", { waitUntil: "domcontentloaded" });
    await waitForPageLoad(page);

    // Check that page loaded successfully
    await expect(page).toHaveURL(/.*\/projects\/emw/);

    // Check for main content
    const mainContent = page.locator("main, [role='main']").first();
    await expect(mainContent).toBeVisible();
  });

  test.describe("EdTech Pages", () => {
    const edtechPages = [
      { path: "/projects/edtech/mathObjectGenerator", name: "Math Object Generator" },
      { path: "/projects/edtech/exercisesGenerator", name: "Exercises Generator" },
      { path: "/projects/edtech/examGenerator", name: "Exam Generator" },
      { path: "/projects/edtech/lessonScheduler", name: "Lesson Scheduler" },
      { path: "/projects/edtech/unitPlanGenerator", name: "Unit Plan Generator" },
      { path: "/projects/edtech/progressReport", name: "Progress Report" },
      { path: "/projects/edtech/mathObjectsGeneratorTests", name: "Math Objects Generator Tests" },
    ];

    for (const { path, name } of edtechPages) {
      test(`should load ${name} page`, async ({ page }) => {
        await page.goto(path, { waitUntil: "domcontentloaded" });
        await waitForPageLoad(page);

        // Check that page loaded successfully
        await expect(page).toHaveURL(new RegExp(path.replace(/\//g, "\\/")));

        // Check for main content
        const mainContent = page.locator("main, [role='main']").first();
        await expect(mainContent).toBeVisible();
      });
    }
  });
});
