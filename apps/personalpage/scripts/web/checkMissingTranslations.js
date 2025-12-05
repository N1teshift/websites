import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Focused script to check for missing translations using i18n.exists approach
 * This script specifically addresses the TODO item about using i18n.exists
 */

// Configuration
const LOCALES_DIR = path.join(__dirname, '..', 'locales');
const LANGUAGES = ['en', 'lt', 'ru'];
const NAMESPACES = ['common', 'aboutme', 'emw', 'itt', 'calendar', 'links', 'math', 'voice'];

/**
 * Mock i18n instance that mimics the real i18n.exists behavior
 */
class MockI18n {
  constructor() {
    this.localeCache = new Map();
  }

  /**
   * Check if a translation key exists in a specific namespace and language
   * This mimics the i18n.exists(key, { ns, lng }) behavior
   */
  exists(key, options = {}) {
    const { ns = 'common', lng = 'en' } = options;
    const cacheKey = `${lng}:${ns}`;
    
    // Load locale data if not cached
    if (!this.localeCache.has(cacheKey)) {
      const localePath = path.join(LOCALES_DIR, lng, `${ns}.json`);
      if (fs.existsSync(localePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(localePath, 'utf8'));
          this.localeCache.set(cacheKey, data);
        } catch (error) {
          console.error(`Error loading ${localePath}:`, error.message);
          this.localeCache.set(cacheKey, {});
        }
      } else {
        this.localeCache.set(cacheKey, {});
      }
    }

    const localeData = this.localeCache.get(cacheKey);
    
    // Check if key exists using dot notation (e.g., "nested.key")
    const keys = key.split('.');
    let current = localeData;
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return false;
      }
    }
    
    return typeof current === 'string';
  }

  /**
   * Get all keys from a specific namespace and language
   */
  getAllKeys(ns, lng) {
    const cacheKey = `${lng}:${ns}`;
    
    if (!this.localeCache.has(cacheKey)) {
      const localePath = path.join(LOCALES_DIR, lng, `${ns}.json`);
      if (fs.existsSync(localePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(localePath, 'utf8'));
          this.localeCache.set(cacheKey, data);
        } catch (error) {
          console.error(`Error loading ${localePath}:`, error.message);
          this.localeCache.set(cacheKey, {});
        }
      } else {
        this.localeCache.set(cacheKey, {});
      }
    }

    const localeData = this.localeCache.get(cacheKey);
    const keys = [];
    this.extractKeysRecursive(localeData, '', keys);
    return keys;
  }

  /**
   * Recursively extract all keys from nested objects
   */
  extractKeysRecursive(obj, prefix, keys) {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.extractKeysRecursive(value, fullKey, keys);
      } else {
        keys.push(fullKey);
      }
    }
  }
}

/**
 * Extract translation keys from source files
 */
function extractTranslationKeys() {
  console.log('🔍 Scanning source files for translation keys...');
  
  const keys = new Set();
  const patterns = [
    /t\(['"`]([^'"`]+)['"`]\)/g,
    /t\(["`]([^"`]+)["`]\)/g,
    /t\(`([^`]+)`\)/g,
    /t\(['"`]([^'"`]+)['"`],/g,
    /t\(["`]([^"`]+)["`],/g,
    /t\(`([^`]+)`,/g,
  ];

  const sourceFiles = [
    ...glob.sync('src/features/**/*.{js,jsx,ts,tsx}', { cwd: path.join(__dirname, '..') }),
    ...glob.sync('src/pages/**/*.{js,jsx,ts,tsx}', { cwd: path.join(__dirname, '..') })
  ];

  let filesWithKeys = 0;
  sourceFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      let fileHasKeys = false;
      
      patterns.forEach(regex => {
        let match;
        while ((match = regex.exec(content)) !== null) {
          keys.add(match[1]);
          fileHasKeys = true;
        }
      });
      
      if (fileHasKeys) {
        console.log(`   📄 Found keys in: ${file}`);
        filesWithKeys++;
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  });

  console.log(`✅ Scanned ${sourceFiles.length} files (${filesWithKeys} with keys), found ${keys.size} unique translation keys\n`);
  return Array.from(keys);
}

/**
 * Check for missing translations using i18n.exists approach
 */
function checkMissingTranslations() {
  console.log('🔍 Checking for missing translations using i18n.exists...');
  
  const i18n = new MockI18n();
  const codeKeys = extractTranslationKeys();
  const missing = [];
  let checkedKeys = 0;

  codeKeys.forEach(key => {
    // Parse namespace from key if present (e.g., "namespace:key")
    const parts = key.split(':');
    const namespace = parts.length > 1 ? parts[0] : 'common';
    const cleanKey = parts.length > 1 ? parts[1] : key;

    const missingLanguages = [];

    // Check if key exists in each language using i18n.exists
    LANGUAGES.forEach(lng => {
      if (!i18n.exists(cleanKey, { ns: namespace, lng })) {
        missingLanguages.push(lng);
      }
    });

    if (missingLanguages.length > 0) {
      missing.push({
        key: cleanKey,
        namespace,
        missingLanguages,
        fullKey: key
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
 * Check for unused translations
 */
function checkUnusedTranslations() {
  console.log('🔍 Checking for unused translations...');
  
  const i18n = new MockI18n();
  const codeKeys = extractTranslationKeys();
  const unused = [];
  let totalLocaleKeys = 0;
  let checkedKeys = 0;

  NAMESPACES.forEach(ns => {
    LANGUAGES.forEach(lng => {
      const localeKeys = i18n.getAllKeys(ns, lng);
      totalLocaleKeys += localeKeys.length;
      
      localeKeys.forEach(key => {
        // Check if this key is used in code
        const isUsed = codeKeys.some(codeKey => {
          const parts = codeKey.split(':');
          const codeNamespace = parts.length > 1 ? parts[0] : 'common';
          const cleanCodeKey = parts.length > 1 ? parts[1] : codeKey;
          
          return codeNamespace === ns && cleanCodeKey === key;
        });

        if (!isUsed) {
          unused.push({
            key,
            namespace: ns,
            language: lng
          });
        }
        
        checkedKeys++;
        if (checkedKeys % 50 === 0) {
          console.log(`   ⏳ Checked ${checkedKeys}/${totalLocaleKeys} locale keys...`);
        }
      });
    });
  });

  console.log(`✅ Checked ${checkedKeys} locale keys for unused translations\n`);
  return unused;
}

/**
 * Generate comprehensive report
 */
function generateReport() {
  console.log('=== Translation Validation using i18n.exists ===\n');

  const missing = checkMissingTranslations();
  const unused = checkUnusedTranslations();

  // Summary
  console.log('📊 Summary:');
  console.log(`   • Missing translations: ${missing.length}`);
  console.log(`   • Unused translations: ${unused.length}`);

  // Missing translations
  if (missing.length > 0) {
    console.log('\n❌ Missing Translations:');
    missing.forEach(item => {
      console.log(`   • ${item.key} (${item.namespace})`);
      console.log(`     Missing in: ${item.missingLanguages.join(', ')}`);
    });
  } else {
    console.log('\n✅ No missing translations found!');
  }

  // Unused translations (grouped by namespace)
  if (unused.length > 0) {
    console.log('\n⚠️  Unused Translations:');
    const grouped = unused.reduce((acc, item) => {
      if (!acc[item.namespace]) acc[item.namespace] = [];
      acc[item.namespace].push(item);
      return acc;
    }, {});

    Object.entries(grouped).forEach(([ns, items]) => {
      console.log(`\n   ${ns}:`);
      items.slice(0, 10).forEach(item => {
        console.log(`     • ${item.key} (${item.language})`);
      });
      if (items.length > 10) {
        console.log(`     ... and ${items.length - 10} more`);
      }
    });
  } else {
    console.log('\n✅ No unused translations found!');
  }

  // Language coverage
  console.log('\n🌍 Language Coverage:');
  LANGUAGES.forEach(lng => {
    const missingForLang = missing.filter(item => 
      item.missingLanguages.includes(lng)
    ).length;
    console.log(`   • ${lng}: ${missingForLang} missing translations`);
  });

  // Namespace breakdown
  console.log('\n📁 Namespace Breakdown:');
  const namespaceStats = {};
  const codeKeys = extractTranslationKeys();
  
  codeKeys.forEach(key => {
    const namespace = key.includes(':') ? key.split(':')[0] : 'common';
    if (!namespaceStats[namespace]) {
      namespaceStats[namespace] = { total: 0, missing: 0 };
    }
    namespaceStats[namespace].total++;
  });
  
  missing.forEach(item => {
    if (!namespaceStats[item.namespace]) {
      namespaceStats[item.namespace] = { total: 0, missing: 0 };
    }
    namespaceStats[item.namespace].missing++;
  });

  Object.entries(namespaceStats).forEach(([ns, stats]) => {
    const coverage = ((stats.total - stats.missing) / stats.total * 100).toFixed(1);
    console.log(`   • ${ns}: ${stats.total} keys, ${stats.missing} missing (${coverage}% coverage)`);
  });

  return { missing, unused };
}

// Main execution
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  try {
    console.log('🚀 Starting focused translation validation...\n');
    
    const report = generateReport();
    
    // Save report to file
    const reportPath = 'missing-translations-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    // Exit with error code if there are missing translations
    if (report.missing.length > 0) {
      console.log('\n❌ Validation failed: Missing translations found');
      process.exit(1);
    } else {
      console.log('\n✅ Validation passed: All translations present');
    }
  } catch (error) {
    console.error('Error during validation:', error);
    process.exit(1);
  }
}

export {
  MockI18n,
  checkMissingTranslations,
  checkUnusedTranslations,
  generateReport
};
