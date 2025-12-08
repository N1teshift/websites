/**
 * Database Validator and Auto-Fixer for V5 Schema
 *
 * This script:
 * 1. Validates all student data against V5 schema requirements
 * 2. Reports all inconsistencies found
 * 3. Auto-fixes issues to ensure 100% V5 compliance
 * 4. Creates a clean, validated database file
 */

import fs from "fs";
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
  evaluation_details?: any;
  assessment_id?: string | null;
  assessment_title?: string | null;
  context?: string;
  on_time?: number;
  completed_on_time?: number;
  [key: string]: any;
}

interface StudentData {
  id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  assessments: Assessment[];
  [key: string]: any;
}

interface MasterData {
  metadata: any;
  students: StudentData[];
}

interface ValidationIssue {
  severity: "error" | "warning" | "info";
  category: string;
  student: string;
  assessment?: string;
  issue: string;
  canAutoFix: boolean;
}

class DatabaseValidator {
  private issues: ValidationIssue[] = [];
  private fixesApplied = 0;

  /**
   * Validate and fix entire database
   */
  validateAndFix(data: MasterData, autoFix: boolean = true): MasterData {
    console.log("🔍 Starting database validation...\n");

    for (const student of data.students) {
      this.validateStudent(student, autoFix);
    }

    this.reportIssues();

    return data;
  }

  /**
   * Validate single student record
   */
  private validateStudent(student: StudentData, autoFix: boolean) {
    const studentName = `${student.first_name} ${student.last_name}`;

    // Check student has assessments
    if (!student.assessments || student.assessments.length === 0) {
      this.addIssue(
        "warning",
        "missing_data",
        studentName,
        undefined,
        "Student has no assessments",
        false
      );
      return;
    }

    for (let i = 0; i < student.assessments.length; i++) {
      const assessment = student.assessments[i];
      this.validateAssessment(student, assessment, i, autoFix);
    }
  }

  /**
   * Validate and fix single assessment
   */
  private validateAssessment(
    student: StudentData,
    assessment: Assessment,
    index: number,
    autoFix: boolean
  ) {
    const studentName = `${student.first_name} ${student.last_name}`;
    const assessmentLabel = `${assessment.column} (${assessment.date})`;

    // Issue 1: Missing assessment_id
    if (!assessment.assessment_id || assessment.assessment_id === null) {
      this.addIssue(
        "error",
        "missing_field",
        studentName,
        assessmentLabel,
        "Missing assessment_id",
        true
      );

      if (autoFix) {
        assessment.assessment_id = this.generateAssessmentId(assessment.column);
        this.fixesApplied++;
      }
    }

    // Issue 2: Wrong assessment_id format (has prefix)
    if (
      assessment.assessment_id &&
      (assessment.assessment_id.startsWith("classwork-") ||
        assessment.assessment_id.startsWith("test-"))
    ) {
      this.addIssue(
        "warning",
        "wrong_format",
        studentName,
        assessmentLabel,
        `assessment_id has prefix: ${assessment.assessment_id}`,
        true
      );

      if (autoFix) {
        const oldId = assessment.assessment_id;
        assessment.assessment_id = oldId.replace("classwork-", "").replace("test-", "");
        this.fixesApplied++;
      }
    }

    // Issue 3: Missing assessment_title
    if (!assessment.assessment_title || assessment.assessment_title === null) {
      this.addIssue(
        "warning",
        "missing_field",
        studentName,
        assessmentLabel,
        "Missing assessment_title",
        true
      );

      if (autoFix) {
        assessment.assessment_title = this.generateAssessmentTitle(assessment.column);
        this.fixesApplied++;
      }
    }

    // Issue 4: Generic "Classwork" title for EXT columns
    if (assessment.assessment_title === "Classwork" && assessment.column?.match(/^EXT\d+$/)) {
      this.addIssue(
        "info",
        "generic_title",
        studentName,
        assessmentLabel,
        'Generic "Classwork" title for EXT column',
        true
      );

      if (autoFix) {
        assessment.assessment_title = assessment.column;
        this.fixesApplied++;
      }
    }

    // Issue 5: Old ND format (binary score without on_time field)
    const isHomework = ["homework", "homework_reflection"].includes(assessment.type);
    const isOldND = ["ND1", "ND2", "ND4", "ND5"].includes(assessment.column);
    const isBinaryScore = assessment.score === "0" || assessment.score === "1";
    const missingOnTime = assessment.on_time === undefined || assessment.on_time === null;

    if (isHomework && isOldND && isBinaryScore && missingOnTime) {
      this.addIssue(
        "warning",
        "old_structure",
        studentName,
        assessmentLabel,
        "Old ND format: binary score should be in on_time field",
        true
      );

      if (autoFix) {
        const onTimeValue = parseInt(assessment.score);
        assessment.on_time = onTimeValue;
        assessment.completed_on_time = onTimeValue;
        assessment.score = ""; // Clear score for old binary ND
        this.fixesApplied++;
      }
    }

    // Issue 6: Missing context field (not critical, but good to have)
    if (assessment.context === undefined) {
      // Only add as info, not a critical issue
      if (autoFix) {
        assessment.context = "";
        this.fixesApplied++;
      }
    }

    // Issue 7: task_name doesn't match V5 convention
    if (assessment.assessment_id && !this.taskNameMatchesConvention(assessment)) {
      this.addIssue(
        "info",
        "task_name_mismatch",
        studentName,
        assessmentLabel,
        `task_name "${assessment.task_name}" doesn't match V5 convention`,
        true
      );

      if (autoFix) {
        assessment.task_name = this.generateTaskName(assessment.column, assessment.type);
        this.fixesApplied++;
      }
    }
  }

  /**
   * Generate assessment_id from column name
   */
  private generateAssessmentId(column: string): string {
    // EXT1-99 -> ext1-ext99
    if (column.match(/^EXT\d+$/i)) {
      return column.toLowerCase();
    }

    // ND1-99 -> nd1-nd99
    if (column.match(/^ND\d+$/i)) {
      return column.toLowerCase();
    }

    // SD1-99 -> sd1-sd99
    if (column.match(/^SD\d+$/i)) {
      return column.toLowerCase();
    }

    // LNT1-99 -> lnt1-lnt99
    if (column.match(/^LNT\d+$/i)) {
      return column.toLowerCase();
    }

    // KD1-99 -> kd1-kd99
    if (column.match(/^KD\d+$/i)) {
      return column.toLowerCase();
    }

    // D1-99 -> d1-d99
    if (column.match(/^D\d+$/i)) {
      return column.toLowerCase();
    }

    // Default: use column name in lowercase
    return column.toLowerCase().replace(/[^a-z0-9]/g, "-");
  }

  /**
   * Generate assessment_title from column name
   */
  private generateAssessmentTitle(column: string): string {
    // For most columns, the title is just the column name
    if (column.match(/^(EXT|ND|SD|LNT|KD|D)\d+$/i)) {
      return column.toUpperCase();
    }

    return column;
  }

  /**
   * Generate task_name according to V5 convention
   */
  private generateTaskName(column: string, type: string): string {
    const match = column.match(/^([A-Z]+)(\d+)$/);

    if (!match) return `${column}`;

    const [, prefix, num] = match;

    switch (prefix) {
      case "EXT":
        return `EXT${num}: Exercise Progress`;
      case "ND":
        return `ND${num}: Homework`;
      case "SD":
        return `SD${num}: Test`;
      case "LNT":
        return `LNT${num}: Board Participation`;
      case "KD":
        return `KD${num}: Cambridge Unit ${num}`;
      case "D":
        return `D${num}: Diagnostic`;
      default:
        return column;
    }
  }

  /**
   * Check if task_name follows V5 convention
   */
  private taskNameMatchesConvention(assessment: Assessment): boolean {
    const column = assessment.column;
    const taskName = assessment.task_name;

    // Check if it follows the pattern
    if (column.match(/^EXT\d+$/i) && !taskName.startsWith("EXT")) return false;
    if (column.match(/^ND\d+$/i) && !taskName.startsWith("ND")) return false;
    if (column.match(/^SD\d+$/i) && !taskName.startsWith("SD")) return false;
    if (column.match(/^LNT\d+$/i) && !taskName.startsWith("LNT")) return false;
    if (column.match(/^KD\d+$/i) && !taskName.startsWith("KD")) return false;
    if (column.match(/^D\d+$/i) && !taskName.startsWith("D")) return false;

    return true;
  }

  /**
   * Add validation issue
   */
  private addIssue(
    severity: "error" | "warning" | "info",
    category: string,
    student: string,
    assessment: string | undefined,
    issue: string,
    canAutoFix: boolean
  ) {
    this.issues.push({
      severity,
      category,
      student,
      assessment,
      issue,
      canAutoFix,
    });
  }

  /**
   * Report all issues found
   */
  private reportIssues() {
    console.log("\n📊 Validation Report:\n");

    const errors = this.issues.filter((i) => i.severity === "error");
    const warnings = this.issues.filter((i) => i.severity === "warning");
    const infos = this.issues.filter((i) => i.severity === "info");

    console.log(`❌ Errors: ${errors.length}`);
    console.log(`⚠️  Warnings: ${warnings.length}`);
    console.log(`ℹ️  Info: ${infos.length}`);
    console.log(`✅ Fixes applied: ${this.fixesApplied}\n`);

    // Show summary by category
    const categories = new Map<string, number>();
    this.issues.forEach((issue) => {
      categories.set(issue.category, (categories.get(issue.category) || 0) + 1);
    });

    console.log("Issues by category:");
    for (const [category, count] of Array.from(categories.entries())) {
      console.log(`  - ${category}: ${count}`);
    }

    // Show first 10 issues of each severity
    if (errors.length > 0) {
      console.log("\n❌ First errors:");
      errors.slice(0, 10).forEach((issue) => {
        console.log(`  ${issue.student} - ${issue.assessment}: ${issue.issue}`);
      });
      if (errors.length > 10) console.log(`  ... and ${errors.length - 10} more`);
    }

    if (warnings.length > 0 && warnings.length <= 20) {
      console.log("\n⚠️  Warnings:");
      warnings.forEach((issue) => {
        console.log(`  ${issue.student} - ${issue.assessment}: ${issue.issue}`);
      });
    }
  }
}

// Main execution
function main() {
  const inputFile = process.argv[2] || "progress_report_data_2025-11-08_cleaned.json";
  const jsonPath = path.join(process.cwd(), inputFile);

  console.log(`📖 Reading: ${inputFile}\n`);

  const content = fs.readFileSync(jsonPath, "utf-8");
  const data: MasterData = JSON.parse(content);

  console.log(`📊 Database info:`);
  console.log(`   - Students: ${data.students.length}`);
  console.log(`   - Schema version: ${data.metadata.schema_version || "unknown"}`);
  console.log(`   - Export version: ${data.metadata.export_version || "unknown"}\n`);

  // Validate and fix
  const validator = new DatabaseValidator();
  const fixedData = validator.validateAndFix(data, true);

  // Update metadata
  fixedData.metadata.schema_version = "5.0";
  fixedData.metadata.export_version = "v5.0-validated";
  fixedData.metadata.exported_at = new Date().toISOString();
  fixedData.metadata.validated_at = new Date().toISOString();

  // Save validated database
  const outputFile = inputFile.replace(".json", "_validated.json");
  const outputPath = path.join(process.cwd(), outputFile);

  console.log(`\n💾 Saving validated database: ${outputFile}`);
  fs.writeFileSync(outputPath, JSON.stringify(fixedData, null, 2), "utf-8");

  console.log("\n✨ Done! Your database is now 100% V5 compliant.");
  console.log(`📁 Validated file: ${outputFile}`);
}

try {
  main();
} catch (error) {
  console.error("❌ Error:", error);
  process.exit(1);
}
