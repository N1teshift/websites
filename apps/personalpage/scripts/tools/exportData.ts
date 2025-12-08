#!/usr/bin/env node

/**
 * Data Export Tool - Export student data to various formats
 *
 * Formalizes:
 * - exportStudentDataV4.ts
 * - exportStudentData.ts
 *
 * Features:
 * - Export to JSON (master file)
 * - Export to CSV
 * - Filter by class, student, date range
 * - Include/exclude specific fields
 * - Multiple output formats
 *
 * Usage:
 *   npx tsx scripts/tools/exportData.ts [options]
 *
 * Options:
 *   --input=<file>        Input JSON file (default: current data)
 *   --output=<file>       Output file (required)
 *   --format=json         Export format: json, csv (default: json)
 *   --class=<name>        Filter by class name
 *   --fields=<list>       Comma-separated list of fields to include
 *   --exclude=<list>      Comma-separated list of fields to exclude
 *   --pretty              Pretty-print JSON output (default: true)
 *   --help, -h            Show this help
 */

import * as fs from "fs/promises";
import { resolve } from "path";
import { Logger } from "../../src/features/infrastructure/logging";

interface ExportOptions {
  inputFile: string;
  outputFile: string;
  format: "json" | "csv";
  filterClass?: string;
  includeFields?: string[];
  excludeFields?: string[];
  prettyPrint: boolean;
}

interface StudentData {
  id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  assessments?: any[];
  [key: string]: any;
}

interface MasterData {
  metadata: any;
  students: StudentData[];
}

class DataExporter {
  private options: ExportOptions;
  private data!: MasterData;

  constructor(options: ExportOptions) {
    this.options = options;
  }

  async export(): Promise<void> {
    console.log("=".repeat(80));
    console.log(`📤 Data Export Tool - ${this.options.format.toUpperCase()} format`);
    console.log("=".repeat(80));
    console.log(`Input file:  ${this.options.inputFile}`);
    console.log(`Output file: ${this.options.outputFile}\n`);

    try {
      // Step 1: Load data
      await this.loadData();

      // Step 2: Filter
      this.filterData();

      // Step 3: Export
      if (this.options.format === "json") {
        await this.exportJSON();
      } else if (this.options.format === "csv") {
        await this.exportCSV();
      }

      console.log("\n=".repeat(80));
      console.log("✅ Export complete!\n");
    } catch (error) {
      console.error("\n❌ Export failed:", error);
      process.exit(1);
    }
  }

  private async loadData(): Promise<void> {
    console.log("📖 Loading data...\n");

    const content = await fs.readFile(this.options.inputFile, "utf-8");
    this.data = JSON.parse(content);

    Logger.info(`✓ Loaded ${this.data.students.length} students`);
    Logger.info(`✓ Schema: ${this.data.metadata?.schema_version || "unknown"}\n`);
  }

  private filterData(): void {
    let students = this.data.students;

    // Filter by class
    if (this.options.filterClass) {
      students = students.filter((s) => s.class_name === this.options.filterClass);
      Logger.info(`Filtered to class: ${this.options.filterClass} (${students.length} students)`);
    }

    // Filter fields
    if (this.options.includeFields || this.options.excludeFields) {
      students = students.map((student) => {
        const filtered: any = {};

        if (this.options.includeFields) {
          // Only include specified fields
          for (const field of this.options.includeFields) {
            if (field in student) {
              filtered[field] = student[field];
            }
          }
        } else {
          // Include all except excluded
          for (const [key, value] of Object.entries(student)) {
            if (!this.options.excludeFields?.includes(key)) {
              filtered[key] = value;
            }
          }
        }

        return filtered;
      });

      Logger.info(`Fields filtered`);
    }

    this.data.students = students;
    console.log();
  }

  private async exportJSON(): Promise<void> {
    console.log("📦 Exporting to JSON...\n");

    // Update export metadata
    this.data.metadata = {
      ...this.data.metadata,
      exported_at: new Date().toISOString(),
      export_version: this.data.metadata?.schema_version || "unknown",
      total_students: this.data.students.length,
    };

    const json = this.options.prettyPrint
      ? JSON.stringify(this.data, null, 2)
      : JSON.stringify(this.data);

    await fs.writeFile(this.options.outputFile, json, "utf-8");

    const sizeMB = (json.length / 1024 / 1024).toFixed(2);
    Logger.info(`✓ JSON exported: ${sizeMB} MB`);
    Logger.info(`✓ Students: ${this.data.students.length}`);
  }

  private async exportCSV(): Promise<void> {
    console.log("📊 Exporting to CSV...\n");

    const rows: string[][] = [];

    // Determine columns from first student
    if (this.data.students.length === 0) {
      throw new Error("No students to export");
    }

    const sampleStudent = this.data.students[0];
    const columns = Object.keys(sampleStudent).filter((key) => {
      // Exclude complex nested objects for CSV
      const value = sampleStudent[key];
      return typeof value !== "object" || value === null;
    });

    // Header row
    rows.push(columns);

    // Data rows
    for (const student of this.data.students) {
      const row = columns.map((col) => {
        const value = student[col];

        if (value === null || value === undefined) {
          return "";
        }

        // Escape CSV special characters
        const str = String(value);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }

        return str;
      });

      rows.push(row);
    }

    // Join into CSV
    const csv = rows.map((row) => row.join(",")).join("\n");
    await fs.writeFile(this.options.outputFile, csv, "utf-8");

    Logger.info(`✓ CSV exported: ${rows.length - 1} rows, ${columns.length} columns`);
  }
}

// CLI Entry Point
function parseArgs(): ExportOptions | null {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
Data Export Tool

Usage:
  npx tsx scripts/tools/exportData.ts [options]

Options:
  --input=<file>        Input JSON file (default: data_YYYY-MM-DD.json)
  --output=<file>       Output file (required)
  --format=json         Export format: json, csv (default: json)
  --class=<name>        Filter by class name
  --fields=<list>       Include only these fields (comma-separated)
  --exclude=<list>      Exclude these fields (comma-separated)
  --pretty              Pretty-print JSON (default: true for JSON)
  --help, -h            Show this help

Examples:
  # Export to JSON
  npx tsx scripts/tools/exportData.ts --input=data.json --output=export.json

  # Export specific class to CSV
  npx tsx scripts/tools/exportData.ts --input=data.json --output=vydūnas.csv --format=csv --class="8 Vydūnas"

  # Export with specific fields only
  npx tsx scripts/tools/exportData.ts --input=data.json --output=minimal.json --fields=id,first_name,last_name,class_name
        `);
    return null;
  }

  const options: Partial<ExportOptions> = {
    format: "json",
    prettyPrint: true,
  };

  // Find most recent data file if no input specified
  const defaultInput = `data_${new Date().toISOString().split("T")[0]}.json`;

  for (const arg of args) {
    if (arg.startsWith("--input=")) {
      options.inputFile = resolve(arg.split("=")[1]);
    } else if (arg.startsWith("--output=")) {
      options.outputFile = resolve(arg.split("=")[1]);
    } else if (arg.startsWith("--format=")) {
      options.format = arg.split("=")[1] as "json" | "csv";
    } else if (arg.startsWith("--class=")) {
      options.filterClass = arg.split("=")[1];
    } else if (arg.startsWith("--fields=")) {
      options.includeFields = arg.split("=")[1].split(",");
    } else if (arg.startsWith("--exclude=")) {
      options.excludeFields = arg.split("=")[1].split(",");
    } else if (arg === "--no-pretty") {
      options.prettyPrint = false;
    }
  }

  if (!options.inputFile) {
    options.inputFile = resolve(defaultInput);
  }

  if (!options.outputFile) {
    console.error("❌ Error: --output is required\n");
    console.log("Use --help for usage information");
    process.exit(1);
  }

  return options as ExportOptions;
}

// Main execution
async function main() {
  try {
    const options = parseArgs();
    if (!options) return;

    const exporter = new DataExporter(options);
    await exporter.export();
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

main();
