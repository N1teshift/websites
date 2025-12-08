#!/usr/bin/env node

/**
 * Override SD1 P, SD2 P, SD3 P data from new Excel file
 * Usage: npx tsx scripts/overrideSummativeData.ts <excel-file-path> <master-json-path> <output-json-path>
 * Example: npx tsx scripts/overrideSummativeData.ts stud_data.xlsx master_student_data_main_v4_51.json master_student_data_main_v4_52.json
 */

import ExcelJS from "exceljs";
import fs from "fs/promises";
import {
  CLASS_SHEET_MAPPING,
  STANDARD_COLUMNS,
} from "../src/features/modules/edtech/progressReport/student-data/config/columnMapping";
import { resolveNameAlias } from "../src/features/modules/edtech/progressReport/student-data/config/nameAliases";
import Logger from "@/features/infrastructure/logging/logger";

interface StudentDataV4 {
  id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  assessments: Assessment[];
  metadata: {
    schema_version: string;
    updated_at: string;
    [key: string]: string | number | boolean | undefined;
  };
}

interface Assessment {
  date: string;
  column: string;
  type: string;
  task_name: string;
  score: string | number;
  comment?: string;
  assessment_id?: string;
  assessment_title?: string;
  evaluation_details?: {
    percentage_score?: number;
    myp_score?: number;
    cambridge_score?: number;
    cambridge_score_1?: number;
    cambridge_score_2?: number;
  };
}

interface MasterData {
  metadata: {
    exported_at: string;
    schema_version: string;
    total_students: number;
    export_version: string;
  };
  students: StudentDataV4[];
}

/**
 * Excel student data structure with all assessment scores
 */
interface ExcelStudentData {
  firstName: string;
  lastName: string;
  SD1_P: number | null;
  SD1_MYP: number | null;
  SD1_C1: number | null;
  SD1_C2: number | null;
  SD2_P: number | null;
  SD2_MYP: number | null;
  SD2_C1: number | null;
  SD2_C2: number | null;
  SD3_P: number | null;
  SD3_MYP: number | null;
  SD3_C1: number | null;
  SD3_C2: number | null;
}

/**
 * Read Excel file and extract SD1 P, SD2 P, SD3 P data
 */
async function readExcelData(
  excelPath: string
): Promise<Map<string, Map<string, ExcelStudentData>>> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);

  // Map structure: className -> studentKey -> { SD1_P, SD2_P, SD3_P }
  const dataMap = new Map<string, Map<string, ExcelStudentData>>();

  for (const [sheetName, className] of Object.entries(CLASS_SHEET_MAPPING)) {
    const worksheet = workbook.getWorksheet(sheetName);

    if (!worksheet) {
      Logger.warn(`Sheet not found: ${sheetName}`);
      continue;
    }

    const classData = new Map<string, ExcelStudentData>();

    // Get header row (row 2)
    const headerRow = worksheet.getRow(2);
    const columnIndices: { [key: string]: number } = {};

    headerRow.eachCell((cell, colNumber) => {
      const columnName = String(cell.value || "").trim();
      if (
        columnName === STANDARD_COLUMNS.FIRST_NAME ||
        columnName === STANDARD_COLUMNS.LAST_NAME ||
        columnName === "SD1 P" ||
        columnName === "SD1 MYP" ||
        columnName === "SD1 C1" ||
        columnName === "SD1 C2" ||
        columnName === "SD2 P" ||
        columnName === "SD2 MYP" ||
        columnName === "SD2 C1" ||
        columnName === "SD2 C2" ||
        columnName === "SD3 P" ||
        columnName === "SD3 MYP" ||
        columnName === "SD3 C1" ||
        columnName === "SD3 C2"
      ) {
        columnIndices[columnName] = colNumber;
      }
    });

    Logger.info(`Processing sheet: ${sheetName} (${className})`);
    Logger.info(`Column indices:`, columnIndices);

    // Read student data (starting from row 3)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 2) return;

      const firstName = row.getCell(columnIndices[STANDARD_COLUMNS.FIRST_NAME]).value;
      const lastName = row.getCell(columnIndices[STANDARD_COLUMNS.LAST_NAME]).value;

      if (!firstName || !lastName) return;

      // Resolve name aliases
      const resolvedName = resolveNameAlias(
        String(firstName).trim(),
        String(lastName).trim(),
        className
      );

      const studentKey = `${resolvedName.firstName}_${resolvedName.lastName}`.trim();

      const sd1_p = columnIndices["SD1 P"] ? row.getCell(columnIndices["SD1 P"]).value : null;
      const sd1_myp = columnIndices["SD1 MYP"] ? row.getCell(columnIndices["SD1 MYP"]).value : null;
      const sd1_c1 = columnIndices["SD1 C1"] ? row.getCell(columnIndices["SD1 C1"]).value : null;
      const sd1_c2 = columnIndices["SD1 C2"] ? row.getCell(columnIndices["SD1 C2"]).value : null;

      const sd2_p = columnIndices["SD2 P"] ? row.getCell(columnIndices["SD2 P"]).value : null;
      const sd2_myp = columnIndices["SD2 MYP"] ? row.getCell(columnIndices["SD2 MYP"]).value : null;
      const sd2_c1 = columnIndices["SD2 C1"] ? row.getCell(columnIndices["SD2 C1"]).value : null;
      const sd2_c2 = columnIndices["SD2 C2"] ? row.getCell(columnIndices["SD2 C2"]).value : null;

      const sd3_p = columnIndices["SD3 P"] ? row.getCell(columnIndices["SD3 P"]).value : null;
      const sd3_myp = columnIndices["SD3 MYP"] ? row.getCell(columnIndices["SD3 MYP"]).value : null;
      const sd3_c1 = columnIndices["SD3 C1"] ? row.getCell(columnIndices["SD3 C1"]).value : null;
      const sd3_c2 = columnIndices["SD3 C2"] ? row.getCell(columnIndices["SD3 C2"]).value : null;

      classData.set(studentKey, {
        firstName: resolvedName.firstName,
        lastName: resolvedName.lastName,
        SD1_P: sd1_p !== null && sd1_p !== undefined ? Number(sd1_p) : null,
        SD1_MYP: sd1_myp !== null && sd1_myp !== undefined ? Number(sd1_myp) : null,
        SD1_C1: sd1_c1 !== null && sd1_c1 !== undefined ? Number(sd1_c1) : null,
        SD1_C2: sd1_c2 !== null && sd1_c2 !== undefined ? Number(sd1_c2) : null,
        SD2_P: sd2_p !== null && sd2_p !== undefined ? Number(sd2_p) : null,
        SD2_MYP: sd2_myp !== null && sd2_myp !== undefined ? Number(sd2_myp) : null,
        SD2_C1: sd2_c1 !== null && sd2_c1 !== undefined ? Number(sd2_c1) : null,
        SD2_C2: sd2_c2 !== null && sd2_c2 !== undefined ? Number(sd2_c2) : null,
        SD3_P: sd3_p !== null && sd3_p !== undefined ? Number(sd3_p) : null,
        SD3_MYP: sd3_myp !== null && sd3_myp !== undefined ? Number(sd3_myp) : null,
        SD3_C1: sd3_c1 !== null && sd3_c1 !== undefined ? Number(sd3_c1) : null,
        SD3_C2: sd3_c2 !== null && sd3_c2 !== undefined ? Number(sd3_c2) : null,
      });

      if (resolvedName.firstName !== String(firstName).trim()) {
        Logger.info(
          `Resolved name alias: ${firstName} ${lastName} → ${resolvedName.firstName} ${resolvedName.lastName}`
        );
      }

      Logger.info(
        `Loaded: ${studentKey} - SD1[P:${sd1_p}, MYP:${sd1_myp}, C1:${sd1_c1}, C2:${sd1_c2}], SD2[P:${sd2_p}, MYP:${sd2_myp}, C1:${sd2_c1}, C2:${sd2_c2}], SD3[P:${sd3_p}, MYP:${sd3_myp}, C1:${sd3_c1}, C2:${sd3_c2}]`
      );
    });

    dataMap.set(className, classData);
    Logger.info(`Loaded ${classData.size} students from ${className}`);
  }

  return dataMap;
}

/**
 * Normalize name for comparison (handle various formats)
 */
function normalizeKey(firstName: string, lastName: string): string {
  const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, "_");
  return `${normalize(firstName)}_${normalize(lastName)}`;
}

/**
 * Override summative data in master JSON
 */
async function overrideSummativeData(
  masterPath: string,
  excelData: Map<string, Map<string, ExcelStudentData>>,
  outputPath: string
): Promise<void> {
  // Read master JSON
  const masterContent = await fs.readFile(masterPath, "utf-8");
  const masterData: MasterData = JSON.parse(masterContent);

  Logger.info(`Loaded master data with ${masterData.students.length} students`);

  let studentsUpdated = 0;
  let assessmentsUpdated = 0;

  // Process each student
  for (const student of masterData.students) {
    const className = student.class_name;
    const classData = excelData.get(className);

    if (!classData) {
      Logger.warn(`No Excel data found for class: ${className}`);
      continue;
    }

    // Try to find student in Excel data
    const studentKey = normalizeKey(student.first_name, student.last_name);
    let excelStudent = null;

    // Try exact match first
    for (const [_key, data] of Array.from(classData.entries())) {
      if (normalizeKey(data.firstName, data.lastName) === studentKey) {
        excelStudent = data;
        break;
      }
    }

    if (!excelStudent) {
      Logger.warn(
        `Student not found in Excel: ${student.first_name} ${student.last_name} (${className})`
      );
      continue;
    }

    // Update SD1, SD2, SD3 assessments
    let studentModified = false;

    for (const assessment of student.assessments) {
      if (assessment.column === "SD1") {
        if (!assessment.evaluation_details) {
          assessment.evaluation_details = {};
        }

        let updated = false;
        if (excelStudent.SD1_P !== null) {
          assessment.evaluation_details.percentage_score = excelStudent.SD1_P;
          assessment.score = String(excelStudent.SD1_P);
          updated = true;
        }
        if (excelStudent.SD1_MYP !== null) {
          assessment.evaluation_details.myp_score = excelStudent.SD1_MYP;
          updated = true;
        }
        if (excelStudent.SD1_C1 !== null) {
          assessment.evaluation_details.cambridge_score_1 = excelStudent.SD1_C1;
          updated = true;
        }
        if (excelStudent.SD1_C2 !== null) {
          assessment.evaluation_details.cambridge_score_2 = excelStudent.SD1_C2;
          updated = true;
        }

        if (updated) {
          studentModified = true;
          assessmentsUpdated++;
          Logger.info(
            `Updated SD1 for ${student.first_name} ${student.last_name}: P=${excelStudent.SD1_P}, MYP=${excelStudent.SD1_MYP}, C1=${excelStudent.SD1_C1}, C2=${excelStudent.SD1_C2}`
          );
        }
      } else if (assessment.column === "SD2") {
        if (!assessment.evaluation_details) {
          assessment.evaluation_details = {};
        }

        let updated = false;
        if (excelStudent.SD2_P !== null) {
          assessment.evaluation_details.percentage_score = excelStudent.SD2_P;
          assessment.score = String(excelStudent.SD2_P);
          updated = true;
        }
        if (excelStudent.SD2_MYP !== null) {
          assessment.evaluation_details.myp_score = excelStudent.SD2_MYP;
          updated = true;
        }
        if (excelStudent.SD2_C1 !== null) {
          assessment.evaluation_details.cambridge_score_1 = excelStudent.SD2_C1;
          updated = true;
        }
        if (excelStudent.SD2_C2 !== null) {
          assessment.evaluation_details.cambridge_score_2 = excelStudent.SD2_C2;
          updated = true;
        }

        if (updated) {
          studentModified = true;
          assessmentsUpdated++;
          Logger.info(
            `Updated SD2 for ${student.first_name} ${student.last_name}: P=${excelStudent.SD2_P}, MYP=${excelStudent.SD2_MYP}, C1=${excelStudent.SD2_C1}, C2=${excelStudent.SD2_C2}`
          );
        }
      } else if (assessment.column === "SD3") {
        if (!assessment.evaluation_details) {
          assessment.evaluation_details = {};
        }

        let updated = false;
        if (excelStudent.SD3_P !== null) {
          assessment.evaluation_details.percentage_score = excelStudent.SD3_P;
          assessment.score = String(excelStudent.SD3_P);
          updated = true;
        }
        if (excelStudent.SD3_MYP !== null) {
          assessment.evaluation_details.myp_score = excelStudent.SD3_MYP;
          updated = true;
        }
        if (excelStudent.SD3_C1 !== null) {
          assessment.evaluation_details.cambridge_score_1 = excelStudent.SD3_C1;
          updated = true;
        }
        if (excelStudent.SD3_C2 !== null) {
          assessment.evaluation_details.cambridge_score_2 = excelStudent.SD3_C2;
          updated = true;
        }

        if (updated) {
          studentModified = true;
          assessmentsUpdated++;
          Logger.info(
            `Updated SD3 for ${student.first_name} ${student.last_name}: P=${excelStudent.SD3_P}, MYP=${excelStudent.SD3_MYP}, C1=${excelStudent.SD3_C1}, C2=${excelStudent.SD3_C2}`
          );
        }
      }
    }

    if (studentModified) {
      student.metadata.updated_at = new Date().toISOString();
      studentsUpdated++;
    }
  }

  // Update master metadata
  masterData.metadata.exported_at = new Date().toISOString();

  // Write output file
  await fs.writeFile(outputPath, JSON.stringify(masterData, null, 2), "utf-8");

  Logger.info(`✅ Override complete!`);
  Logger.info(`   Students updated: ${studentsUpdated}`);
  Logger.info(`   Assessments updated: ${assessmentsUpdated}`);
  Logger.info(`   Output saved to: ${outputPath}`);
}

async function main() {
  Logger.info("📊 Summative Data Override Tool\n");
  Logger.info("=".repeat(60));

  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error("❌ Error: Missing arguments");
    console.log(
      "\nUsage: npx tsx scripts/overrideSummativeData.ts <excel-file> <master-json> <output-json>"
    );
    console.log(
      "Example: npx tsx scripts/overrideSummativeData.ts stud_data.xlsx master_student_data_main_v4_51.json master_student_data_main_v4_52.json"
    );
    process.exit(1);
  }

  const [excelPath, masterPath, outputPath] = args;

  Logger.info(`📂 Excel file: ${excelPath}`);
  Logger.info(`📂 Master JSON: ${masterPath}`);
  Logger.info(`📂 Output JSON: ${outputPath}`);
  Logger.info("=".repeat(60));
  Logger.info("");

  try {
    // Read Excel data
    Logger.info("⏳ Reading Excel file...\n");
    const excelData = await readExcelData(excelPath);

    // Override data
    Logger.info("\n⏳ Overriding summative data...\n");
    await overrideSummativeData(masterPath, excelData, outputPath);

    Logger.info("\n✅ All done!");
    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    Logger.error("❌ FATAL ERROR", { error: errorMessage });
    if (errorStack) {
      console.error(errorStack);
    }
    process.exit(1);
  }
}

main();
