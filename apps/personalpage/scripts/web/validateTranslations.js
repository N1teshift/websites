import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { glob } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Translation Validation Script
 *
 * This script helps identify:
 * 1. Missing translations - keys used in code but not in locale files
 * 2. Unused translations - keys in locale files but not used in code
 * 3. Translation coverage across all languages
 */

// Configuration
const LOCALES_DIR = path.join(__dirname, "..", "locales");
const SOURCE_DIRS = ["src/features/**/*.{js,jsx,ts,tsx}", "src/pages/**/*.{js,jsx,ts,tsx}"];
const LANGUAGES = ["en", "lt", "ru"];
const NAMESPACES = ["common", "aboutme", "emw", "itt", "calendar", "links", "math", "voice"];

// Mock i18n instance for validation
const mockI18n = {
  exists: (key, options = {}) => {
    const { ns = "common", lng = "en" } = options;
    const localePath = path.join(LOCALES_DIR, lng, `${ns}.json`);

    if (!fs.existsSync(localePath)) {
      return false;
    }

    try {
      const localeData = JSON.parse(fs.readFileSync(localePath, "utf8"));
      return key.split(".").reduce((obj, k) => obj && obj[k], localeData) !== undefined;
    } catch (error) {
      console.error(`Error reading ${localePath}:`, error.message);
      return false;
    }
  },
};

/**
 * Extract translation keys from source files
 */
function extractTranslationKeys() {
  console.log("🔍 Scanning source files for translation keys...");

  const keys = new Set();
  const keyPatterns = [
    /t\(['"`]([^'"`]+)['"`]\)/g, // t('key')
    /t\(["`]([^"`]+)["`]\)/g, // t("key")
    /t\(`([^`]+)`\)/g, // t(`key`)
    /t\(['"`]([^'"`]+)['"`],/g, // t('key', options)
    /t\(["`]([^"`]+)["`],/g, // t("key", options)
    /t\(`([^`]+)`,/g, // t(`key`, options)
  ];

  let totalFiles = 0;
  let processedFiles = 0;

  SOURCE_DIRS.forEach((pattern) => {
    const files = glob.sync(pattern, { cwd: path.join(__dirname, "..") });
    totalFiles += files.length;

    files.forEach((file) => {
      try {
        const content = fs.readFileSync(file, "utf8");
        let fileHasKeys = false;

        keyPatterns.forEach((regex) => {
          let match;
          while ((match = regex.exec(content)) !== null) {
            keys.add(match[1]);
            fileHasKeys = true;
          }
        });

        if (fileHasKeys) {
          console.log(`   📄 Found keys in: ${file}`);
        }

        processedFiles++;
      } catch (error) {
        console.error(`Error reading ${file}:`, error.message);
        processedFiles++;
      }
    });
  });

  console.log(
    `✅ Scanned ${processedFiles}/${totalFiles} files, found ${keys.size} unique translation keys\n`
  );
  return Array.from(keys);
}

/**
 * Get all keys from locale files
 */
function getLocaleKeys() {
  console.log("📚 Scanning locale files...");

  const keys = new Set();
  let totalLocaleFiles = 0;
  let processedLocaleFiles = 0;

  LANGUAGES.forEach((lng) => {
    NAMESPACES.forEach((ns) => {
      const localePath = path.join(LOCALES_DIR, lng, `${ns}.json`);
      totalLocaleFiles++;

      if (fs.existsSync(localePath)) {
        try {
          const localeData = JSON.parse(fs.readFileSync(localePath, "utf8"));
          const beforeCount = keys.size;
          extractKeysRecursive(localeData, "", keys);
          const afterCount = keys.size;

          if (afterCount > beforeCount) {
            console.log(`   📄 ${lng}/${ns}.json: ${afterCount - beforeCount} keys`);
          }

          processedLocaleFiles++;
        } catch (error) {
          console.error(`Error reading ${localePath}:`, error.message);
          processedLocaleFiles++;
        }
      } else {
        console.log(`   ⚠️  Missing: ${lng}/${ns}.json`);
        processedLocaleFiles++;
      }
    });
  });

  console.log(
    `✅ Processed ${processedLocaleFiles}/${totalLocaleFiles} locale files, found ${keys.size} total keys\n`
  );
  return Array.from(keys);
}

/**
 * Recursively extract keys from nested objects
 */
function extractKeysRecursive(obj, prefix, keys) {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      extractKeysRecursive(value, fullKey, keys);
    } else {
      keys.add(fullKey);
    }
  }
}

/**
 * Check if a key exists in all languages for a namespace
 */
function checkKeyExists(key, namespace = "common") {
  const results = {};
  LANGUAGES.forEach((lng) => {
    results[lng] = mockI18n.exists(key, { ns: namespace, lng });
  });
  return results;
}

/**
 * Find missing translations
 */
function findMissingTranslations() {
  console.log("🔍 Checking for missing translations...");

  const codeKeys = extractTranslationKeys();
  const missing = [];
  let checkedKeys = 0;

  codeKeys.forEach((key) => {
    // Try to determine namespace from key structure or assume 'common'
    const namespace = key.includes(":") ? key.split(":")[0] : "common";
    const cleanKey = key.includes(":") ? key.split(":")[1] : key;

    const exists = checkKeyExists(cleanKey, namespace);
    const missingLanguages = LANGUAGES.filter((lng) => !exists[lng]);

    if (missingLanguages.length > 0) {
      missing.push({
        key: cleanKey,
        namespace,
        missingLanguages,
        exists,
      });
    }

    checkedKeys++;
    if (checkedKeys % 10 === 0) {
      console.log(`   ⏳ Checked ${checkedKeys}/${codeKeys.length} keys...`);
    }
  });

  console.log(`✅ Checked ${checkedKeys} keys for missing translations\n`);
  return missing;
}

/**
 * Find unused translations
 */
function findUnusedTranslations() {
  console.log("🔍 Checking for unused translations...");

  const codeKeys = extractTranslationKeys();
  const localeKeys = getLocaleKeys();
  const unused = [];
  let checkedKeys = 0;

  localeKeys.forEach((key) => {
    // Check if this key is used in code
    const isUsed = codeKeys.some((codeKey) => {
      const cleanCodeKey = codeKey.includes(":") ? codeKey.split(":")[1] : codeKey;
      return cleanCodeKey === key;
    });

    if (!isUsed) {
      unused.push(key);
    }

    checkedKeys++;
    if (checkedKeys % 50 === 0) {
      console.log(`   ⏳ Checked ${checkedKeys}/${localeKeys.length} locale keys...`);
    }
  });

  console.log(`✅ Checked ${checkedKeys} locale keys for unused translations\n`);
  return unused;
}

/**
 * Generate translation coverage report
 */
function generateCoverageReport() {
  console.log("=== Translation Validation Report ===\n");

  const codeKeys = extractTranslationKeys();
  const localeKeys = getLocaleKeys();
  const missing = findMissingTranslations();
  const unused = findUnusedTranslations();

  // Summary
  console.log("📊 Summary:");
  console.log(`   • Keys used in code: ${codeKeys.length}`);
  console.log(`   • Keys in locale files: ${localeKeys.length}`);
  console.log(`   • Missing translations: ${missing.length}`);
  console.log(`   • Unused translations: ${unused.length}`);
  console.log(
    `   • Coverage: ${(((codeKeys.length - missing.length) / codeKeys.length) * 100).toFixed(1)}%`
  );

  // Missing translations
  if (missing.length > 0) {
    console.log("\n❌ Missing Translations:");
    missing.forEach((item) => {
      console.log(`   • ${item.key} (${item.namespace})`);
      console.log(`     Missing in: ${item.missingLanguages.join(", ")}`);
    });
  } else {
    console.log("\n✅ No missing translations found!");
  }

  // Unused translations
  if (unused.length > 0) {
    console.log("\n⚠️  Unused Translations:");
    unused.slice(0, 20).forEach((key) => {
      console.log(`   • ${key}`);
    });
    if (unused.length > 20) {
      console.log(`   ... and ${unused.length - 20} more`);
    }
  } else {
    console.log("\n✅ No unused translations found!");
  }

  // Language coverage
  console.log("\n🌍 Language Coverage:");
  LANGUAGES.forEach((lng) => {
    const missingForLang = missing.filter((item) => item.missingLanguages.includes(lng)).length;
    const coverage = (((codeKeys.length - missingForLang) / codeKeys.length) * 100).toFixed(1);
    console.log(`   • ${lng}: ${coverage}% (${missingForLang} missing)`);
  });

  // Namespace breakdown
  console.log("\n📁 Namespace Breakdown:");
  const namespaceStats = {};
  codeKeys.forEach((key) => {
    const namespace = key.includes(":") ? key.split(":")[0] : "common";
    if (!namespaceStats[namespace]) {
      namespaceStats[namespace] = { total: 0, missing: 0 };
    }
    namespaceStats[namespace].total++;
  });

  missing.forEach((item) => {
    if (!namespaceStats[item.namespace]) {
      namespaceStats[item.namespace] = { total: 0, missing: 0 };
    }
    namespaceStats[item.namespace].missing++;
  });

  Object.entries(namespaceStats).forEach(([ns, stats]) => {
    const coverage = (((stats.total - stats.missing) / stats.total) * 100).toFixed(1);
    console.log(
      `   • ${ns}: ${stats.total} keys, ${stats.missing} missing (${coverage}% coverage)`
    );
  });

  return {
    codeKeys,
    localeKeys,
    missing,
    unused,
  };
}

// Main execution
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"))) {
  try {
    console.log("🚀 Starting translation validation...\n");

    const report = generateCoverageReport();

    // Save detailed report to file
    const reportPath = "translation-validation-report.json";
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    // Exit with error code if there are missing translations
    if (report.missing.length > 0) {
      console.log("\n❌ Validation failed: Missing translations found");
      process.exit(1);
    } else {
      console.log("\n✅ Validation passed: All translations present");
    }
  } catch (error) {
    console.error("Error during validation:", error);
    process.exit(1);
  }
}

export {
  extractTranslationKeys,
  getLocaleKeys,
  findMissingTranslations,
  findUnusedTranslations,
  generateCoverageReport,
};
