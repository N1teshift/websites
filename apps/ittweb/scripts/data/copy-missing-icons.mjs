/**
 * Copy missing icons from @unused folder to itt folder with lowercase names
 * 
 * This script finds icons in @unused that match missing icons (case-insensitive)
 * and copies them to the itt folder with lowercase filenames.
 * 
 * Usage: node scripts/data/copy-missing-icons.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRootDir } from './lib/utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = getRootDir();

const UNUSED_DIR = path.join(ROOT_DIR, 'public', 'icons', '@unused');
const ITT_DIR = path.join(ROOT_DIR, 'public', 'icons', 'itt');

// List of missing icons (from terminal output)
const MISSING_ICONS = [
  'btncheese.png',
  'btnetherealformon.png',
  'pasbtnseagiantpulverize.png',
  'btnentrapmentward.png',
  'btnpenguin.png',
  'btnsacrificialpit.png',
  'btngoldmine.png',
  'btnhydrawarstomp.png',
  'btnroot.png',
  'btnspellsteal.png',
  'btnadvancedstrengthofthemoon.png',
  'btncrate.png',
  'btnrockgolem.png',
  'btnrocktower.png',
  'btnorbofcorruption.png',
  'btnwyvernrider.png',
  'btnfaeriefire.png',
  'btnundeadunload.png',
  'btnskink.png',
  'btnnagaunburrow.png',
  'btnmeatapult.png',
  'btnhawkswoop.png',
  'btnhowlofterror.png',
  'btnancestralspirit.png',
  'btnpurge.png',
  'btnfirerocks.png',
  'btnfrostbolt.png',
  'btnsensedreams.png',
  'btndevourmagic.png',
  'btncripple.png',
  'btnportal.png',
  'btnincinerateon.png',
  'dispasbtnimmolation.png',
  'btnundeadload.png',
  'btncorrosivebreath.png',
  'btnreddragondevour.png',
  'btnenchantedbears.png',
  'btnreinforcedhides.png',
  'btnstrengthofthewild.png',
  'btnforceofnature.png',
  'btncorpsedrop1.png',
  'btnload.png',
  'btnpolymorph.png',
  'btnfeedback.png',
  'btnmammothboots.png',
  'btngreaterinvisibility.png',
  'btnhornofdoom.png',
  'btnseagiantwarstomp.png',
  'disbtnfeedpet.png',
  'btnjunglebeast.png',
  'btnaltarofdepths.png',
  'btnrazormanechief.png',
  'btnlocustswarm.png',
  'btnbronzedragon.png',
  'btnnetherdragon.png',
  'btnreddragon.png',
  'btngreendragon.png'
];

/**
 * Find matching file in @unused directory (case-insensitive)
 */
function findMatchingFile(targetName, unusedFiles) {
  const targetLower = targetName.toLowerCase();
  return unusedFiles.find(file => file.toLowerCase() === targetLower);
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Copying missing icons from @unused to itt folder...\n');

  // Check directories exist
  if (!fs.existsSync(UNUSED_DIR)) {
    console.error(`❌ @unused directory not found: ${UNUSED_DIR}`);
    process.exit(1);
  }

  if (!fs.existsSync(ITT_DIR)) {
    console.error(`❌ itt directory not found: ${ITT_DIR}`);
    process.exit(1);
  }

  // Get all files from @unused
  const unusedFiles = fs.readdirSync(UNUSED_DIR).filter(f => f.toLowerCase().endsWith('.png'));
  console.log(`📁 Found ${unusedFiles.length} files in @unused folder\n`);

  // Get existing files in itt (to avoid overwriting)
  const existingFiles = new Set(
    fs.readdirSync(ITT_DIR)
      .filter(f => f.toLowerCase().endsWith('.png'))
      .map(f => f.toLowerCase())
  );

  let copied = 0;
  let skipped = 0;
  let notFound = 0;

  console.log('📋 Processing missing icons...\n');

  for (const missingIcon of MISSING_ICONS) {
    const targetLower = missingIcon.toLowerCase();
    
    // Check if already exists in itt
    if (existingFiles.has(targetLower)) {
      console.log(`⏭️  Skipped: ${missingIcon} (already exists)`);
      skipped++;
      continue;
    }

    // Find matching file in @unused
    const matchingFile = findMatchingFile(missingIcon, unusedFiles);
    
    if (matchingFile) {
      const sourcePath = path.join(UNUSED_DIR, matchingFile);
      const destPath = path.join(ITT_DIR, targetLower);
      
      // Copy file
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Copied: ${matchingFile} -> ${targetLower}`);
      copied++;
    } else {
      console.log(`❌ Not found: ${missingIcon}`);
      notFound++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`  ✅ Copied: ${copied}`);
  console.log(`  ⏭️  Skipped (already exists): ${skipped}`);
  console.log(`  ❌ Not found: ${notFound}`);
  console.log('='.repeat(50));
  
  if (copied > 0) {
    console.log(`\n✅ Successfully copied ${copied} icons to itt folder!`);
  }
}

main();













