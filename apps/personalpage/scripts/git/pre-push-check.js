#!/usr/bin/env node

/**
 * Pre-push git hook script
 * Runs lint and build checks before allowing push
 */

import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "../..");

function runCommand(command, description) {
  console.log(`\n🔍 ${description}...`);
  try {
    execSync(command, {
      cwd: projectRoot,
      stdio: "inherit",
      shell: process.platform === "win32" ? "cmd.exe" : "/bin/bash",
    });
    console.log(`✅ ${description} passed\n`);
    return true;
  } catch (error) {
    console.error(`\n❌ ${description} failed!\n`);
    return false;
  }
}

console.log("🚀 Running pre-push checks...\n");

// Use npm via node to ensure cross-platform compatibility
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const checks = [
  {
    command: `${npmCommand} run lint`,
    description: "Linting",
  },
  {
    command: `${npmCommand} run build`,
    description: "Building project",
  },
];

let allPassed = true;
for (const check of checks) {
  if (!runCommand(check.command, check.description)) {
    allPassed = false;
    break;
  }
}

if (!allPassed) {
  console.error("\n❌ Pre-push checks failed. Push aborted.");
  console.error("💡 Fix the errors above before pushing.\n");
  process.exit(1);
}

console.log("✅ All pre-push checks passed. Proceeding with push...\n");
process.exit(0);
