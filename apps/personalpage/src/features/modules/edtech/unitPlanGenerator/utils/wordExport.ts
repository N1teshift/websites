/**
 * Main Word Export Entry Point
 * 
 * This file now uses a modular structure for better maintainability.
 * The actual implementation is in the wordExport/ directory with separate files for each section.
 * 
 * Structure:
 * - wordExport/index.ts - Main export function
 * - wordExport/sections/ - Individual table/section builders
 * - wordExport/styles/ - Color and font definitions
 * - wordExport/helpers/ - Reusable utility functions
 */

// Export the modular word export functionality
export { exportUnitPlanWithDocxtemplater as exportUnitPlanAsWord } from './wordExport/index';



