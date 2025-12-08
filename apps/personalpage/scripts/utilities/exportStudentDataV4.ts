#!/usr/bin/env node

/**
 * Export all student data as a single master JSON file (v4 format)
 *
 * Usage: npx tsx scripts/exportStudentDataV4.ts <output-file-path>
 * Example: npx tsx scripts/exportStudentDataV4.ts master_student_data_v4.json
 */

import { StudentDataManagerV4 } from "../../src/features/modules/edtech/progressReport/student-data/utils/studentDataManagerV4";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log("📦 Student Data Exporter (v4)\n");
  console.log("=".repeat(60));

  // Get output file path from command line
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("❌ Error: No output file specified");
    console.log("\nUsage: npx tsx scripts/exportStudentDataV4.ts <output-file-path>");
    console.log("Example: npx tsx scripts/exportStudentDataV4.ts master_student_data_v4.json");
    process.exit(1);
  }

  const outputPath = resolve(args[0]);

  console.log(`📁 Output file: ${outputPath}`);
  console.log(`📁 Data directory: src/features/modules/edtech/progressReport/student-data/data/`);
  console.log("=".repeat(60));
  console.log();

  try {
    // Create manager instance
    const manager = new StudentDataManagerV4();

    // Export collection
    console.log("⏳ Exporting student data collection (v4 format)...\n");
    const count = await manager.exportToMasterFile(outputPath);

    // Display results
    console.log("=".repeat(60));
    console.log("✅ Export completed successfully!");
    console.log("=".repeat(60));
    console.log();
    console.log(`📄 Students exported: ${count}`);
    console.log(`📄 File saved: ${outputPath}`);
    console.log();

    process.exit(0);
  } catch (error: any) {
    console.error();
    console.error("=".repeat(60));
    console.error("❌ EXPORT FAILED");
    console.error("=".repeat(60));
    console.error();
    console.error(error.message || error);
    console.error();
    process.exit(1);
  }
}

main();
