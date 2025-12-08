#!/usr/bin/env node

/**
 * Assessment Analyzer Tool - Comprehensive Assessment Data Analysis
 *
 * Combines functionality from:
 * - analyzeAssessmentData.ts
 * - analyzeAssessmentDataDeep.ts
 *
 * Features:
 * - Assessment statistics by type
 * - Score distribution analysis
 * - Missing data detection
 * - Student completion rates
 * - Column analysis
 * - Deep dive mode for detailed inspection
 *
 * Usage:
 *   npx tsx scripts/tools/analyzeAssessments.ts <file> [options]
 *
 * Options:
 *   --mode=summary    Quick statistics (default)
 *   --mode=detailed   Detailed breakdown by type
 *   --mode=deep       Deep analysis with student-level data
 *   --type=<type>     Filter by assessment type
 *   --class=<name>    Filter by class name
 *   --missing         Show only missing/incomplete assessments
 */

import * as fs from "fs";
import { resolve } from "path";

interface Assessment {
  date: string;
  column: string;
  type: string;
  task_name: string;
  score: string;
  comment?: string;
  evaluation_details?: {
    percentage_score?: number | null;
    myp_score?: number | null;
    cambridge_score?: number | null;
  };
  assessment_id?: string | null;
  assessment_title?: string | null;
}

interface StudentData {
  id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  assessments: Assessment[];
}

interface MasterData {
  metadata: any;
  students: StudentData[];
}

type AnalyzeMode = "summary" | "detailed" | "deep";

interface AnalyzeOptions {
  mode: AnalyzeMode;
  filterType?: string;
  filterClass?: string;
  showMissingOnly: boolean;
}

const DEFAULT_OPTIONS: AnalyzeOptions = {
  mode: "summary",
  showMissingOnly: false,
};

class AssessmentAnalyzer {
  private data!: MasterData;
  private options: AnalyzeOptions;

  constructor(options: Partial<AnalyzeOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async analyze(filePath: string): Promise<void> {
    console.log("=".repeat(80));
    console.log(`📊 Assessment Analyzer - ${this.options.mode.toUpperCase()} mode`);
    console.log("=".repeat(80));
    console.log(`File: ${filePath}\n`);

    try {
      const content = fs.readFileSync(filePath, "utf-8");
      this.data = JSON.parse(content);

      console.log(`Students: ${this.data.students.length}`);
      console.log(`Schema: ${this.data.metadata?.schema_version || "unknown"}\n`);

      // Filter if needed
      let students = this.data.students;
      if (this.options.filterClass) {
        students = students.filter((s) => s.class_name === this.options.filterClass);
        console.log(
          `Filtered to class: ${this.options.filterClass} (${students.length} students)\n`
        );
      }

      // Run analysis based on mode
      if (this.options.mode === "summary") {
        this.summarize(students);
      } else if (this.options.mode === "detailed") {
        this.detailedAnalysis(students);
      } else if (this.options.mode === "deep") {
        this.deepAnalysis(students);
      }

      console.log("=".repeat(80));
      console.log("✅ Analysis complete\n");
    } catch (error) {
      console.error("❌ Error reading data file:", error);
      process.exit(1);
    }
  }

  private summarize(students: StudentData[]): void {
    console.log("📋 SUMMARY STATISTICS:\n");

    const allAssessments = students.flatMap((s) => s.assessments || []);
    const totalAssessments = allAssessments.length;

    console.log(`Total assessments: ${totalAssessments}\n`);

    // By type
    const byType = this.groupBy(allAssessments, "type");
    console.log("By Type:");
    for (const [type, assessments] of Object.entries(byType).sort(
      (a, b) => b[1].length - a[1].length
    )) {
      console.log(`  ${type.padEnd(20)} ${assessments.length.toString().padStart(6)}`);
    }

    // By column pattern
    console.log("\nBy Column Pattern:");
    const patterns = {
      "EXT (Classwork)": allAssessments.filter((a) => a.column?.match(/^EXT\d+/i)).length,
      "ND (Homework)": allAssessments.filter((a) => a.column?.match(/^ND\d+/i)).length,
      "SD (Tests)": allAssessments.filter((a) => a.column?.match(/^SD\d+/i)).length,
      "LNT (Board Solving)": allAssessments.filter((a) => a.column?.match(/^LNT\d+/i)).length,
      "KD (Summatives)": allAssessments.filter((a) => a.column?.match(/^KD\d+/i)).length,
      "D (Diagnostics)": allAssessments.filter((a) => a.column?.match(/^D\d+/i)).length,
    };

    for (const [pattern, count] of Object.entries(patterns)) {
      if (count > 0) {
        console.log(`  ${pattern.padEnd(20)} ${count.toString().padStart(6)}`);
      }
    }

    // Score statistics
    console.log("\n📊 SCORE STATISTICS:\n");

    const withScores = allAssessments.filter((a) => a.score && a.score !== "" && a.score !== "n");
    const numericScores = withScores.map((a) => parseFloat(a.score)).filter((s) => !isNaN(s));

    console.log(`Assessments with scores: ${withScores.length} / ${totalAssessments}`);
    console.log(`Empty or 'n' scores: ${totalAssessments - withScores.length}`);

    if (numericScores.length > 0) {
      const avg = numericScores.reduce((a, b) => a + b, 0) / numericScores.length;
      const min = Math.min(...numericScores);
      const max = Math.max(...numericScores);

      console.log(`\nNumeric score range: ${min.toFixed(2)} - ${max.toFixed(2)}`);
      console.log(`Average score: ${avg.toFixed(2)}`);
    }

    // Missing data
    console.log("\n⚠️  MISSING/INCOMPLETE DATA:\n");

    const missingAssessmentId = allAssessments.filter((a) => !a.assessment_id).length;
    const missingTitle = allAssessments.filter((a) => !a.assessment_title).length;

    console.log(`Missing assessment_id: ${missingAssessmentId}`);
    console.log(`Missing assessment_title: ${missingTitle}`);
  }

  private detailedAnalysis(students: StudentData[]): void {
    console.log("📊 DETAILED ANALYSIS BY TYPE:\n");

    const allAssessments = students.flatMap((s) => s.assessments || []);
    const byType = this.groupBy(allAssessments, "type");

    for (const [type, assessments] of Object.entries(byType).sort(
      (a, b) => b[1].length - a[1].length
    )) {
      if (this.options.filterType && type !== this.options.filterType) {
        continue;
      }

      console.log("─".repeat(80));
      console.log(`📁 ${type.toUpperCase()} (${assessments.length} assessments)`);
      console.log("─".repeat(80));

      // Unique columns
      const columns = Array.from(new Set(assessments.map((a) => a.column))).sort();
      console.log(`\nColumns (${columns.length}): ${columns.join(", ")}`);

      // Score distribution
      const withScores = assessments.filter((a) => a.score && a.score !== "" && a.score !== "n");
      const numericScores = withScores.map((a) => parseFloat(a.score)).filter((s) => !isNaN(s));

      if (numericScores.length > 0) {
        const avg = numericScores.reduce((a, b) => a + b, 0) / numericScores.length;
        console.log(
          `\nScore stats: Avg ${avg.toFixed(2)}, Range ${Math.min(...numericScores).toFixed(2)}-${Math.max(...numericScores).toFixed(2)}`
        );
      }

      console.log(`Empty scores: ${assessments.length - withScores.length}`);

      // Evaluation details (for tests/summatives)
      if (type === "test" || type === "summative") {
        const withDetails = assessments.filter((a) => a.evaluation_details);
        console.log(`\nWith evaluation_details: ${withDetails.length} / ${assessments.length}`);

        if (withDetails.length > 0) {
          const withPercentage = withDetails.filter(
            (a) => a.evaluation_details?.percentage_score != null
          ).length;
          const withMyp = withDetails.filter((a) => a.evaluation_details?.myp_score != null).length;
          const withCambridge = withDetails.filter(
            (a) => a.evaluation_details?.cambridge_score != null
          ).length;

          console.log(`  - percentage_score: ${withPercentage}`);
          console.log(`  - myp_score: ${withMyp}`);
          console.log(`  - cambridge_score: ${withCambridge}`);
        }
      }

      console.log();
    }
  }

  private deepAnalysis(students: StudentData[]): void {
    console.log("🔬 DEEP ANALYSIS - Student Level:\n");

    // Student completion rates
    const completionData = students
      .map((student) => {
        const assessments = student.assessments || [];
        const withScores = assessments.filter(
          (a) => a.score && a.score !== "" && a.score !== "n"
        ).length;
        const total = assessments.length;
        const rate = total > 0 ? (withScores / total) * 100 : 0;

        return {
          name: `${student.first_name} ${student.last_name}`,
          class: student.class_name,
          total,
          completed: withScores,
          rate,
        };
      })
      .sort((a, b) => a.rate - b.rate);

    if (this.options.showMissingOnly) {
      console.log("⚠️  Students with missing/incomplete assessments:\n");

      const incomplete = completionData.filter((s) => s.rate < 100);

      for (const student of incomplete) {
        console.log(`${student.name.padEnd(30)} (${student.class})`);
        console.log(
          `  Completed: ${student.completed}/${student.total} (${student.rate.toFixed(1)}%)\n`
        );
      }

      console.log(`Total students with incomplete data: ${incomplete.length} / ${students.length}`);
    } else {
      console.log("Completion rates by student:\n");

      // Show top 10 and bottom 10
      console.log("🏆 Top 10 (Highest completion):");
      completionData
        .slice(-10)
        .reverse()
        .forEach((s, i) => {
          console.log(
            `  ${(i + 1).toString().padStart(2)}. ${s.name.padEnd(30)} ${s.completed}/${s.total} (${s.rate.toFixed(1)}%)`
          );
        });

      console.log("\n⚠️  Bottom 10 (Needs attention):");
      completionData.slice(0, 10).forEach((s, i) => {
        console.log(
          `  ${(i + 1).toString().padStart(2)}. ${s.name.padEnd(30)} ${s.completed}/${s.total} (${s.rate.toFixed(1)}%)`
        );
      });

      // Overall stats
      const avgRate = completionData.reduce((sum, s) => sum + s.rate, 0) / completionData.length;
      console.log(`\nOverall average completion: ${avgRate.toFixed(1)}%`);
    }

    // Column coverage analysis
    console.log("\n\n📋 COLUMN COVERAGE:\n");

    const allColumns = new Set<string>();
    students.forEach((s) => {
      (s.assessments || []).forEach((a) => allColumns.add(a.column));
    });

    const sortedColumns = Array.from(allColumns).sort();
    console.log(`Total unique columns: ${sortedColumns.length}`);

    for (const column of sortedColumns) {
      const studentsWithColumn = students.filter((s) =>
        (s.assessments || []).some((a) => a.column === column)
      ).length;

      const coverage = (studentsWithColumn / students.length) * 100;
      const indicator = coverage === 100 ? "✓" : coverage >= 90 ? "~" : "⚠";

      console.log(
        `  ${indicator} ${column.padEnd(15)} ${studentsWithColumn}/${students.length} (${coverage.toFixed(1)}%)`
      );
    }
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce(
      (result, item) => {
        const group = String(item[key] || "unknown");
        if (!result[group]) result[group] = [];
        result[group].push(item);
        return result;
      },
      {} as Record<string, T[]>
    );
  }
}

// CLI Entry Point
function parseArgs(): { filePath: string; options: Partial<AnalyzeOptions> } {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
Assessment Analyzer Tool

Usage:
  npx tsx scripts/tools/analyzeAssessments.ts <file> [options]

Options:
  --mode=summary      Quick statistics (default)
  --mode=detailed     Detailed breakdown by type
  --mode=deep         Deep analysis with student-level data
  --type=<type>       Filter by assessment type
  --class=<name>      Filter by class name
  --missing           Show only missing/incomplete assessments
  --help, -h          Show this help

Examples:
  npx tsx scripts/tools/analyzeAssessments.ts data.json
  npx tsx scripts/tools/analyzeAssessments.ts data.json --mode=detailed
  npx tsx scripts/tools/analyzeAssessments.ts data.json --mode=deep --missing
  npx tsx scripts/tools/analyzeAssessments.ts data.json --type=homework --class="8 Vydūnas"
        `);
    process.exit(0);
  }

  const filePath = resolve(args[0]);
  const options: Partial<AnalyzeOptions> = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--mode=")) {
      options.mode = arg.split("=")[1] as AnalyzeMode;
    } else if (arg.startsWith("--type=")) {
      options.filterType = arg.split("=")[1];
    } else if (arg.startsWith("--class=")) {
      options.filterClass = arg.split("=")[1];
    } else if (arg === "--missing") {
      options.showMissingOnly = true;
    }
  }

  return { filePath, options };
}

// Main execution
async function main() {
  try {
    const { filePath, options } = parseArgs();
    const analyzer = new AssessmentAnalyzer(options);
    await analyzer.analyze(filePath);
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

main();
