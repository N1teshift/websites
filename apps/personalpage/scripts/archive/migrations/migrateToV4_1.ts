#!/usr/bin/env node

/**
 * Migrate student data from v4.0 to v4.1 schema
 *
 * Changes:
 * 1. Rename homework columns for consistency:
 *    - ND4 (Sept 26) → ND3
 *    - PA (Oct 3) → ND4 (and change type to homework_reflection)
 *    - ND1 (Oct 10, weekly_assessment) → ND5 (and change type to homework)
 *    - ND (Oct 24) → ND6
 * 2. Rename LNT1 (Sept 19) → LNT0
 * 3. Add new assessment type: homework_reflection
 * 4. Populate assessment_id and assessment_title for all assessments
 * 5. Mark experimental data (EXT1-3 Sept, EXT2 Oct 9)
 *
 * Usage: npx tsx scripts/migrateToV4_1.ts [input-file] [output-file]
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
  evaluation_details?: {
    percentage_score: number;
    myp_score: number;
    cambridge_score: number;
  };
  assessment_id?: string | null;
  assessment_title?: string | null;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  assessments: Assessment[];
  [key: string]: any;
}

interface DataFile {
  metadata: {
    exported_at: string;
    schema_version: string;
    total_students: number;
    export_version: string;
  };
  students: Student[];
}

/**
 * Assessment template mapping based on column, date, and type
 */
function getAssessmentTemplate(assessment: Assessment): { id: string; title: string } {
  const { column, date, type } = assessment;
  const dateObj = new Date(date);

  // HOMEWORK
  if (type === "homework") {
    if (column === "ND1" && date === "2025-09-01") {
      return { id: "homework-nd1", title: "Homework ND1" };
    }
    if (column === "ND2" && date === "2025-09-12") {
      return { id: "homework-nd2", title: "Homework ND2" };
    }
    if (column === "ND3" && date === "2025-09-26") {
      return { id: "homework-nd3", title: "Homework ND3" };
    }
    if (column === "ND5" && date === "2025-10-10") {
      return { id: "homework-nd5", title: "Homework ND5" };
    }
    if (column === "ND6" && date === "2025-10-24") {
      return { id: "homework-nd6", title: "Homework ND6" };
    }
  }

  // HOMEWORK REFLECTION
  if (type === "homework_reflection") {
    if (column === "ND5" && date === "2025-10-03") {
      return { id: "homework-reflection-nd5", title: "Mathematical Skills Reflection - ND5" };
    }
    // Legacy ND4 support (should be migrated to ND5)
    if (column === "ND4" && date === "2025-10-03") {
      return { id: "homework-reflection-nd4", title: "Mathematical Skills Reflection - ND4" };
    }
  }

  // SUMMATIVE
  if (type === "summative") {
    if (column === "KD1" && date === "2025-09-16") {
      return { id: "summative-cambridge-unit1", title: "Cambridge Unit 1 Summative" };
    }
    if (column === "KD" && (date === "2025-10-09" || date === "2025-10-10")) {
      return { id: "summative-cambridge-unit2", title: "Cambridge Unit 2 Summative" };
    }
  }

  // TESTS
  if (type === "test") {
    if (column === "SD1" && date === "2025-10-21") {
      return { id: "test-u1s1-irrational-numbers", title: "Unit 1.1 Test - Irrational Numbers" };
    }
    if (column === "SD2" && date === "2025-10-22") {
      return { id: "test-u1s2-standard-form", title: "Unit 1.2 Test - Standard Form" };
    }
    if (column === "SD3" && date === "2025-10-23") {
      return { id: "test-u1s3-indices", title: "Unit 1.3 Test - Indices" };
    }
  }

  // CLASSWORK
  if (type === "classwork") {
    // Experimental data - September
    if (
      (column === "EXT1" || column === "EXT2" || column === "EXT3") &&
      date >= "2025-09-12" &&
      date <= "2025-09-25"
    ) {
      return { id: "classwork-experimental-sept", title: "Experimental Classwork Data" };
    }
    // Experimental data - October 9
    if (column === "EXT2" && date === "2025-10-09") {
      return { id: "classwork-experimental-oct9", title: "Experimental Classwork Data" };
    }
    // Board notes check
    if (column === "EXT1" && date === "2025-10-06") {
      return {
        id: "classwork-notes-check-oct6",
        title: "Board Notes Check - Monomials & Polynomials",
      };
    }
    // Exercise progress tracking
    if (
      (column === "EXT1" ||
        column === "EXT2" ||
        column === "EXT3" ||
        column === "EXT4" ||
        column === "EXT5") &&
      date >= "2025-10-20" &&
      date <= "2025-10-24"
    ) {
      return { id: "exercise-progress-oct20-24", title: "Exercise Progress Tracking" };
    }
  }

  // WEEKLY ASSESSMENT
  if (type === "weekly_assessment") {
    if (column === "EXT2" && date === "2025-10-09") {
      return { id: "classwork-experimental-oct9", title: "Experimental Classwork Data" };
    }
    if ((column === "EXT" || column === "EXT1" || column === "EXT2") && date === "2025-10-06") {
      return { id: "exercise-progress-weekly", title: "Exercise Progress - Weekly Check" };
    }
    if (column === "ND1" && date === "2025-10-10") {
      // This should have been converted to homework type already
      return { id: "homework-nd5", title: "Homework ND5" };
    }
  }

  // BOARD SOLVING
  if (type === "board_solving") {
    if (column === "LNT" && date === "2025-10-24") {
      return { id: "board-solving-cumulative", title: "Board Solving - Cumulative Score" };
    }
    if (column.startsWith("LNT")) {
      return { id: "board-solving-sessions", title: "Board Solving Session" };
    }
  }

  // DIAGNOSTIC
  if (type === "diagnostic") {
    if (column === "Diag1" && date === "2025-09-05") {
      return { id: "diagnostic-1", title: "Diagnostic Assessment 1" };
    }
    if (column === "Diag2" && date === "2025-09-08") {
      return { id: "diagnostic-2", title: "Diagnostic Assessment 2" };
    }
  }

  // WEEKLY COMMENT
  if (type === "weekly_comment") {
    if (column === "ND1 K" && date === "2025-10-10") {
      return { id: "homework-nd5-comment", title: "Homework ND5 - Teacher Comment" };
    }
  }

  // Default fallback
  return { id: `${type}-${column.toLowerCase()}-${date}`, title: `${column} - ${type}` };
}

/**
 * Migrate a single assessment
 */
function migrateAssessment(assessment: Assessment): Assessment {
  const migrated = { ...assessment };

  // 1. Rename columns
  if (migrated.column === "ND4" && migrated.date === "2025-09-26") {
    migrated.column = "ND3";
  }
  if (migrated.column === "PA" && migrated.date === "2025-10-03") {
    migrated.column = "ND4";
    migrated.type = "homework_reflection";
  }
  if (
    migrated.column === "ND1" &&
    migrated.date === "2025-10-10" &&
    migrated.type === "weekly_assessment"
  ) {
    migrated.column = "ND5";
    migrated.type = "homework";
  }
  if (migrated.column === "ND" && migrated.date === "2025-10-24") {
    migrated.column = "ND6";
  }
  if (migrated.column === "LNT1" && migrated.date === "2025-09-19") {
    migrated.column = "LNT0";
  }

  // 2. Assign assessment template
  const template = getAssessmentTemplate(migrated);
  migrated.assessment_id = template.id;
  migrated.assessment_title = template.title;

  return migrated;
}

/**
 * Migrate a single student
 */
function migrateStudent(student: Student): Student {
  return {
    ...student,
    assessments: student.assessments.map(migrateAssessment),
  };
}

/**
 * Main migration function
 */
async function migrate() {
  console.log("📦 Student Data Migration v4.0 → v4.1\n");
  console.log("=".repeat(70));

  try {
    const args = process.argv.slice(2);
    const inputFile = args[0] || "master_student_data_v4.json";
    const outputFile = args[1] || "master_student_data_v4_1.json";

    const inputPath = path.join(process.cwd(), inputFile);
    const outputPath = path.join(process.cwd(), outputFile);

    console.log(`\n📂 Input file:  ${inputFile}`);
    console.log(`📂 Output file: ${outputFile}\n`);

    // Read input file
    console.log("📖 Reading input file...");
    const content = await fs.readFile(inputPath, "utf-8");
    const v4Data: DataFile = JSON.parse(content);

    console.log(`✅ Found ${v4Data.students.length} students`);
    console.log(`   Schema version: ${v4Data.metadata.schema_version}`);

    // Create backup
    const backupPath = inputPath.replace(
      ".json",
      `_backup_${new Date().toISOString().split("T")[0]}.json`
    );
    console.log(`\n💾 Creating backup: ${path.basename(backupPath)}`);
    await fs.copyFile(inputPath, backupPath);

    // Track changes
    let columnRenames = 0;
    let typeChanges = 0;
    let templatesAssigned = 0;

    // Migrate students
    console.log("\n🔄 Migrating students...\n");
    const v4_1Students = v4Data.students.map((student) => {
      const original = student.assessments.length;
      const migrated = migrateStudent(student);

      // Count changes
      student.assessments.forEach((orig, i) => {
        const mig = migrated.assessments[i];
        if (orig.column !== mig.column) columnRenames++;
        if (orig.type !== mig.type) typeChanges++;
        if (mig.assessment_id) templatesAssigned++;
      });

      return migrated;
    });

    // Build v4.1 data file
    const v4_1Data: DataFile = {
      metadata: {
        exported_at: new Date().toISOString(),
        schema_version: "4.1",
        total_students: v4_1Students.length,
        export_version: "v4.1",
      },
      students: v4_1Students,
    };

    // Write output file
    console.log("💾 Writing migrated data...");
    await fs.writeFile(outputPath, JSON.stringify(v4_1Data, null, 2), "utf-8");

    // Calculate sizes
    const inputSize = content.length;
    const outputSize = JSON.stringify(v4_1Data, null, 2).length;

    // Summary
    console.log("\n" + "=".repeat(70));
    console.log("✅ Migration Complete!\n");
    console.log(`📊 Statistics:`);
    console.log(`   Students migrated: ${v4_1Students.length}`);
    console.log(
      `   Total assessments: ${v4_1Students.reduce((sum, s) => sum + s.assessments.length, 0)}`
    );
    console.log(`\n📝 Changes made:`);
    console.log(`   Column renames: ${columnRenames} assessments`);
    console.log(`     - ND4 → ND3 (Sept 26)`);
    console.log(`     - PA → ND4 (Oct 3, now homework_reflection)`);
    console.log(`     - ND1 → ND5 (Oct 10, now homework)`);
    console.log(`     - ND → ND6 (Oct 24)`);
    console.log(`     - LNT1 → LNT0 (Sept 19)`);
    console.log(`   Type changes: ${typeChanges} assessments`);
    console.log(`   Assessment templates assigned: ${templatesAssigned} assessments`);
    console.log(`\n📦 File sizes:`);
    console.log(`   Input:  ${(inputSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Output: ${(outputSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`\n📁 Files:`);
    console.log(`   Backup: ${path.basename(backupPath)}`);
    console.log(`   Output: ${path.basename(outputPath)}`);
    console.log("\n" + "=".repeat(70));
    console.log("\n✨ Schema v4.1 changes:");
    console.log("   ✅ Homework columns renumbered (ND3-ND6)");
    console.log("   ✅ New type: homework_reflection");
    console.log("   ✅ Assessment templates populated");
    console.log("   ✅ Experimental data marked\n");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

migrate();
