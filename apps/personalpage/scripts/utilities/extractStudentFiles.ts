#!/usr/bin/env node

/**
 * Extract individual student files from a master collection JSON
 * Usage: npx tsx scripts/extractStudentFiles.ts <master-file.json>
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log("📦 Student Data File Extractor\n");
  console.log("=".repeat(60));

  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("❌ Error: No master file specified");
    console.log("\nUsage: npx tsx scripts/extractStudentFiles.ts <master-file.json>");
    process.exit(1);
  }

  const masterFilePath = resolve(args[0]);
  const dataDir = path.join(
    process.cwd(),
    "src/features/modules/edtech/progressReport/student-data/data"
  );

  console.log(`📂 Master file: ${masterFilePath}`);
  console.log(`📁 Output directory: ${dataDir}`);
  console.log("=".repeat(60));
  console.log();

  try {
    // Read master file
    const content = await fs.readFile(masterFilePath, "utf-8");
    const data = JSON.parse(content);

    const students = data.students || [];

    if (students.length === 0) {
      console.error("❌ No students found in master file");
      process.exit(1);
    }

    console.log(`📊 Found ${students.length} students\n`);
    console.log("⏳ Extracting individual files...\n");

    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true });

    // Extract each student to individual file
    for (const student of students) {
      const filename = `${student.first_name}_${student.last_name}.json`;
      const filePath = path.join(dataDir, filename);

      await fs.writeFile(filePath, JSON.stringify(student, null, 2), "utf-8");
      console.log(`  ✓ ${filename}`);
    }

    console.log();
    console.log("=".repeat(60));
    console.log("✅ Extraction completed successfully!");
    console.log("=".repeat(60));
    console.log();
    console.log(`📄 Files created: ${students.length}`);
    console.log(`📁 Location: ${dataDir}`);
    console.log();

    process.exit(0);
  } catch (error: any) {
    console.error();
    console.error("=".repeat(60));
    console.error("❌ EXTRACTION FAILED");
    console.error("=".repeat(60));
    console.error();
    console.error(error.message || error);
    console.error();
    process.exit(1);
  }
}

main();
