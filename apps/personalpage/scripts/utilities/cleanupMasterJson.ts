#!/usr/bin/env node

/**
 * Clean up and convert master JSON file to pure v4 format
 *
 * This script takes a master JSON (like progress_report_data_2025-11-03_v5.json)
 * that may have mixed v3/v4 data and converts ALL students to v4 format.
 *
 * Usage: npx tsx scripts/cleanupMasterJson.ts [input-file] [output-file]
 * Example: npx tsx scripts/cleanupMasterJson.ts progress_report_data_2025-11-03_v5.json progress_report_data_v4_clean.json
 */

import fs from "fs/promises";
import path from "path";

interface Assessment {
  date: string;
  column: string;
  type: string;
  task_name: string;
  score: string;
  comment: string;
  added: string;
  updated?: string;
  summative_details?: {
    percentage_score?: number;
    myp_score?: number;
    cambridge_score?: number;
  };
  evaluation_details?: {
    percentage_score?: number | null;
    myp_score?: number | null;
    cambridge_score?: number | null;
  };
  assessment_id?: string | null;
  assessment_title?: string | null;
}

interface Student {
  id?: string;
  first_name: string;
  last_name: string;
  class_name: string;
  academic?: {
    year: string;
    grade: number;
    class_id: string;
    enrolled_date: string | null;
  };
  assessments?: Assessment[];
  [key: string]: any;
}

interface MasterData {
  metadata?: {
    exported_at?: string;
    schema_version?: string;
    total_students?: number;
    export_version?: string;
    teacher_type?: string;
    teacher_name?: string;
  };
  students: Student[];
}

/**
 * Generate assessment_id based on column and type
 */
function generateAssessmentId(column: string, type: string): string | null {
  const col = column.toLowerCase();

  if (type === "homework") {
    return `homework-${col}`;
  } else if (type === "classwork") {
    return `classwork-${col}`;
  } else if (type === "diagnostic") {
    return `diagnostic-${col.replace("diag", "")}`;
  } else if (type === "board_solving") {
    return `board-solving-${col}`;
  } else if (type === "consultation") {
    return `consultation-${col}`;
  } else if (type === "summative") {
    return `summative-${col}`;
  } else if (type === "test") {
    return `test-${col}`;
  }

  return null;
}

/**
 * Generate assessment_title based on column and task name
 */
function generateAssessmentTitle(column: string, taskName: string): string {
  if (taskName && taskName !== column && taskName.length > 2) {
    return taskName;
  }

  const col = column.toUpperCase();

  if (col.startsWith("ND")) {
    return `Homework ${col}`;
  } else if (col.startsWith("EXT")) {
    return `Classwork ${col}`;
  } else if (col.startsWith("DIAG")) {
    return `Diagnostic Assessment ${col.replace("DIAG", "")}`;
  } else if (col.startsWith("LNT")) {
    return `Board Solving ${col}`;
  } else if (col.startsWith("KONS")) {
    return `Consultation ${col}`;
  } else if (col.startsWith("KD")) {
    return `Summative ${col}`;
  } else if (col.startsWith("SD")) {
    return `Test ${col.replace("SD", "")}`;
  }

  return column;
}

/**
 * Convert a single assessment to v4 format
 */
function convertAssessmentToV4(assessment: Assessment): Assessment {
  let type = assessment.type;

  // 1. Rename "participation" to "board_solving"
  if (type === "participation") {
    type = "board_solving";
  }

  // 2. Convert SD columns from "summative" to "test"
  if (assessment.column.match(/^SD\d+$/i) && type === "summative") {
    type = "test";
  }

  const v4Assessment: Assessment = {
    ...assessment,
    type: type,
  };

  // 3. Convert summative_details to evaluation_details
  if (assessment.summative_details && !assessment.evaluation_details) {
    v4Assessment.evaluation_details = {
      percentage_score: assessment.summative_details.percentage_score ?? null,
      myp_score: assessment.summative_details.myp_score ?? null,
      cambridge_score: assessment.summative_details.cambridge_score ?? null,
    };
    delete v4Assessment.summative_details;
  }

  // 4. Ensure evaluation_details has proper null values (not undefined)
  if (v4Assessment.evaluation_details) {
    v4Assessment.evaluation_details = {
      percentage_score: v4Assessment.evaluation_details.percentage_score ?? null,
      myp_score: v4Assessment.evaluation_details.myp_score ?? null,
      cambridge_score: v4Assessment.evaluation_details.cambridge_score ?? null,
    };
  }

  // 5. Add assessment_id if missing
  if (!v4Assessment.assessment_id) {
    v4Assessment.assessment_id = generateAssessmentId(assessment.column, type);
  }

  // 6. Add assessment_title if missing
  if (!v4Assessment.assessment_title) {
    v4Assessment.assessment_title = generateAssessmentTitle(
      assessment.column,
      assessment.task_name
    );
  }

  return v4Assessment;
}

/**
 * Convert a single student to v4 format
 */
function convertStudentToV4(student: Student): Student {
  const v4Student: Student = {
    ...student,
  };

  // Update academic info
  if (v4Student.academic) {
    v4Student.academic = {
      ...v4Student.academic,
      year: "2025-2026",
      enrolled_date: null,
    };
  }

  // Convert all assessments
  if (v4Student.assessments && Array.isArray(v4Student.assessments)) {
    v4Student.assessments = v4Student.assessments.map(convertAssessmentToV4);
  }

  return v4Student;
}

/**
 * Main cleanup function
 */
async function cleanup() {
  console.log("🧹 Master JSON Cleanup - v3 → v4\n");
  console.log("=".repeat(70));

  try {
    // Parse command line arguments
    const args = process.argv.slice(2);

    if (args.length < 1) {
      console.error("\n❌ Error: Please provide input file name");
      console.log("\nUsage: npx tsx scripts/cleanupMasterJson.ts [input-file] [output-file]");
      console.log(
        "Example: npx tsx scripts/cleanupMasterJson.ts progress_report_data_2025-11-03_v5.json progress_report_data_v4_clean.json\n"
      );
      process.exit(1);
    }

    const inputFile = args[0];
    const outputFile = args[1] || inputFile.replace(".json", "_v4_clean.json");

    const inputPath = path.join(process.cwd(), inputFile);
    const outputPath = path.join(process.cwd(), outputFile);

    console.log(`\n📂 Input file:  ${inputFile}`);
    console.log(`📂 Output file: ${outputFile}\n`);

    // Read input file
    console.log("📖 Reading input file...");
    const content = await fs.readFile(inputPath, "utf-8");
    const data: MasterData = JSON.parse(content);

    console.log(`✅ Found ${data.students.length} students`);
    if (data.metadata?.schema_version) {
      console.log(`   Current schema version: ${data.metadata.schema_version}`);
    }

    // Create backup
    const backupPath = inputPath.replace(
      ".json",
      `_backup_${new Date().toISOString().split("T")[0]}.json`
    );
    console.log(`\n💾 Creating backup: ${path.basename(backupPath)}`);
    await fs.copyFile(inputPath, backupPath);

    // Analyze current state
    console.log("\n🔍 Analyzing current data...\n");

    let v3Count = 0;
    let v4Count = 0;
    let mixedCount = 0;
    let participationCount = 0;
    let sdSummativeCount = 0;
    let summativeDetailsCount = 0;
    let missingIdsCount = 0;

    for (const student of data.students) {
      if (!student.assessments) continue;

      let hasV3 = false;
      let hasV4 = false;

      for (const assessment of student.assessments) {
        // Check for v3 indicators
        if (assessment.type === "participation") {
          participationCount++;
          hasV3 = true;
        }
        if (assessment.column.match(/^SD\d+$/i) && assessment.type === "summative") {
          sdSummativeCount++;
          hasV3 = true;
        }
        if (assessment.summative_details) {
          summativeDetailsCount++;
          hasV3 = true;
        }
        if (!assessment.assessment_id) {
          missingIdsCount++;
          hasV3 = true;
        }

        // Check for v4 indicators
        if (assessment.type === "board_solving" || assessment.type === "test") {
          hasV4 = true;
        }
        if (assessment.evaluation_details) {
          hasV4 = true;
        }
      }

      if (hasV3 && hasV4) mixedCount++;
      else if (hasV3) v3Count++;
      else if (hasV4) v4Count++;
    }

    console.log(`Analysis Results:`);
    console.log(`  Pure v3 students: ${v3Count}`);
    console.log(`  Pure v4 students: ${v4Count}`);
    console.log(`  Mixed v3/v4 students: ${mixedCount}`);
    console.log(`\nIssues Found:`);
    console.log(`  "participation" type: ${participationCount} assessments`);
    console.log(`  SD "summative" type: ${sdSummativeCount} assessments`);
    console.log(`  "summative_details" field: ${summativeDetailsCount} assessments`);
    console.log(`  Missing assessment_id: ${missingIdsCount} assessments`);

    // Convert all students
    console.log("\n🔄 Converting all students to v4...\n");

    const v4Students = data.students.map(convertStudentToV4);

    // Update metadata
    const v4Data: MasterData = {
      metadata: {
        exported_at: new Date().toISOString(),
        schema_version: "4.0",
        total_students: v4Students.length,
        export_version: "v4.0",
        teacher_type: data.metadata?.teacher_type || "main",
        teacher_name: data.metadata?.teacher_name || "Main Teacher (Math)",
      },
      students: v4Students,
    };

    // Write output file
    console.log("💾 Writing cleaned data...");
    await fs.writeFile(outputPath, JSON.stringify(v4Data, null, 2), "utf-8");

    // Calculate sizes
    const inputSize = content.length;
    const outputSize = JSON.stringify(v4Data, null, 2).length;

    // Final verification
    let finalCheck = {
      participation: 0,
      sdSummative: 0,
      summativeDetails: 0,
      missingIds: 0,
      boardSolving: 0,
      test: 0,
      evaluationDetails: 0,
      hasIds: 0,
    };

    for (const student of v4Students) {
      if (!student.assessments) continue;

      for (const assessment of student.assessments) {
        if (assessment.type === "participation") finalCheck.participation++;
        if (assessment.column.match(/^SD\d+$/i) && assessment.type === "summative")
          finalCheck.sdSummative++;
        if ((assessment as any).summative_details) finalCheck.summativeDetails++;
        if (!assessment.assessment_id) finalCheck.missingIds++;

        if (assessment.type === "board_solving") finalCheck.boardSolving++;
        if (assessment.type === "test") finalCheck.test++;
        if (assessment.evaluation_details) finalCheck.evaluationDetails++;
        if (assessment.assessment_id) finalCheck.hasIds++;
      }
    }

    // Summary
    console.log("\n" + "=".repeat(70));
    console.log("✅ Cleanup Complete!\n");
    console.log(`📊 Final Statistics:`);
    console.log(`   Students processed: ${v4Students.length}`);
    console.log(
      `   Total assessments: ${v4Students.reduce((sum, s) => sum + (s.assessments?.length || 0), 0)}`
    );
    console.log(`\n✓ Verification (should all be 0):`);
    console.log(`   "participation" remaining: ${finalCheck.participation}`);
    console.log(`   SD "summative" remaining: ${finalCheck.sdSummative}`);
    console.log(`   "summative_details" remaining: ${finalCheck.summativeDetails}`);
    console.log(`   Missing assessment_id: ${finalCheck.missingIds}`);
    console.log(`\n✓ V4 Indicators (should be > 0):`);
    console.log(`   "board_solving" type: ${finalCheck.boardSolving}`);
    console.log(`   "test" type: ${finalCheck.test}`);
    console.log(`   "evaluation_details": ${finalCheck.evaluationDetails}`);
    console.log(`   Has assessment_id: ${finalCheck.hasIds}`);
    console.log(`\n📦 File sizes:`);
    console.log(`   Input:  ${(inputSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Output: ${(outputSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`\n📁 Files:`);
    console.log(`   Backup: ${path.basename(backupPath)}`);
    console.log(`   Output: ${path.basename(outputPath)}`);
    console.log("\n" + "=".repeat(70));
    console.log("\n✨ Next steps:");
    console.log("   1. Review the output file");
    console.log("   2. Upload to Progress Report Dashboard (Data Management → Upload Data)");
    console.log("   3. Verify dashboard displays correctly");
    console.log("   4. Import new Excel data if needed\n");

    if (
      finalCheck.participation > 0 ||
      finalCheck.sdSummative > 0 ||
      finalCheck.summativeDetails > 0 ||
      finalCheck.missingIds > 0
    ) {
      console.log("⚠️  WARNING: Some v3 data remains. Please review the output file.\n");
    } else {
      console.log("🎉 Perfect! All data successfully converted to v4 format!\n");
    }
  } catch (error) {
    console.error("\n❌ Cleanup failed:", error);
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

cleanup();
