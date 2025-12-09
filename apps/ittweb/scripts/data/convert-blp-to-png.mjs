/**
 * Convert BLP files from ReplaceableTextures to PNG files in itt icons folder
 *
 * This script converts missing icons from .blp format to .png format
 * and copies them to the itt icons folder with lowercase names.
 *
 * Usage: node scripts/data/convert-blp-to-png.mjs
 *
 * Requires: pnpm add -D jsr:@pinta365/blp
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { decodeBlpData, encodeToPNGAuto } from '@pinta365/blp';
import { getRootDir } from './lib/utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = getRootDir();

// Paths
// island-troll-tribes is a sibling of websites repo
const ISLAND_TROLL_TRIBES_DIR = path.join(ROOT_DIR, '..', '..', '..', 'island-troll-tribes');
const REPLACEABLE_TEXTURES_DIR = path.join(ISLAND_TROLL_TRIBES_DIR, 'imports', 'ReplaceableTextures');
const COMMAND_BUTTONS_DIR = path.join(REPLACEABLE_TEXTURES_DIR, 'CommandButtons');
const COMMAND_BUTTONS_DISABLED_DIR = path.join(REPLACEABLE_TEXTURES_DIR, 'CommandButtonsDisabled');
const ITT_ICONS_DIR = path.join(ROOT_DIR, 'public', 'icons', 'itt');

// Missing icons to convert (target PNG name -> source BLP name)
const MISSING_ICONS = [
  { target: 'btnmammothboots.png', source: 'BTNMammothBoots.blp', dir: 'CommandButtons' },
  { target: 'disbtnfeedpet.png', source: 'DISBTNFeedPet.blp', dir: 'CommandButtons' },
  // Note: btncripple.png doesn't seem to exist in the game files
];

async function convertBlpToPng(blpPath, pngPath) {
  try {
    // Read BLP file
    const blpData = fs.readFileSync(blpPath);
    
    // Decode BLP
    const decoded = decodeBlpData(blpData);
    
    // Encode to PNG (auto format detection)
    const png = await encodeToPNGAuto(decoded);
    
    // Write PNG file
    fs.writeFileSync(pngPath, png);
    
    return true;
  } catch (error) {
    console.error(`  ❌ Error converting ${path.basename(blpPath)}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔄 Converting BLP files to PNG...\n');
  
  // Check directories
  if (!fs.existsSync(COMMAND_BUTTONS_DIR)) {
    console.error(`❌ CommandButtons directory not found: ${COMMAND_BUTTONS_DIR}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(ITT_ICONS_DIR)) {
    console.error(`❌ ITT icons directory not found: ${ITT_ICONS_DIR}`);
    process.exit(1);
  }
  
  let converted = 0;
  let skipped = 0;
  let notFound = 0;
  
  console.log('📋 Processing missing icons...\n');
  
  for (const icon of MISSING_ICONS) {
    const sourceDir = icon.dir === 'CommandButtons' 
      ? COMMAND_BUTTONS_DIR 
      : COMMAND_BUTTONS_DISABLED_DIR;
    const sourcePath = path.join(sourceDir, icon.source);
    const destPath = path.join(ITT_ICONS_DIR, icon.target);
    
    // Check if already exists
    if (fs.existsSync(destPath)) {
      console.log(`⏭️  Skipped: ${icon.target} (already exists)`);
      skipped++;
      continue;
    }
    
    // Check if source exists
    if (!fs.existsSync(sourcePath)) {
      console.log(`❌ Not found: ${icon.source}`);
      notFound++;
      continue;
    }
    
    // Convert
    console.log(`🔄 Converting: ${icon.source} -> ${icon.target}`);
    const success = await convertBlpToPng(sourcePath, destPath);
    
    if (success) {
      console.log(`  ✅ Converted successfully`);
      converted++;
    } else {
      notFound++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`  ✅ Converted: ${converted}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  ❌ Not found/Failed: ${notFound}`);
  console.log('='.repeat(50));
  
  if (converted > 0) {
    console.log(`\n✅ Successfully converted ${converted} icons!`);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

