#!/usr/bin/env node

/**
 * Data Validation Tool - Validate and fix student data
 *
 * Enhanced version of:
 * - validateAndFixDatabase.ts
 *
 * Features:
 * - V5 schema validation
 * - Multiple validation levels (quick, standard, deep)
 * - Auto-fix mode
 * - Dry-run mode (report only)
 * - Report generation
 * - Backup creation
 *
 * Usage:
 *   npx tsx scripts/tools/validate.ts <file> [options]
 *
 * Options:
 *   --level=quick       Validation level: quick, standard, deep (default: standard)
 *   --fix               Auto-fix issues (default: false)
 *   --dry-run           Report only, don't save changes (default: true)
 *   --report=<file>     Save report to file
 *   --no-backup         Skip backup creation
 *   --help, -h          Show this help
 */

import * as fs from "fs";
import * as path from "path";

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

type ValidationLevel = "quick" | "standard" | "deep";

interface ValidateOptions {
  level: ValidationLevel;
  autoFix: boolean;
  dryRun: boolean;
  reportFile?: string;
  createBackup: boolean;
}

class DataValidator {
  private issues: ValidationIssue[] = [];
  private fixesApplied = 0;
  private options: ValidateOptions;

  constructor(options: ValidateOptions) {
    this.options = options;
  }

  validateAndFix(data: MasterData): MasterData {
    console.log(`🔍 Running ${this.options.level} validation...\n`);

    for (const student of data.students) {
      this.validateStudent(student);
    }

    this.reportIssues();

    if (this.options.reportFile) {
      this.saveReport();
    }

    return data;
  }

  private validateStudent(student: StudentData): void {
    const studentName = `${student.first_name} ${student.last_name}`;

    // Quick checks
    if (!student.id) {
      this.addIssue("error", "missing_id", studentName, undefined, "Student missing ID", false);
    }

    if (!student.assessments || student.assessments.length === 0) {
      this.addIssue(
        "warning",
        "no_assessments",
        studentName,
        undefined,
        "Student has no assessments",
        false
      );
      return;
    }

    // Validate each assessment
    for (let i = 0; i < student.assessments.length; i++) {
      const assessment = student.assessments[i];

      if (this.options.level === "quick") {
        this.quickValidation(student, assessment, i);
      } else if (this.options.level === "standard") {
        this.standardValidation(student, assessment, i);
      } else if (this.options.level === "deep") {
        this.deepValidation(student, assessment, i);
      }
    }
  }

  private quickValidation(student: StudentData, assessment: Assessment, index: number): void {
    const studentName = `${student.first_name} ${student.last_name}`;
    const assessmentLabel = `${assessment.column} (${assessment.date})`;

    // Only check critical fields
    if (!assessment.assessment_id) {
      this.addIssue(
        "error",
        "missing_field",
        studentName,
        assessmentLabel,
        "Missing assessment_id",
        true
      );

      if (this.options.autoFix && !this.options.dryRun) {
        assessment.assessment_id = this.generateAssessmentId(assessment.column);
        this.fixesApplied++;
      }
    }
  }

  private standardValidation(student: StudentData, assessment: Assessment, index: number): void {
    const studentName = `${student.first_name} ${student.last_name}`;
    const assessmentLabel = `${assessment.column} (${assessment.date})`;

    // All quick checks plus more
    this.quickValidation(student, assessment, index);

    // Check assessment_title
    if (!assessment.assessment_title) {
      this.addIssue(
        "warning",
        "missing_field",
        studentName,
        assessmentLabel,
        "Missing assessment_title",
        true
      );

      if (this.options.autoFix && !this.options.dryRun) {
        assessment.assessment_title = this.generateAssessmentTitle(assessment.column);
        this.fixesApplied++;
      }
    }

    // Check for old ND format
    const isHomework = ["homework", "homework_reflection"].includes(assessment.type);
    const isOldND = ["ND1", "ND2", "ND3", "ND4", "ND5"].includes(assessment.column);
    const isBinaryScore = assessment.score === "0" || assessment.score === "1";
    const missingOnTime = assessment.on_time === undefined || assessment.on_time === null;

    if (isHomework && isOldND && isBinaryScore && missingOnTime) {
      this.addIssue(
        "warning",
        "old_format",
        studentName,
        assessmentLabel,
        "Old ND format: binary score should be in on_time field",
        true
      );

      if (this.options.autoFix && !this.options.dryRun) {
        const onTimeValue = parseInt(assessment.score);
        assessment.on_time = onTimeValue;
        assessment.completed_on_time = onTimeValue;
        assessment.score = "";
        this.fixesApplied++;
      }
    }
  }

  private deepValidation(student: StudentData, assessment: Assessment, index: number): void {
    const studentName = `${student.first_name} ${student.last_name}`;
    const assessmentLabel = `${assessment.column} (${assessment.date})`;

    // All standard checks plus deep checks
    this.standardValidation(student, assessment, index);

    // Check context field
    if (assessment.context === undefined) {
      if (this.options.autoFix && !this.options.dryRun) {
        assessment.context = "";
        this.fixesApplied++;
      }
    }

    // Check task_name convention
    if (assessment.assessment_id && !this.taskNameMatchesConvention(assessment)) {
      this.addIssue(
        "info",
        "naming_convention",
        studentName,
        assessmentLabel,
        `task_name "${assessment.task_name}" doesn't match convention`,
        true
      );

      if (this.options.autoFix && !this.options.dryRun) {
        assessment.task_name = this.generateTaskName(assessment.column, assessment.type);
        this.fixesApplied++;
      }
    }

    // Check evaluation_details for tests/summatives
    if (["test", "summative"].includes(assessment.type)) {
      if (!assessment.evaluation_details) {
        this.addIssue(
          "info",
          "missing_details",
          studentName,
          assessmentLabel,
          "Missing evaluation_details for test/summative",
          false
        );
      }
    }
  }

  private generateAssessmentId(column: string): string {
    if (column.match(/^[A-Z]+\d+$/i)) {
      return column.toLowerCase();
    }
    return column.toLowerCase().replace(/[^a-z0-9]/g, "-");
  }

  private generateAssessmentTitle(column: string): string {
    if (column.match(/^(EXT|ND|SD|LNT|KD|D)\d+$/i)) {
      return column.toUpperCase();
    }
    return column;
  }

  private generateTaskName(column: string, type: string): string {
    const match = column.match(/^([A-Z]+)(\d+)$/);
    if (!match) return column;

    const [, prefix, num] = match;

    const names: Record<string, string> = {
      EXT: "Exercise Progress",
      ND: "Homework",
      SD: "Test",
      LNT: "Board Participation",
      KD: `Cambridge Unit ${num}`,
      D: "Diagnostic",
    };

    return `${prefix}${num}: ${names[prefix] || type}`;
  }

  private taskNameMatchesConvention(assessment: Assessment): boolean {
    const column = assessment.column;
    const taskName = assessment.task_name;

    if (column.match(/^EXT\d+$/i) && !taskName.startsWith("EXT")) return false;
    if (column.match(/^ND\d+$/i) && !taskName.startsWith("ND")) return false;
    if (column.match(/^SD\d+$/i) && !taskName.startsWith("SD")) return false;
    if (column.match(/^LNT\d+$/i) && !taskName.startsWith("LNT")) return false;
    if (column.match(/^KD\d+$/i) && !taskName.startsWith("KD")) return false;
    if (column.match(/^D\d+$/i) && !taskName.startsWith("D")) return false;

    return true;
  }

  private addIssue(
    severity: "error" | "warning" | "info",
    category: string,
    student: string,
    assessment: string | undefined,
    issue: string,
    canAutoFix: boolean
  ): void {
    this.issues.push({
      severity,
      category,
      student,
      assessment,
      issue,
      canAutoFix,
    });
  }

  private reportIssues(): void {
    console.log("\n📊 Validation Report:\n");

    const errors = this.issues.filter((i) => i.severity === "error");
    const warnings = this.issues.filter((i) => i.severity === "warning");
    const infos = this.issues.filter((i) => i.severity === "info");

    console.log(`❌ Errors: ${errors.length}`);
    console.log(`⚠️  Warnings: ${warnings.length}`);
    console.log(`ℹ️  Info: ${infos.length}`);

    if (this.options.autoFix && !this.options.dryRun) {
      console.log(`✅ Fixes applied: ${this.fixesApplied}`);
    } else if (this.options.dryRun) {
      const fixable = this.issues.filter((i) => i.canAutoFix).length;
      console.log(`🔧 Fixable issues: ${fixable}`);
    }
    console.log();

    // Show summary by category
    const categories = new Map<string, number>();
    this.issues.forEach((issue) => {
      categories.set(issue.category, (categories.get(issue.category) || 0) + 1);
    });

    if (categories.size > 0) {
      console.log("Issues by category:");
      for (const [category, count] of Array.from(categories.entries()).sort(
        (a, b) => b[1] - a[1]
      )) {
        console.log(`  - ${category}: ${count}`);
      }
      console.log();
    }

    // Show sample errors
    if (errors.length > 0 && errors.length <= 10) {
      console.log("❌ Errors:");
      errors.forEach((issue) => {
        console.log(`  ${issue.student} - ${issue.assessment || "general"}: ${issue.issue}`);
      });
      console.log();
    } else if (errors.length > 10) {
      console.log("❌ First 10 errors:");
      errors.slice(0, 10).forEach((issue) => {
        console.log(`  ${issue.student} - ${issue.assessment || "general"}: ${issue.issue}`);
      });
      console.log(`  ... and ${errors.length - 10} more\n`);
    }
  }

  private saveReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      level: this.options.level,
      autoFix: this.options.autoFix,
      dryRun: this.options.dryRun,
      summary: {
        totalIssues: this.issues.length,
        errors: this.issues.filter((i) => i.severity === "error").length,
        warnings: this.issues.filter((i) => i.severity === "warning").length,
        info: this.issues.filter((i) => i.severity === "info").length,
        fixesApplied: this.fixesApplied,
      },
      issues: this.issues,
    };

    fs.writeFileSync(this.options.reportFile!, JSON.stringify(report, null, 2), "utf-8");
    console.log(`📄 Report saved: ${this.options.reportFile}\n`);
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
Data Validation Tool

Usage:
  npx tsx scripts/tools/validate.ts <file> [options]

Options:
  --level=quick       Validation level: quick, standard, deep (default: standard)
  --fix               Auto-fix issues (default: false)
  --dry-run           Report only, don't save changes (default: true)
  --report=<file>     Save detailed report to file
  --no-backup         Skip backup creation
  --help, -h          Show this help

Validation Levels:
  quick       - Check only critical fields (assessment_id)
  standard    - Check all important fields and formats (default)
  deep        - Comprehensive validation including conventions

Examples:
  # Quick validation (dry-run)
  npx tsx scripts/tools/validate.ts data.json

  # Standard validation with auto-fix
  npx tsx scripts/tools/validate.ts data.json --fix --no-dry-run

  # Deep validation with report
  npx tsx scripts/tools/validate.ts data.json --level=deep --report=validation_report.json

  # Auto-fix with backup
  npx tsx scripts/tools/validate.ts data.json --fix --no-dry-run
        `);
    process.exit(0);
  }

  const inputFile = path.resolve(args[0]);

  const options: ValidateOptions = {
    level: "standard",
    autoFix: false,
    dryRun: true,
    createBackup: true,
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--level=")) {
      options.level = arg.split("=")[1] as ValidationLevel;
    } else if (arg === "--fix") {
      options.autoFix = true;
    } else if (arg === "--no-dry-run") {
      options.dryRun = false;
    } else if (arg.startsWith("--report=")) {
      options.reportFile = path.resolve(arg.split("=")[1]);
    } else if (arg === "--no-backup") {
      options.createBackup = false;
    }
  }

  console.log("=".repeat(80));
  console.log("📋 Data Validation Tool");
  console.log("=".repeat(80));
  console.log(`File: ${inputFile}`);
  console.log(`Level: ${options.level}`);
  console.log(
    `Mode: ${options.dryRun ? "Dry-run (no changes)" : options.autoFix ? "Auto-fix" : "Report only"}\n`
  );

  try {
    // Load data
    const content = fs.readFileSync(inputFile, "utf-8");
    const data: MasterData = JSON.parse(content);

    console.log(`Students: ${data.students.length}`);
    console.log(`Schema: ${data.metadata?.schema_version || "unknown"}\n`);

    // Create backup if needed
    if (options.createBackup && !options.dryRun && options.autoFix) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const backupPath = inputFile.replace(".json", `_backup_${timestamp}.json`);
      fs.copyFileSync(inputFile, backupPath);
      console.log(`💾 Backup created: ${backupPath}\n`);
    }

    // Validate
    const validator = new DataValidator(options);
    const validatedData = validator.validateAndFix(data);

    // Save if not dry-run
    if (!options.dryRun && options.autoFix) {
      validatedData.metadata = {
        ...validatedData.metadata,
        validated_at: new Date().toISOString(),
        validation_level: options.level,
      };

      const outputPath = inputFile.replace(".json", "_validated.json");
      fs.writeFileSync(outputPath, JSON.stringify(validatedData, null, 2), "utf-8");
      console.log(`💾 Validated data saved: ${outputPath}\n`);
    }

    console.log("=".repeat(80));
    console.log("✅ Validation complete!\n");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
