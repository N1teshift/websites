/**
 * Generate mapping from raw item codes (like "IM2o", "IM1y") to item slugs
 * 
 * This script creates a mapping that connects raw Warcraft 3 item object IDs
 * (from replay data) to the item slugs used in the TypeScript files.
 * 
 * Usage: node scripts/data/generate/generate-item-code-mapping.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadJson, slugify, stripColorCodes } from '../lib/utils.mjs';
import { TMP_RAW_DIR, ROOT_DIR } from '../lib/paths.mjs';

const ITEMS_JSON_FILE = path.join(TMP_RAW_DIR, 'items.json');
const ITEMS_TS_DIR = path.join(ROOT_DIR, 'src', 'features', 'modules', 'content', 'guides', 'data', 'items');
const REPLAY_ITEM_UTILS_FILE = path.join(ITEMS_TS_DIR, 'replayItemUtils.ts');

/**
 * Extract first 4 characters from item ID (raw code format)
 */
function getRawItemCode(fullId) {
  if (!fullId || typeof fullId !== 'string') return null;
  // Full ID format is like "IM2o:bspd" - we want "IM2o"
  const parts = fullId.split(':');
  if (parts.length > 0 && parts[0].length >= 4) {
    return parts[0].substring(0, 4);
  }
  return parts[0] || null;
}

/**
 * Normalize item name for matching (lowercase, strip color codes, trim, handle apostrophes)
 * Apostrophes are removed to match slug generation (e.g., "Hunter's Trophy" -> "hunters trophy")
 */
function normalizeItemName(name) {
  if (!name) return '';
  return stripColorCodes(name)
    .toLowerCase()
    .trim()
    .replace(/'/g, '')  // Remove apostrophes to match slug generation
    .replace(/\s+/g, ' ');
}

/**
 * Parse TypeScript item files to extract items with their slugs and names
 */
function parseTypeScriptItems() {
  const itemFiles = [
    'raw-materials.ts',
    'weapons.ts',
    'armor.ts',
    'potions.ts',
    'scrolls.ts',
    'buildings.ts',
    'unknown.ts',
  ];

  const items = [];
  
  for (const fileName of itemFiles) {
    const filePath = path.join(ITEMS_TS_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠️  File not found: ${filePath}`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract item objects using regex
    // Look for patterns like: { id: 'slug', name: 'Name', ... }
    // Handle both single-line and multi-line formats
    // Handle escaped quotes: 'Hunter\'s Trophy' -> 'Hunter's Trophy'
    // Pattern: (?:'([^'\\]|\\.)*'|"([^"\\]|\\.)*") matches either single or double quoted strings with escaped quotes
    const itemPattern = /{\s*id:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")[^}]*?name:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/gs;
    let match;
    
    while ((match = itemPattern.exec(content)) !== null) {
      // match[1] or match[2] is the slug (depending on quote type)
      // match[3] or match[4] is the name (depending on quote type)
      const slug = (match[1] || match[2]).replace(/\\(['"\\])/g, '$1'); // Unescape quotes and backslashes
      const name = (match[3] || match[4]).replace(/\\(['"\\])/g, '$1'); // Unescape quotes and backslashes
      items.push({ slug, name, normalizedName: normalizeItemName(name) });
    }
  }

  return items;
}

/**
 * Main function
 */
async function main() {
  console.log('🔗 Generating item code to slug mapping...\n');
  
  // Load items from JSON
  const itemsData = loadJson(ITEMS_JSON_FILE);
  if (!itemsData || !itemsData.items) {
    console.error('❌ No items data found');
    console.error(`   Looking for: ${ITEMS_JSON_FILE}`);
    console.error('   Run the extraction script first: node scripts/data/extract/extract-from-w3x.mjs');
    process.exit(1);
  }

  // Parse TypeScript items
  console.log('  Reading TypeScript item files...');
  const tsItems = parseTypeScriptItems();
  console.log(`  Found ${tsItems.length} items in TypeScript files`);

  // Create a map of normalized name -> slug for quick lookup
  const nameToSlugMap = new Map();
  for (const item of tsItems) {
    const normalized = item.normalizedName;
    // If multiple items have the same normalized name, prefer the one that matches slug
    if (!nameToSlugMap.has(normalized) || item.slug === normalized.replace(/\s+/g, '-')) {
      nameToSlugMap.set(normalized, item.slug);
    }
  }

  // Build mapping from raw codes to slugs
  const rawCodeToSlugMap = {};
  let mappedCount = 0;
  let unmatchedCount = 0;
  let duplicateRawCodes = new Set();
  const unmatchedItems = [];

  console.log(`\n  Processing ${itemsData.items.length} items from JSON...`);

  for (const item of itemsData.items) {
    if (!item.id || !item.name) continue;
    
    const rawCode = getRawItemCode(item.id);
    if (!rawCode || rawCode.length < 4) continue;
    
    const normalizedName = normalizeItemName(item.name);
    if (!normalizedName) continue;

    // Try to find matching slug by normalized name
    const slug = nameToSlugMap.get(normalizedName);
    
    if (slug) {
      // Map raw code to slug (keep first mapping if duplicate raw codes exist)
      if (!rawCodeToSlugMap[rawCode]) {
        rawCodeToSlugMap[rawCode] = slug;
        mappedCount++;
      } else if (rawCodeToSlugMap[rawCode] !== slug) {
        // Track duplicates for logging
        duplicateRawCodes.add(rawCode);
      }
    } else {
      unmatchedCount++;
      if (unmatchedItems.length < 20) {
        unmatchedItems.push({ rawCode, name: item.name, normalizedName });
      }
    }
  }

  if (duplicateRawCodes.size > 0) {
    console.log(`  ⚠️  Found ${duplicateRawCodes.size} duplicate raw codes (using first mapping)`);
  }

  if (unmatchedCount > 0) {
    console.log(`  ⚠️  Could not match ${unmatchedCount} items`);
    if (unmatchedItems.length > 0) {
      console.log(`  Sample unmatched items:`);
      unmatchedItems.slice(0, 5).forEach(item => {
        console.log(`    - ${item.rawCode}: "${item.name}" (normalized: "${item.normalizedName}")`);
      });
    }
  }

  // Read existing file to preserve the structure, or create template if it doesn't exist
  let existingContent = '';
  if (fs.existsSync(REPLAY_ITEM_UTILS_FILE)) {
    existingContent = fs.readFileSync(REPLAY_ITEM_UTILS_FILE, 'utf-8');
  } else {
    // Create the file with the template structure
    existingContent = `/**
 * Utilities for mapping replay item IDs to item data
 * 
 * Replay files store items as numeric IDs (integers). These need to be:
 * 1. Decoded to 4-character codes (e.g., 1768712192 -> "IM2o")
 * 2. Mapped to item slugs (e.g., "IM2o" -> "iron-axe")
 * 3. Looked up in the item database
 */

import { getItemById } from "./index";
import type { ItemData } from "@/types/items";

/**
 * Decode Warcraft III object ID integer into its 4-character string
 * 
 * Warcraft 3 stores object IDs as 32-bit integers where each byte represents
 * a character in the 4-character code (little-endian).
 * 
 * @param value - Numeric object ID from replay
 * @returns 4-character code (e.g., "IM2o") or null if invalid
 */
export function decodeObjectId(value: number): string | null {
  if (typeof value !== "number" || Number.isNaN(value) || value === 0) {
    return null;
  }

  let result = "";
  let remaining = value;

  // Extract 4 bytes (characters) from the integer (little-endian)
  for (let i = 0; i < 4; i++) {
    const charCode = remaining & 0xff;
    result = String.fromCharCode(charCode) + result;
    remaining = remaining >>> 8;
  }

  return result.trim() ? result : null;
}

/**
 * Mapping from raw 4-character item codes to item slugs
 * 
 * This mapping is automatically generated by the data generation script:
 * scripts/data/generate/generate-item-code-mapping.mjs
 * 
 * Example: "IM2o" -> "iron-axe"
 */
export const RAW_ITEM_CODE_TO_SLUG: Record<string, string> = {
  // This will be populated when the data generation script runs
};

/**
 * Get item by replay ID (numeric ID from game replay)
 * 
 * Converts a numeric replay ID to an item by:
 * 1. Decoding the numeric ID to a 4-character code
 * 2. Looking up the code in RAW_ITEM_CODE_TO_SLUG to get the item slug
 * 3. Looking up the item by slug using getItemById
 * 
 * @param replayId - Numeric item ID from replay metadata
 * @returns ItemData if found, undefined otherwise
 */
export function getItemByReplayId(replayId: number): ItemData | undefined {
  if (!replayId || replayId === 0) {
    return undefined;
  }

  // Step 1: Decode numeric ID to 4-character code
  const itemCode = decodeObjectId(replayId);
  if (!itemCode) {
    return undefined;
  }

  // Step 2: Map code to item slug
  const itemSlug = RAW_ITEM_CODE_TO_SLUG[itemCode];
  if (!itemSlug) {
    return undefined;
  }

  // Step 3: Get item by slug
  return getItemById(itemSlug);
}

/**
 * Get items by replay IDs (array of numeric IDs from game replay)
 * Filters out zeros and invalid IDs
 * 
 * @param replayIds - Array of numeric item IDs from replay metadata
 * @returns Array of ItemData objects for valid items
 */
export function getItemsByReplayIds(replayIds: number[]): ItemData[] {
  if (!replayIds || replayIds.length === 0) {
    return [];
  }

  const items: ItemData[] = [];
  for (const replayId of replayIds) {
    if (replayId && replayId !== 0) {
      const item = getItemByReplayId(replayId);
      if (item) {
        items.push(item);
      }
    }
  }
  return items;
}
`;
    console.log('  Created replayItemUtils.ts template file');
  }

  // Generate the mapping entries
  const mappingsEntries = Object.entries(rawCodeToSlugMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([rawCode, slug]) => `    '${rawCode}': '${slug}',`)
    .join('\n');

  // Replace the RAW_ITEM_CODE_TO_SLUG constant in the file
  const mappingStart = 'export const RAW_ITEM_CODE_TO_SLUG: Record<string, string> = {';
  const mappingEnd = '};';
  
  let newContent;
  if (existingContent.includes(mappingStart)) {
    // Find and replace the existing mapping
    const startIndex = existingContent.indexOf(mappingStart);
    const endIndex = existingContent.indexOf(mappingEnd, startIndex);
    
    if (endIndex !== -1) {
      const before = existingContent.substring(0, startIndex + mappingStart.length);
      const after = existingContent.substring(endIndex);
      newContent = before + '\n' + mappingsEntries + '\n' + after;
    } else {
      console.error('❌ Could not find end of RAW_ITEM_CODE_TO_SLUG mapping');
      process.exit(1);
    }
  } else {
    console.error('❌ Could not find RAW_ITEM_CODE_TO_SLUG mapping in file');
    console.error(`   File exists: ${fs.existsSync(REPLAY_ITEM_UTILS_FILE)}`);
    console.error(`   File path: ${REPLAY_ITEM_UTILS_FILE}`);
    process.exit(1);
  }

  // Write the updated file
  fs.writeFileSync(REPLAY_ITEM_UTILS_FILE, newContent, 'utf-8');
  
  console.log(`\n✅ Updated item code mapping in: ${path.relative(ROOT_DIR, REPLAY_ITEM_UTILS_FILE)}`);
  console.log(`   Total mappings: ${mappedCount}`);
  console.log(`   Unmatched items: ${unmatchedCount}`);
}

export { main as generateItemCodeMapping };

// Always run main when script is executed directly
// This works because Node.js sets import.meta.url to the current file when run directly
main().catch(err => {
  console.error('Error running script:', err);
  process.exit(1);
});
