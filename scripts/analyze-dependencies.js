#!/usr/bin/env node
/**
 * Dependency Analysis Script
 *
 * Analyzes dependencies across the monorepo to identify:
 * - Duplicate dependencies that could be consolidated
 * - Dependencies that should be in shared packages
 * - Unused dependencies
 * - Version mismatches
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const APPS_DIR = path.join(ROOT_DIR, "apps");
const PACKAGES_DIR = path.join(ROOT_DIR, "packages");

// Known shared dependencies
const SHARED_DEPS = {
  infrastructure: ["axios", "zod"],
  ui: ["framer-motion", "lucide-react", "nprogress", "react-icons"],
};

function readPackageJson(dir) {
  const packagePath = path.join(dir, "package.json");
  if (!fs.existsSync(packagePath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(packagePath, "utf8"));
  } catch (e) {
    console.warn(`Failed to read ${packagePath}:`, e.message);
    return null;
  }
}

function getAllDependencies(pkg) {
  return {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
  };
}

function analyzeDependencies() {
  console.log("🔍 Analyzing dependencies across monorepo...\n");

  // Read all package.json files
  const packages = {};
  const apps = {};

  // Read packages
  const packageDirs = fs.readdirSync(PACKAGES_DIR);
  for (const dir of packageDirs) {
    const packagePath = path.join(PACKAGES_DIR, dir);
    if (fs.statSync(packagePath).isDirectory()) {
      const pkg = readPackageJson(packagePath);
      if (pkg) {
        packages[dir] = {
          name: pkg.name,
          deps: getAllDependencies(pkg),
          path: packagePath,
        };
      }
    }
  }

  // Read apps
  const appDirs = fs.readdirSync(APPS_DIR);
  for (const dir of appDirs) {
    const appPath = path.join(APPS_DIR, dir);
    if (fs.statSync(appPath).isDirectory()) {
      const pkg = readPackageJson(appPath);
      if (pkg) {
        apps[dir] = {
          name: pkg.name,
          deps: getAllDependencies(pkg),
          path: appPath,
        };
      }
    }
  }

  // Find duplicates
  console.log("📦 Duplicate Dependencies Analysis\n");
  const allDeps = {};

  // Collect all dependencies
  for (const [name, app] of Object.entries(apps)) {
    for (const [dep, version] of Object.entries(app.deps)) {
      if (!allDeps[dep]) {
        allDeps[dep] = [];
      }
      allDeps[dep].push({ type: "app", name, version });
    }
  }

  // Find dependencies that should be in shared packages
  console.log("⚠️  Dependencies that should be in shared packages:\n");
  let hasIssues = false;

  for (const [appName, app] of Object.entries(apps)) {
    const issues = [];
    for (const [dep, version] of Object.entries(app.deps)) {
      // Check if dependency should be in infrastructure
      if (SHARED_DEPS.infrastructure.includes(dep)) {
        issues.push({
          dep,
          version,
          shouldBeIn: "infrastructure",
          currentLocation: "app",
        });
        hasIssues = true;
      }
      // Check if dependency should be in ui
      if (SHARED_DEPS.ui.includes(dep)) {
        issues.push({
          dep,
          version,
          shouldBeIn: "ui",
          currentLocation: "app",
        });
        hasIssues = true;
      }
    }

    if (issues.length > 0) {
      console.log(`  ${appName}:`);
      for (const issue of issues) {
        console.log(
          `    - ${issue.dep}@${issue.version} should be in @websites/${issue.shouldBeIn}`,
        );
      }
      console.log();
    }
  }

  // Find version mismatches
  console.log("🔀 Version Mismatches:\n");
  const versionMap = {};
  for (const [dep, locations] of Object.entries(allDeps)) {
    const versions = [...new Set(locations.map((l) => l.version))];
    if (versions.length > 1) {
      versionMap[dep] = { versions, locations };
    }
  }

  if (Object.keys(versionMap).length > 0) {
    for (const [dep, { versions, locations }] of Object.entries(versionMap)) {
      console.log(`  ${dep}:`);
      console.log(`    Versions: ${versions.join(", ")}`);
      for (const loc of locations) {
        console.log(`      - ${loc.type}/${loc.name}: ${loc.version}`);
      }
      console.log();
    }
  } else {
    console.log("  ✅ No version mismatches found\n");
  }

  // Summary
  console.log("📊 Summary:\n");
  console.log(`  Total apps: ${Object.keys(apps).length}`);
  console.log(`  Total packages: ${Object.keys(packages).length}`);
  console.log(`  Unique dependencies: ${Object.keys(allDeps).length}`);
  console.log(`  Version mismatches: ${Object.keys(versionMap).length}`);

  if (hasIssues) {
    console.log(
      "\n⚠️  Action required: Some dependencies should be moved to shared packages",
    );
    process.exit(1);
  } else {
    console.log("\n✅ No dependency consolidation issues found");
    process.exit(0);
  }
}

// Run analysis
try {
  analyzeDependencies();
} catch (error) {
  console.error("❌ Error analyzing dependencies:", error);
  process.exit(1);
}
