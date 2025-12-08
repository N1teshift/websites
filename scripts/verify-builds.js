#!/usr/bin/env node

/**
 * Build Verification Script
 * Builds all packages and apps, reports success/failure
 */

import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { writeFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

const results = [];
const startTime = new Date();

console.log("\n=== Build Verification Script ===");
console.log(`Starting at: ${startTime.toISOString()}\n`);

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function testBuild(name, path, command) {
  console.log(`Building ${name}...`);
  const buildStart = Date.now();

  try {
    const output = execSync(command, {
      cwd: join(rootDir, path),
      encoding: "utf-8",
      stdio: "pipe",
      shell: true,
    });

    const duration = Date.now() - buildStart;
    console.log(`[OK] ${name} - SUCCESS (${formatDuration(duration)})`);

    return {
      name,
      success: true,
      duration: duration,
      durationFormatted: formatDuration(duration),
      output: output.substring(0, 500), // Limit output length
    };
  } catch (error) {
    const duration = Date.now() - buildStart;
    console.log(`[FAIL] ${name} - FAILED (${formatDuration(duration)})`);

    const errorOutput =
      error.stdout?.toString() || error.stderr?.toString() || error.message;
    if (errorOutput) {
      console.log(errorOutput.substring(0, 1000)); // Show first 1000 chars
    }

    return {
      name,
      success: false,
      duration: duration,
      durationFormatted: formatDuration(duration),
      output: errorOutput?.substring(0, 2000) || error.message,
    };
  }
}

// Step 1: Build infrastructure package (type-check first)
console.log("\n--- Step 1: Infrastructure Package ---");
results.push(
  testBuild(
    "Infrastructure (type-check)",
    "packages/infrastructure",
    "pnpm type-check",
  ),
);

// Step 2: Build all apps
console.log("\n--- Step 2: Building Apps ---");
results.push(testBuild("ittweb", "apps/ittweb", "pnpm build"));
results.push(testBuild("personalpage", "apps/personalpage", "pnpm build"));
results.push(testBuild("MafaldaGarcia", "apps/MafaldaGarcia", "pnpm build"));
results.push(testBuild("templatepage", "apps/templatepage", "pnpm build"));

// Summary
const endTime = new Date();
const totalDuration = endTime - startTime;
const successCount = results.filter((r) => r.success).length;
const failCount = results.filter((r) => !r.success).length;

console.log("\n=== Build Summary ===");
console.log(`Total Duration: ${formatDuration(totalDuration)}`);
console.log(`Successful: ${successCount} / ${results.length}`);
console.log(`Failed: ${failCount} / ${results.length}`);

console.log("\nDetailed Results:");
results.forEach((result) => {
  const status = result.success ? "[OK]" : "[FAIL]";
  console.log(`  ${status} ${result.name} - ${result.durationFormatted}`);
});

if (failCount > 0) {
  console.log("\nFailed Builds:");
  results
    .filter((r) => !r.success)
    .forEach((result) => {
      console.log(`\n  ${result.name}:`);
      if (result.output) {
        console.log(result.output.substring(0, 2000));
      }
    });
}

// Write results to JSON file
const jsonResult = {
  startTime: startTime.toISOString(),
  endTime: endTime.toISOString(),
  totalDurationSeconds: totalDuration / 1000,
  totalDurationFormatted: formatDuration(totalDuration),
  successCount,
  failCount,
  totalCount: results.length,
  allSuccessful: failCount === 0,
  results: results.map((r) => ({
    name: r.name,
    success: r.success,
    durationSeconds: r.duration / 1000,
    durationFormatted: r.durationFormatted,
    output: r.output,
  })),
};

const jsonPath = join(rootDir, "build-results.json");
writeFileSync(jsonPath, JSON.stringify(jsonResult, null, 2), "utf-8");
console.log(`\nResults also saved to: ${jsonPath}`);

process.exit(failCount > 0 ? 1 : 0);
