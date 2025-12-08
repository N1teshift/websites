#!/usr/bin/env node
/**
 * Script Validation Tool
 *
 * Validates that apps follow script naming conventions.
 *
 * Usage:
 *   node scripts/validate-scripts.js [app-name]
 *
 * If app-name is provided, validates only that app.
 * Otherwise, validates all apps.
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");

// Standard scripts that all apps should have
const REQUIRED_SCRIPTS = [
  "dev",
  "build",
  "lint",
  "format",
  "format:check",
  "type-check",
];

// Optional standard scripts (warn if missing but don't fail)
const OPTIONAL_SCRIPTS = ["test"];

// Script naming patterns (regex)
// Allows: lowercase, kebab-case, numbers, and colon-separated namespaces
const VALID_PATTERNS = [
  /^[a-z][a-z0-9-]*$/, // Basic: lowercase, kebab-case, can end with numbers
  /^[a-z][a-z0-9-]*:[a-z0-9][a-z0-9-]*$/, // Namespaced: test:unit or test:10
  /^[a-z][a-z0-9-]*(:[a-z0-9][a-z0-9-]*)+$/, // Multi-namespaced: test:unit:coverage or test:openai:failed:10
];

function validateScriptName(name) {
  return VALID_PATTERNS.some((pattern) => pattern.test(name));
}

function getAppScripts(appName) {
  const packageJsonPath = join(ROOT_DIR, "apps", appName, "package.json");

  if (!existsSync(packageJsonPath)) {
    return null;
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    return packageJson.scripts || {};
  } catch (error) {
    console.error(`Error reading ${packageJsonPath}:`, error.message);
    return null;
  }
}

function validateApp(appName) {
  const scripts = getAppScripts(appName);

  if (!scripts) {
    return {
      app: appName,
      valid: false,
      errors: [`Could not read package.json`],
      warnings: [],
      missing: [],
    };
  }

  const errors = [];
  const warnings = [];
  const missing = [];
  const missingOptional = [];

  // Check for required scripts
  for (const stdScript of REQUIRED_SCRIPTS) {
    if (!scripts[stdScript]) {
      missing.push(stdScript);
    }
  }

  // Check for optional scripts (warn but don't fail)
  for (const stdScript of OPTIONAL_SCRIPTS) {
    if (!scripts[stdScript]) {
      missingOptional.push(stdScript);
    }
  }

  // Validate script names
  for (const [name, command] of Object.entries(scripts)) {
    if (!validateScriptName(name)) {
      errors.push(
        `Invalid script name: "${name}" (should be kebab-case, optionally namespaced with colons)`,
      );
    }

    // Check for common anti-patterns
    if (name.includes("_")) {
      warnings.push(`Script "${name}" uses underscores (prefer kebab-case)`);
    }
    if (name[0] !== name[0].toLowerCase()) {
      warnings.push(
        `Script "${name}" starts with uppercase (prefer lowercase)`,
      );
    }
    if (name.includes(" ")) {
      errors.push(`Script "${name}" contains spaces (use kebab-case)`);
    }
  }

  const valid = errors.length === 0 && missing.length === 0;

  return {
    app: appName,
    valid,
    errors,
    warnings,
    missing,
    missingOptional,
    scriptCount: Object.keys(scripts).length,
  };
}

function main() {
  const args = process.argv.slice(2);
  const targetApp = args[0];

  const apps = targetApp
    ? [targetApp]
    : ["ittweb", "personalpage", "MafaldaGarcia", "templatepage"];

  const results = [];
  let allValid = true;

  for (const app of apps) {
    const result = validateApp(app);
    results.push(result);
    if (!result.valid) {
      allValid = false;
    }
  }

  // Output results
  console.log("\n📋 Script Validation Results\n");
  console.log("=".repeat(60));

  for (const result of results) {
    console.log(`\n${result.app}:`);
    console.log("-".repeat(60));
    console.log(`  Scripts found: ${result.scriptCount}`);

    if (result.missing && result.missing.length > 0) {
      console.log(
        `  ❌ Missing required scripts: ${result.missing.join(", ")}`,
      );
    }

    if (result.missingOptional && result.missingOptional.length > 0) {
      console.log(
        `  ⚠️  Missing optional scripts: ${result.missingOptional.join(", ")}`,
      );
    }

    if (result.warnings.length > 0) {
      console.log(`  ⚠️  Warnings:`);
      result.warnings.forEach((w) => console.log(`    - ${w}`));
    }

    if (result.errors.length > 0) {
      console.log(`  ❌ Errors:`);
      result.errors.forEach((e) => console.log(`    - ${e}`));
    }

    if (result.valid && result.warnings.length === 0) {
      console.log(`  ✅ All scripts valid`);
    }
  }

  console.log("\n" + "=".repeat(60));

  if (allValid) {
    console.log("\n✅ All apps pass validation");
    process.exit(0);
  } else {
    console.log("\n❌ Some apps have validation issues");
    process.exit(1);
  }
}

main();
