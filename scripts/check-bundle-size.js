#!/usr/bin/env node
/**
 * Bundle Size Tracking Script
 *
 * This script analyzes bundle sizes for all apps in the monorepo and compares
 * them against size budgets. It can be used in CI to fail builds if bundle sizes
 * exceed thresholds.
 *
 * Usage:
 *   node scripts/check-bundle-size.js [--baseline <file>] [--budget <file>] [--fail-on-exceed]
 *
 * Options:
 *   --baseline <file>  Path to baseline bundle sizes JSON file (default: bundle-sizes-baseline.json)
 *   --budget <file>    Path to bundle size budgets JSON file (default: bundle-size-budgets.json)
 *   --fail-on-exceed   Exit with error code if any bundle exceeds budget
 *   --json             Output results as JSON
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");

const DEFAULT_BASELINE_FILE = join(ROOT_DIR, "bundle-sizes-baseline.json");
const DEFAULT_BUDGET_FILE = join(ROOT_DIR, "bundle-size-budgets.json");

// Parse command line arguments
const args = process.argv.slice(2);
const baselineFile = args.includes("--baseline")
  ? args[args.indexOf("--baseline") + 1]
  : DEFAULT_BASELINE_FILE;
const budgetFile = args.includes("--budget")
  ? args[args.indexOf("--budget") + 1]
  : DEFAULT_BUDGET_FILE;
const failOnExceed = args.includes("--fail-on-exceed");
const jsonOutput = args.includes("--json");

/**
 * Get bundle sizes from .next directory
 */
function getBundleSizes(appName) {
  const appDir = join(ROOT_DIR, "apps", appName);
  const nextDir = join(appDir, ".next");

  if (!existsSync(nextDir)) {
    console.warn(
      `⚠️  No .next directory found for ${appName}. Run build first.`,
    );
    return null;
  }

  const staticDir = join(nextDir, "static");
  if (!existsSync(staticDir)) {
    return null;
  }

  // Get sizes of main chunks
  const chunks = {
    "main.js": join(staticDir, "chunks", "main-*.js"),
    "framework.js": join(staticDir, "chunks", "framework-*.js"),
    "pages/_app.js": join(staticDir, "chunks", "pages", "_app-*.js"),
    "pages/_document.js": join(staticDir, "chunks", "pages", "_document-*.js"),
  };

  const sizes = {};

  // Use PowerShell on Windows, find on Unix
  const isWindows = process.platform === "win32";

  for (const [name, pattern] of Object.entries(chunks)) {
    try {
      let command;
      if (isWindows) {
        // PowerShell command to find and sum file sizes
        command = `powershell -Command "Get-ChildItem -Path '${pattern.replace(/\\/g, "/")}' -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum | Select-Object -ExpandProperty Sum"`;
      } else {
        command = `find ${pattern} -type f -exec du -b {} + 2>/dev/null | awk '{sum+=$1} END {print sum}'`;
      }

      const result = execSync(command, {
        encoding: "utf-8",
        cwd: appDir,
        stdio: "pipe",
      }).trim();
      const size = parseInt(result, 10);
      if (!isNaN(size)) {
        sizes[name] = size;
      }
    } catch (error) {
      // File not found, skip
    }
  }

  // Calculate total static size
  try {
    let command;
    if (isWindows) {
      command = `powershell -Command "(Get-ChildItem -Path '${staticDir.replace(/\\/g, "/")}' -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum"`;
    } else {
      command = `du -sb ${staticDir} 2>/dev/null | cut -f1`;
    }
    const totalSize = parseInt(
      execSync(command, {
        encoding: "utf-8",
        cwd: appDir,
        stdio: "pipe",
      }).trim(),
      10,
    );
    if (!isNaN(totalSize)) {
      sizes["_total"] = totalSize;
    }
  } catch (error) {
    // Ignore
  }

  return Object.keys(sizes).length > 0 ? sizes : null;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Load baseline sizes
 */
function loadBaseline() {
  if (existsSync(baselineFile)) {
    try {
      return JSON.parse(readFileSync(baselineFile, "utf-8"));
    } catch (error) {
      console.warn(`⚠️  Could not load baseline file: ${error.message}`);
    }
  }
  return {};
}

/**
 * Load budgets
 */
function loadBudgets() {
  if (existsSync(budgetFile)) {
    try {
      return JSON.parse(readFileSync(budgetFile, "utf-8"));
    } catch (error) {
      console.warn(`⚠️  Could not load budget file: ${error.message}`);
    }
  }
  return {};
}

/**
 * Main function
 */
function main() {
  const apps = ["ittweb", "personalpage", "MafaldaGarcia", "templatepage"];
  const currentSizes = {};
  const baseline = loadBaseline();
  const budgets = loadBudgets();
  const results = {
    timestamp: new Date().toISOString(),
    apps: {},
    exceeded: [],
    summary: {
      totalApps: 0,
      analyzed: 0,
      withinBudget: 0,
      exceededBudget: 0,
    },
  };

  for (const app of apps) {
    const appDir = join(ROOT_DIR, "apps", app);
    if (!existsSync(join(appDir, "package.json"))) {
      continue;
    }

    results.summary.totalApps++;
    const sizes = getBundleSizes(app);

    if (!sizes) {
      continue;
    }

    results.summary.analyzed++;
    currentSizes[app] = sizes;

    const appResults = {
      sizes: {},
      comparisons: {},
      budgetChecks: {},
    };

    // Calculate sizes and compare with baseline
    for (const [chunk, size] of Object.entries(sizes)) {
      appResults.sizes[chunk] = {
        bytes: size,
        formatted: formatBytes(size),
      };

      // Compare with baseline
      if (baseline[app] && baseline[app][chunk]) {
        const baselineSize = baseline[app][chunk];
        const diff = size - baselineSize;
        const diffPercent = ((diff / baselineSize) * 100).toFixed(2);

        appResults.comparisons[chunk] = {
          diff: diff,
          diffFormatted: `${diff >= 0 ? "+" : ""}${formatBytes(diff)}`,
          diffPercent: `${diff >= 0 ? "+" : ""}${diffPercent}%`,
        };
      }

      // Check against budget
      if (budgets[app] && budgets[app][chunk]) {
        const budget = budgets[app][chunk];
        const exceeds = size > budget;

        appResults.budgetChecks[chunk] = {
          budget: budget,
          budgetFormatted: formatBytes(budget),
          exceeds: exceeds,
        };

        if (exceeds) {
          results.exceeded.push({
            app,
            chunk,
            size,
            budget,
            overage: size - budget,
          });
          results.summary.exceededBudget++;
        } else {
          results.summary.withinBudget++;
        }
      }
    }

    results.apps[app] = appResults;
  }

  // Output results
  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log("\n📦 Bundle Size Analysis\n");
    console.log("=".repeat(60));

    for (const [app, appResults] of Object.entries(results.apps)) {
      console.log(`\n${app}:`);
      console.log("-".repeat(60));

      for (const [chunk, data] of Object.entries(appResults.sizes)) {
        if (chunk === "_total") continue;

        let line = `  ${chunk.padEnd(25)} ${data.formatted.padStart(10)}`;

        if (appResults.comparisons[chunk]) {
          const comp = appResults.comparisons[chunk];
          line += ` (${comp.diffFormatted}, ${comp.diffPercent})`;
        }

        if (appResults.budgetChecks[chunk]) {
          const check = appResults.budgetChecks[chunk];
          const status = check.exceeds ? "❌ EXCEEDED" : "✅ OK";
          line += ` | Budget: ${check.budgetFormatted} ${status}`;
        }

        console.log(line);
      }

      if (appResults.sizes._total) {
        console.log(
          `  ${"TOTAL".padEnd(25)} ${appResults.sizes._total.formatted.padStart(10)}`,
        );
      }
    }

    if (results.exceeded.length > 0) {
      console.log("\n⚠️  Budget Exceeded:");
      for (const item of results.exceeded) {
        console.log(
          `  ${item.app}/${item.chunk}: ${formatBytes(item.size)} (budget: ${formatBytes(item.budget)}, over by ${formatBytes(item.overage)})`,
        );
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log(
      `\nSummary: ${results.summary.analyzed}/${results.summary.totalApps} apps analyzed`,
    );
    console.log(`  ✅ Within budget: ${results.summary.withinBudget}`);
    console.log(`  ❌ Exceeded budget: ${results.summary.exceededBudget}`);
  }

  // Save current sizes as new baseline
  writeFileSync(DEFAULT_BASELINE_FILE, JSON.stringify(currentSizes, null, 2));
  if (!jsonOutput) {
    console.log(`\n💾 Baseline saved to ${DEFAULT_BASELINE_FILE}`);
  }

  // Exit with error if budgets exceeded
  if (failOnExceed && results.exceeded.length > 0) {
    process.exit(1);
  }
}

main();
