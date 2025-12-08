/**
 * Import assessment_data.xlsx and create master_student_data_A_v4_46.json
 * Handles English Cambridge tests with multiple parts
 */

import ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
import {
  StudentData,
  ProgressReportData,
  EnglishTest,
  TestPart,
} from "../../src/features/modules/edtech/progressReport/types/ProgressReportTypes";

interface TestMapping {
  testId: string;
  testType: "diagnostic" | "unit";
  testNumber: number;
  testName: string;
  startCol: number;
  parts: Array<{
    name: string;
    col: number;
    maxScore?: number;
  }>;
  totalCol: number;
  percentCol: number;
}

async function importAssessmentData(filePath: string, outputPath: string): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  console.log("=".repeat(80));
  console.log("IMPORTING: assessment_data.xlsx");
  console.log("=".repeat(80));

  const allStudents: StudentData[] = [];
  let studentIdCounter = 1;

  // Process each sheet (class)
  workbook.eachSheet((worksheet) => {
    console.log(`\nProcessing Sheet: "${worksheet.name}"`);
    console.log("-".repeat(80));

    const className = worksheet.name.trim();

    // Extract grade from class name (e.g., "3 Algirdas" -> grade 3)
    const gradeMatch = className.match(/^(\d+)\s+/);
    const grade = gradeMatch ? parseInt(gradeMatch[1]) : 3;

    // Identify test mappings by analyzing row 1 and row 2
    const testMappings = identifyTests(worksheet);

    console.log(`Found ${testMappings.length} tests in this sheet`);
    testMappings.forEach((test) => {
      console.log(`  - ${test.testName} (${test.parts.length} parts)`);
    });

    // Process each student row (starting from row 3)
    const rowCount = worksheet.rowCount;
    let studentsProcessed = 0;

    for (let rowNum = 3; rowNum <= rowCount; rowNum++) {
      const row = worksheet.getRow(rowNum);

      // Get student name
      const firstName = getCellValue(row.getCell(2)); // Column B
      const lastName = getCellValue(row.getCell(3)); // Column C

      if (!firstName || firstName === "(empty)") {
        continue; // Skip empty rows
      }

      const studentId = `teacher_a_${String(studentIdCounter).padStart(4, "0")}`;
      studentIdCounter++;

      // Process all tests for this student
      const englishTests: EnglishTest[] = [];

      testMappings.forEach((testMapping) => {
        const test = extractTestData(row, testMapping);
        if (test) {
          englishTests.push(test);
        }
      });

      const student: StudentData = {
        id: studentId,
        first_name: String(firstName),
        last_name: String(lastName),
        class_name: className,
        academic: {
          year: "2024-2025",
          grade: grade,
          class_id: className.toLowerCase().replace(/\s+/g, "_"),
          enrolled_date: null,
        },
        assessments: [],
        english_tests: englishTests,
        created: new Date().toISOString(),
      };

      allStudents.push(student);
      studentsProcessed++;
    }

    console.log(`✓ Processed ${studentsProcessed} students from "${className}"`);
  });

  // Create final data structure
  const outputData: ProgressReportData = {
    metadata: {
      exported_at: new Date().toISOString(),
      schema_version: "4.46",
      total_students: allStudents.length,
      export_version: "teacher_a_v1",
      teacher_type: "A",
      teacher_name: "Teacher A (English)",
    },
    students: allStudents,
  };

  // Write to file
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

  console.log("\n" + "=".repeat(80));
  console.log("IMPORT COMPLETE");
  console.log("=".repeat(80));
  console.log(`Total students imported: ${allStudents.length}`);
  console.log(`Output file: ${outputPath}`);
  console.log("=".repeat(80));
}

function identifyTests(worksheet: ExcelJS.Worksheet): TestMapping[] {
  const testMappings: TestMapping[] = [];
  const row2 = worksheet.getRow(2);

  // Diagnostic tests (columns R-AQ)
  const diagnosticTests = [
    { name: "Diagnostic TEST 1", startCol: 18, endCol: 25 }, // R-Y
    { name: "Diagnostic TEST 2", startCol: 27, endCol: 34 }, // AA-AH
    { name: "Diagnostic TEST 3", startCol: 36, endCol: 43 }, // AJ-AQ
  ];

  diagnosticTests.forEach((diag, idx) => {
    testMappings.push({
      testId: `diagnostic_${idx + 1}`,
      testType: "diagnostic",
      testNumber: idx + 1,
      testName: diag.name,
      startCol: diag.startCol,
      parts: [
        { name: "Reading and use of English", col: diag.startCol, maxScore: 34 },
        { name: "Listening", col: diag.startCol + 2, maxScore: 17 },
        { name: "Writing", col: diag.startCol + 4, maxScore: 20 },
      ],
      totalCol: diag.startCol + 6,
      percentCol: diag.startCol + 7,
    });
  });

  // Unit tests (starting from column AS)
  const unitTestStarts = [
    { col: 45, name: "Unit 1 TEST", unitNum: 1 }, // AS (Unit 1)
    { col: 57, name: "Unit 2 TEST", unitNum: 2 }, // BC
    { col: 68, name: "Unit 3 TEST", unitNum: 3 }, // BJ
    { col: 79, name: "Unit 4 TEST", unitNum: 4 }, // BQ
    { col: 90, name: "Unit 5 TEST", unitNum: 5 }, // BW
    { col: 101, name: "Unit 6 TEST", unitNum: 6 }, // CG
    { col: 112, name: "Unit 7 TEST", unitNum: 7 }, // CR
  ];

  unitTestStarts.forEach((unit) => {
    // Read actual column headers to identify parts
    const parts: Array<{ name: string; col: number; maxScore?: number }> = [];

    // Try to identify parts by reading row 2 headers around this column
    for (let col = unit.col; col < unit.col + 10; col++) {
      const header = getCellValue(row2.getCell(col));
      const headerStr = String(header);
      if (
        header &&
        header !== "(empty)" &&
        header !== "TOTAL" &&
        header !== "%" &&
        !headerStr.includes("Total")
      ) {
        // Extract max score from header if present
        const maxScoreMatch = headerStr.match(/\((\d+)\)/);
        const maxScore = maxScoreMatch ? parseInt(maxScoreMatch[1]) : undefined;

        parts.push({
          name: headerStr.replace(/\s*\(\d+\)/, "").trim(),
          col: col,
          maxScore: maxScore,
        });
      }

      // Stop when we hit TOTAL column
      if (header && (header === "TOTAL" || headerStr.includes("Total"))) {
        testMappings.push({
          testId: `unit_${unit.unitNum}`,
          testType: "unit",
          testNumber: unit.unitNum,
          testName: unit.name,
          startCol: unit.col,
          parts: parts,
          totalCol: col,
          percentCol: col + 1,
        });
        break;
      }
    }
  });

  return testMappings;
}

function extractTestData(row: ExcelJS.Row, mapping: TestMapping): EnglishTest | null {
  const parts: TestPart[] = [];
  let hasAnyData = false;

  // Extract each part
  mapping.parts.forEach((partMapping) => {
    const cell = row.getCell(partMapping.col);
    const value = getCellValue(cell);
    const score = value && value !== "(empty)" ? parseFloat(String(value)) : null;

    if (score !== null && !isNaN(score)) {
      hasAnyData = true;
    }

    parts.push({
      part_name: partMapping.name,
      score: score,
      max_score: partMapping.maxScore || null,
    });
  });

  // If no data, skip this test
  if (!hasAnyData) {
    return null;
  }

  // Get total and percentage
  const totalCell = row.getCell(mapping.totalCol);
  const percentCell = row.getCell(mapping.percentCol);

  const totalValue = getCellValue(totalCell);
  const percentValue = getCellValue(percentCell);

  const totalScore = totalValue && totalValue !== "(empty)" ? parseFloat(String(totalValue)) : null;
  const percentage =
    percentValue && percentValue !== "(empty)" ? parseFloat(String(percentValue)) : null;

  // Calculate total max score
  const totalMaxScore = parts.reduce((sum, part) => {
    return sum + (part.max_score || 0);
  }, 0);

  return {
    test_id: mapping.testId,
    test_type: mapping.testType,
    test_number: mapping.testNumber,
    test_name: mapping.testName,
    date: null, // No dates in this Excel
    parts: parts,
    total_score: totalScore !== null ? totalScore : undefined,
    total_max_score: totalMaxScore > 0 ? totalMaxScore : undefined,
    percentage: percentage !== null ? percentage : undefined,
    added: new Date().toISOString(),
  };
}

function getCellValue(cell: ExcelJS.Cell): string | number | null {
  if (cell.value === null || cell.value === undefined) {
    return null;
  }

  if (typeof cell.value === "object") {
    if ("result" in cell.value) {
      const result = cell.value.result;
      if (typeof result === "string" || typeof result === "number") {
        return result;
      }
      return null;
    }
    if ("text" in cell.value) {
      const text = cell.value.text;
      if (typeof text === "string" || typeof text === "number") {
        return text;
      }
      return null;
    }
    if ("richText" in cell.value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (cell.value.richText as any[]).map((rt) => rt.text).join("");
    }
    return null;
  }

  if (typeof cell.value === "string" || typeof cell.value === "number") {
    return cell.value;
  }

  return null;
}

// Run the import
const excelPath = path.join(process.cwd(), "assessment_data.xlsx");
const outputPath = path.join(process.cwd(), "master_student_data_A_v4_46.json");

importAssessmentData(excelPath, outputPath)
  .then(() => {
    console.log("\n✓ Import successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n✗ Import failed:", error);
    process.exit(1);
  });
