#!/usr/bin/env node

/**
 * Migrate student data from v3 to v4 schema
 *
 * Major changes:
 * - Update academic year from 2024-2025 to 2025-2026
 * - Set enrolled_date to null (data not available yet)
 * - Rename assessment type "participation" to "board_solving"
 * - Create new "test" type for SD columns (separate from "summative")
 * - Rename "summative_details" to "evaluation_details" (unified for tests and summatives)
 * - Add optional assessment_id and assessment_title fields for cross-class assessment tracking
 * - Update schema version to 4.0
 *
 * Usage: npx tsx scripts/migrateToV4.ts [input-file] [output-file]
 * Example: npx tsx scripts/migrateToV4.ts master_student_data_v3_final.json master_student_data_v4.json
 */

import fs from "fs/promises";
import path from "path";

interface AssessmentV3 {
  date: string;
  column: string;
  type: string;
  task_name: string;
  score: string;
  comment: string;
  added: string;
  updated?: string;
  summative_details?: {
    percentage_score: number;
    myp_score: number;
    cambridge_score: number;
  };
}

interface AssessmentV4 {
  date: string;
  column: string;
  type: string;
  task_name: string;
  score: string;
  comment: string;
  added: string;
  updated?: string;
  evaluation_details?: {
    percentage_score: number;
    myp_score: number;
    cambridge_score: number;
  };
  assessment_id?: string | null;
  assessment_title?: string | null;
}

interface StudentV3 {
  id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  academic: {
    year: string;
    grade: number;
    class_id: string;
    enrolled_date: string;
  };
  assessments: AssessmentV3[];
  [key: string]: any;
}

interface StudentV4 extends Omit<StudentV3, "assessments" | "academic"> {
  academic: {
    year: string;
    grade: number;
    class_id: string;
    enrolled_date: null;
  };
  assessments: AssessmentV4[];
}

interface DataFileV3 {
  metadata: {
    exported_at: string;
    schema_version: string;
    total_students: number;
    export_version: string;
  };
  students: StudentV3[];
}

interface DataFileV4 {
  metadata: {
    exported_at: string;
    schema_version: string;
    total_students: number;
    export_version: string;
  };
  students: StudentV4[];
}

/**
 * Migrate a single assessment from v3 to v4
 */
function migrateAssessment(assessment: AssessmentV3): AssessmentV4 {
  const v4Assessment: AssessmentV4 = {
    date: assessment.date,
    column: assessment.column,
    type: assessment.type,
    task_name: assessment.task_name,
    score: assessment.score,
    comment: assessment.comment,
    added: assessment.added,
    updated: assessment.updated,
    assessment_id: null,
    assessment_title: null,
  };

  // 1. Rename "participation" to "board_solving"
  if (v4Assessment.type === "participation") {
    v4Assessment.type = "board_solving";
  }

  // 2. Convert SD columns from "summative" to "test" type
  if (v4Assessment.column.match(/^SD\d+$/) && v4Assessment.type === "summative") {
    v4Assessment.type = "test";
  }

  // 3. Rename "summative_details" to "evaluation_details"
  if (assessment.summative_details) {
    v4Assessment.evaluation_details = {
      percentage_score: assessment.summative_details.percentage_score,
      myp_score: assessment.summative_details.myp_score,
      cambridge_score: assessment.summative_details.cambridge_score,
    };
  }

  return v4Assessment;
}

/**
 * Migrate a single student from v3 to v4
 */
function migrateStudent(student: StudentV3): StudentV4 {
  const v4Student: StudentV4 = {
    ...student,
    academic: {
      year: "2025-2026", // Updated academic year
      grade: student.academic.grade,
      class_id: student.academic.class_id,
      enrolled_date: null, // Set to null - data not available yet
    },
    assessments: student.assessments.map(migrateAssessment),
  };

  return v4Student;
}

/**
 * Main migration function
 */
async function migrate() {
  console.log("📦 Student Data Migration v3 → v4\n");
  console.log("=".repeat(70));

  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const inputFile = args[0] || "master_student_data_v3_final.json";
    const outputFile = args[1] || "master_student_data_v4.json";

    const inputPath = path.join(process.cwd(), inputFile);
    const outputPath = path.join(process.cwd(), outputFile);

    console.log(`\n📂 Input file:  ${inputFile}`);
    console.log(`📂 Output file: ${outputFile}\n`);

    // Read input file
    console.log("📖 Reading input file...");
    const content = await fs.readFile(inputPath, "utf-8");
    const v3Data: DataFileV3 = JSON.parse(content);

    console.log(`✅ Found ${v3Data.students.length} students`);
    console.log(`   Schema version: ${v3Data.metadata.schema_version}`);

    // Validate input
    if (v3Data.metadata.schema_version !== "3.0") {
      console.warn(
        `⚠️  Warning: Expected schema version 3.0, got ${v3Data.metadata.schema_version}`
      );
    }

    // Create backup
    const backupPath = inputPath.replace(
      ".json",
      `_backup_${new Date().toISOString().split("T")[0]}.json`
    );
    console.log(`\n💾 Creating backup: ${path.basename(backupPath)}`);
    await fs.copyFile(inputPath, backupPath);

    // Migrate students
    console.log("\n🔄 Migrating students...\n");

    const v4Students: StudentV4[] = [];
    let participationRenamed = 0;
    let sdConverted = 0;
    let detailsRenamed = 0;

    for (const student of v3Data.students) {
      const v4Student = migrateStudent(student);
      v4Students.push(v4Student);

      // Track changes
      student.assessments.forEach((a, i) => {
        if (a.type === "participation") participationRenamed++;
        if (a.column.match(/^SD\d+$/) && a.type === "summative") sdConverted++;
        if (a.summative_details) detailsRenamed++;
      });
    }

    // Build v4 data file
    const v4Data: DataFileV4 = {
      metadata: {
        exported_at: new Date().toISOString(),
        schema_version: "4.0",
        total_students: v4Students.length,
        export_version: "v4.0",
      },
      students: v4Students,
    };

    // Write output file
    console.log("💾 Writing migrated data...");
    await fs.writeFile(outputPath, JSON.stringify(v4Data, null, 2), "utf-8");

    // Calculate sizes
    const inputSize = content.length;
    const outputSize = JSON.stringify(v4Data, null, 2).length;

    // Summary
    console.log("\n" + "=".repeat(70));
    console.log("✅ Migration Complete!\n");
    console.log(`📊 Statistics:`);
    console.log(`   Students migrated: ${v4Students.length}`);
    console.log(
      `   Total assessments: ${v4Students.reduce((sum, s) => sum + s.assessments.length, 0)}`
    );
    console.log(`\n📝 Changes made:`);
    console.log(`   "participation" → "board_solving": ${participationRenamed} assessments`);
    console.log(`   SD columns "summative" → "test": ${sdConverted} assessments`);
    console.log(`   "summative_details" → "evaluation_details": ${detailsRenamed} assessments`);
    console.log(`   Academic year updated: ${v4Students.length} students (2024-2025 → 2025-2026)`);
    console.log(`   enrolled_date set to null: ${v4Students.length} students`);
    console.log(`\n📦 File sizes:`);
    console.log(`   Input:  ${(inputSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Output: ${(outputSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`\n📁 Files:`);
    console.log(`   Backup: ${path.basename(backupPath)}`);
    console.log(`   Output: ${path.basename(outputPath)}`);
    console.log("\n" + "=".repeat(70));
    console.log("\n✨ Next steps:");
    console.log("   1. Review the output file");
    console.log("   2. Populate assessment_id and assessment_title fields");
    console.log("   3. Update TypeScript types to match v4 schema");
    console.log("   4. Test with progress report dashboard\n");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

migrate();
