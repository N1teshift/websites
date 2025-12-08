#!/usr/bin/env node

/**
 * Excel Inspector Tool - Consolidated Excel Analysis Utility
 *
 * Combines functionality from:
 * - inspectDataJ.ts
 * - inspectExcel.ts
 * - inspectExcelColumns.ts
 * - inspectExcelRaw.ts
 *
 * Features:
 * - Analyze Excel file structure (sheets, columns, rows)
 * - Detect column patterns (EXT, ND, SD, LNT, etc.)
 * - Sample data preview
 * - Multiple output modes (summary/detailed/raw)
 *
 * Usage:
 *   npx tsx scripts/tools/inspectExcel.ts <file> [options]
 *
 * Options:
 *   --mode=summary    Quick overview (default)
 *   --mode=detailed   Full analysis with patterns
 *   --mode=raw        Raw cell data with types
 *   --sheet=<name>    Analyze specific sheet only
 *   --samples=<n>     Number of sample rows (default: 5)
 */

import ExcelJS from "exceljs";
import { resolve } from "path";

interface SheetInfo {
  name: string;
  rowCount: number;
  columnCount: number;
  headers: { row: number; values: string[] }[];
  sampleRows: { rowNum: number; data: any[] }[];
  columnPatterns?: Record<string, string[]>;
}

type InspectMode = "summary" | "detailed" | "raw";

interface InspectOptions {
  mode: InspectMode;
  targetSheet?: string;
  sampleCount: number;
  maxColumns: number;
}

const DEFAULT_OPTIONS: InspectOptions = {
  mode: "summary",
  sampleCount: 5,
  maxColumns: 50,
};

class ExcelInspector {
  private workbook!: ExcelJS.Workbook;
  private options: InspectOptions;

  constructor(options: Partial<InspectOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async inspect(filePath: string): Promise<void> {
    console.log("=".repeat(80));
    console.log(`📊 Excel Inspector - ${this.options.mode.toUpperCase()} mode`);
    console.log("=".repeat(80));
    console.log(`File: ${filePath}\n`);

    try {
      this.workbook = new ExcelJS.Workbook();
      await this.workbook.xlsx.readFile(filePath);

      const sheets = this.workbook.worksheets;
      console.log(`Total sheets: ${sheets.length}\n`);

      for (const sheet of sheets) {
        if (this.options.targetSheet && sheet.name !== this.options.targetSheet) {
          continue;
        }

        await this.inspectSheet(sheet);
      }

      console.log("=".repeat(80));
      console.log("✅ Inspection complete\n");
    } catch (error) {
      console.error("❌ Error reading Excel file:", error);
      process.exit(1);
    }
  }

  private async inspectSheet(sheet: ExcelJS.Worksheet): Promise<void> {
    console.log("─".repeat(80));
    console.log(`📄 SHEET: "${sheet.name}"`);
    console.log("─".repeat(80));

    const info: SheetInfo = {
      name: sheet.name,
      rowCount: sheet.rowCount,
      columnCount: sheet.columnCount,
      headers: [],
      sampleRows: [],
    };

    console.log(`Rows: ${info.rowCount}`);
    console.log(`Columns: ${info.columnCount}\n`);

    // Analyze headers (first 2 rows typically)
    this.analyzeHeaders(sheet, info);

    // Sample data
    this.analyzeSampleData(sheet, info);

    // Mode-specific analysis
    if (this.options.mode === "detailed") {
      this.analyzeColumnPatterns(info);
    } else if (this.options.mode === "raw") {
      this.showRawCellData(sheet);
    }

    console.log();
  }

  private analyzeHeaders(sheet: ExcelJS.Worksheet, info: SheetInfo): void {
    console.log("📋 HEADERS:");

    for (let rowNum = 1; rowNum <= Math.min(2, sheet.rowCount); rowNum++) {
      const row = sheet.getRow(rowNum);
      const values: string[] = [];

      console.log(`\nRow ${rowNum}:`);

      let colCount = 0;
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        if (colCount >= this.options.maxColumns) return;

        const value = this.formatValue(cell.value);
        values.push(value);

        if (colCount < 20) {
          console.log(`  Col ${colNumber}: ${value}`);
        }
        colCount++;
      });

      if (colCount > 20) {
        console.log(`  ... and ${colCount - 20} more columns`);
      }

      info.headers.push({ row: rowNum, values });
    }
  }

  private analyzeSampleData(sheet: ExcelJS.Worksheet, info: SheetInfo): void {
    console.log("\n📊 SAMPLE DATA:");

    const startRow = 3;
    const endRow = Math.min(startRow + this.options.sampleCount - 1, sheet.rowCount);

    for (let rowNum = startRow; rowNum <= endRow; rowNum++) {
      const row = sheet.getRow(rowNum);
      const rowData: any[] = [];

      let colCount = 0;
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        if (colCount >= this.options.maxColumns) return;

        if (colCount < 15) {
          rowData.push(this.formatValue(cell.value));
        }
        colCount++;
      });

      if (rowData.length > 0) {
        console.log(`  Row ${rowNum}: [${rowData.join(" | ")}]`);
        info.sampleRows.push({ rowNum, data: rowData });
      }
    }
  }

  private analyzeColumnPatterns(info: SheetInfo): void {
    console.log("\n🔍 COLUMN PATTERNS:");

    if (info.headers.length === 0) return;

    const headers = info.headers[info.headers.length - 1].values;
    const patterns: Record<string, string[]> = {
      "Name columns": [],
      "EXT (Classwork)": [],
      "ND (Homework)": [],
      "SD (Tests)": [],
      "LNT (Board Solving)": [],
      "KD (Summatives)": [],
      "D (Diagnostics)": [],
      "KONS (Consultations)": [],
      "Cambridge Objectives": [],
      Other: [],
    };

    headers.forEach((header) => {
      const h = header.trim();

      if (h.match(/vardas|name|pavard|surname/i)) {
        patterns["Name columns"].push(h);
      } else if (h.match(/^EXT\d+/i)) {
        patterns["EXT (Classwork)"].push(h);
      } else if (h.match(/^ND\d+/i)) {
        patterns["ND (Homework)"].push(h);
      } else if (h.match(/^SD\d+/i)) {
        patterns["SD (Tests)"].push(h);
      } else if (h.match(/^LNT\d+/i)) {
        patterns["LNT (Board Solving)"].push(h);
      } else if (h.match(/^KD\d+/i)) {
        patterns["KD (Summatives)"].push(h);
      } else if (h.match(/^D\d+/i)) {
        patterns["D (Diagnostics)"].push(h);
      } else if (h.match(/^KONS\d+/i)) {
        patterns["KONS (Consultations)"].push(h);
      } else if (h.match(/^9[A-Z][a-z]\.\d+/)) {
        patterns["Cambridge Objectives"].push(h);
      } else if (h.length > 0) {
        patterns["Other"].push(h);
      }
    });

    // Show non-empty patterns
    for (const [pattern, columns] of Object.entries(patterns)) {
      if (columns.length > 0) {
        console.log(`\n  ${pattern}: ${columns.length} columns`);
        if (columns.length <= 10) {
          console.log(`    ${columns.join(", ")}`);
        } else {
          console.log(`    ${columns.slice(0, 10).join(", ")}, ... (+${columns.length - 10} more)`);
        }
      }
    }

    info.columnPatterns = patterns;
  }

  private showRawCellData(sheet: ExcelJS.Worksheet): void {
    console.log("\n🔬 RAW CELL DATA (First 10 cells of first 3 rows):");

    for (let rowNum = 1; rowNum <= Math.min(3, sheet.rowCount); rowNum++) {
      const row = sheet.getRow(rowNum);
      console.log(`\nRow ${rowNum}:`);

      let count = 0;
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        if (count >= 10) return;

        const type = typeof cell.value;
        const value = cell.value;

        console.log(`  [${colNumber}] Type: ${type}, Value: ${JSON.stringify(value)}`);
        count++;
      });
    }
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return "(empty)";
    }

    if (value instanceof Date) {
      return value.toISOString().split("T")[0];
    }

    if (typeof value === "object") {
      if ("text" in value) return String(value.text);
      if ("richText" in value) return "[RichText]";
      if ("formula" in value) return `[Formula: ${value.result}]`;
      return JSON.stringify(value).substring(0, 50);
    }

    const str = String(value);
    return str.length > 50 ? str.substring(0, 47) + "..." : str;
  }
}

// CLI Entry Point
function parseArgs(): { filePath: string; options: Partial<InspectOptions> } {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
Excel Inspector Tool

Usage:
  npx tsx scripts/tools/inspectExcel.ts <file> [options]

Options:
  --mode=summary      Quick overview (default)
  --mode=detailed     Full analysis with column patterns
  --mode=raw          Raw cell data with types
  --sheet=<name>      Analyze specific sheet only
  --samples=<n>       Number of sample rows (default: 5)
  --help, -h          Show this help

Examples:
  npx tsx scripts/tools/inspectExcel.ts data.xlsx
  npx tsx scripts/tools/inspectExcel.ts data.xlsx --mode=detailed
  npx tsx scripts/tools/inspectExcel.ts data.xlsx --sheet="Vyd_S" --samples=10
        `);
    process.exit(0);
  }

  const filePath = resolve(args[0]);
  const options: Partial<InspectOptions> = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--mode=")) {
      options.mode = arg.split("=")[1] as InspectMode;
    } else if (arg.startsWith("--sheet=")) {
      options.targetSheet = arg.split("=")[1];
    } else if (arg.startsWith("--samples=")) {
      options.sampleCount = parseInt(arg.split("=")[1], 10);
    }
  }

  return { filePath, options };
}

// Main execution
async function main() {
  try {
    const { filePath, options } = parseArgs();
    const inspector = new ExcelInspector(options);
    await inspector.inspect(filePath);
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

main();
