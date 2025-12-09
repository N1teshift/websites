/**
 * Centralized filesystem paths for the data generation pipeline.
 * Having a single source of truth keeps all scripts in sync and prevents
 * accidental reads from disallowed directories (like data/island_troll_tribes).
 */

import fs from 'fs';
import path from 'path';
import { getRootDir } from './utils.mjs';

export const ROOT_DIR = getRootDir();

// Load .env.local if it exists (for local development)
// Next.js automatically loads .env.local, but standalone scripts need manual loading
const envLocalPath = path.join(ROOT_DIR, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        // Only set if not already set (env vars take precedence)
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

// -----------------------------------------------------------------------------
// Source inputs (configurable via environment variables)
// -----------------------------------------------------------------------------

// WORK_DIR: Directory containing war3map files (w3t, w3a, w3u, w3b, j)
// Default: external/Work (relative to ROOT_DIR)
// Can be overridden with WAR3MAP_DIR environment variable
export const WORK_DIR = process.env.WAR3MAP_DIR 
  ? path.resolve(process.env.WAR3MAP_DIR)
  : path.join(ROOT_DIR, 'external', 'Work');

// WURST_SOURCE_DIR: Root directory of WURST source files
// Default: island-troll-tribes/wurst (relative to ROOT_DIR)
// Can be overridden with WURST_SOURCE_DIR environment variable
// Expected structure: wurst/objects/abilities, wurst/objects/units, etc.
export const WURST_SOURCE_DIR = process.env.WURST_SOURCE_DIR
  ? path.resolve(process.env.WURST_SOURCE_DIR)
  : path.join(ROOT_DIR, 'island-troll-tribes', 'wurst');

// -----------------------------------------------------------------------------
// Temporary working directories (generated during each pipeline run)
// -----------------------------------------------------------------------------

export const TMP_ROOT = path.join(ROOT_DIR, 'tmp', 'work-data');
export const TMP_RAW_DIR = path.join(TMP_ROOT, 'raw');          // Output from extract-from-w3x
export const TMP_METADATA_DIR = path.join(TMP_ROOT, 'metadata'); // Output from extract-metadata

/**
 * Ensure the temporary working directories exist.
 */
export function ensureTmpDirs() {
  [TMP_ROOT, TMP_RAW_DIR, TMP_METADATA_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Remove a directory (if it exists) and recreate it as empty.
 */
export function resetDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
  fs.mkdirSync(dirPath, { recursive: true });
}

// -----------------------------------------------------------------------------
// Generated TypeScript data targets
// -----------------------------------------------------------------------------

export const DATA_TS_DIR = path.join(ROOT_DIR, 'src', 'features', 'modules', 'content', 'guides', 'data');
export const ITEMS_TS_DIR = path.join(DATA_TS_DIR, 'items');
export const ABILITIES_TS_DIR = path.join(DATA_TS_DIR, 'abilities');
export const UNITS_TS_DIR = path.join(DATA_TS_DIR, 'units');


