/**
 * Import Cambridge Learning Objectives from _C sheets in Excel
 *
 * Reads Vyd_C, Grei_C, Gim_C, Vei_C sheets and imports Cambridge objective
 * scores for each student with history tracking support.
 */

import ExcelJS from "exceljs";
import fs from "fs/promises";
import path from "path";
import {
  ASSESSMENT_OBJECTIVE_MAPPING,
  getAssessmentsForObjective,
  getCambridgeScoreField,
} from "../../src/features/modules/edtech/progressReport/student-data/config/cambridgeObjectiveMapping";
import {
  StudentData,
  CambridgeObjectiveProgress,
  CambridgeObjectivesSummary,
  Assessment,
} from "../../src/features/modules/edtech/progressReport/types/ProgressReportTypes";
import { resolveNameAlias } from "../../src/features/modules/edtech/progressReport/student-data/config/nameAliases";
import { Logger } from "../../src/features/infrastructure/logging";

interface CambridgeSheetData {
  className: string;
  objectives: string[];
  students: {
    firstName: string;
    lastName: string;
    scores: (number | null)[];
  }[];
}

const CLASS_SHEET_MAPPING: { [key: string]: string } = {
  Vyd_C: "8 Vydūnas",
  Grei_C: "8 A. J. Greimas",
  Gim_C: "8 M. A. Gimbutienė",
  Vei_C: "8 I. Veisaitė",
};

/**
 * Read all _C sheets from Excel file
 */
async function readCambridgeSheets(excelPath: string): Promise<CambridgeSheetData[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);

  const allData: CambridgeSheetData[] = [];

  for (const [sheetName, className] of Object.entries(CLASS_SHEET_MAPPING)) {
    const worksheet = workbook.getWorksheet(sheetName);

    if (!worksheet) {
      Logger.warn(`Sheet not found: ${sheetName}`);
      continue;
    }

    Logger.info(`Processing sheet: ${sheetName} (${className})`);

    // Row 1: Objective codes (starting from column 4)
    const row1 = worksheet.getRow(1);
    const objectives: string[] = [];

    row1.eachCell((cell, colNumber) => {
      if (colNumber > 3) {
        // Skip ID, Vardas, Pavardė
        const value = String(cell.value || "").trim();
        if (value && value.startsWith("9")) {
          objectives.push(value);
        }
      }
    });

    Logger.info(`  Found ${objectives.length} Cambridge objectives`);

    // Row 2+: Student data
    const students: CambridgeSheetData["students"] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 1) return; // Skip row 1 (objectives)

      const firstName = String(row.getCell(2).value || "").trim();
      const lastName = String(row.getCell(3).value || "").trim();

      if (!firstName || !lastName) return;

      const scores: (number | null)[] = [];

      // Read scores starting from column 4
      for (let i = 0; i < objectives.length; i++) {
        const cellValue = row.getCell(4 + i).value;

        if (cellValue === null || cellValue === undefined || cellValue === "") {
          scores.push(null);
        } else {
          // Handle both "0,5" and "0.5" formats
          const numValue =
            typeof cellValue === "string"
              ? parseFloat(cellValue.replace(",", "."))
              : Number(cellValue);

          scores.push(isNaN(numValue) ? null : numValue);
        }
      }

      students.push({ firstName, lastName, scores });
    });

    Logger.info(`  Found ${students.length} students`);

    allData.push({
      className,
      objectives,
      students,
    });
  }

  return allData;
}

/**
 * Simple fuzzy name matcher (for handling typos)
 */
function fuzzyMatch(name1: string, name2: string): number {
  const s1 = name1.toLowerCase();
  const s2 = name2.toLowerCase();

  if (s1 === s2) return 1.0;

  // Levenshtein distance
  const matrix: number[][] = [];

  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[s1.length][s2.length];
  const maxLength = Math.max(s1.length, s2.length);

  return 1 - distance / maxLength;
}

/**
 * Find matching student in JSON data
 */
function findStudent(
  students: StudentData[],
  firstName: string,
  lastName: string,
  className: string
): StudentData | null {
  // Try exact match first
  let match = students.find(
    (s) => s.first_name === firstName && s.last_name === lastName && s.class_name === className
  );

  if (match) return match;

  // Try fuzzy match
  const threshold = 0.85;
  let bestMatch: StudentData | null = null;
  let bestScore = threshold;

  for (const student of students) {
    if (student.class_name !== className) continue;

    const firstScore = fuzzyMatch(student.first_name, firstName);
    const lastScore = fuzzyMatch(student.last_name, lastName);
    const avgScore = (firstScore + lastScore) / 2;

    if (avgScore > bestScore) {
      bestScore = avgScore;
      bestMatch = student;
    }
  }

  if (bestMatch) {
    Logger.warn(
      `Fuzzy match: "${firstName} ${lastName}" -> "${bestMatch.first_name} ${bestMatch.last_name}" (${(bestScore * 100).toFixed(0)}%)`
    );
  }

  return bestMatch;
}

/**
 * Build history for an objective by looking at past assessments
 */
function buildObjectiveHistory(
  student: StudentData,
  objectiveCode: string,
  currentScore: number | null,
  importDate: string
): CambridgeObjectiveProgress {
  const history: CambridgeObjectiveProgress["history"] = [];

  // Get all assessments that test this objective
  const relevantAssessments = getAssessmentsForObjective(objectiveCode);

  if (!student.assessments) {
    return {
      current_score: currentScore,
      last_updated: currentScore !== null ? importDate : null,
      history:
        currentScore !== null
          ? [
              {
                score: currentScore,
                date: importDate,
                assessment: relevantAssessments.join(", "),
              },
            ]
          : [],
    };
  }

  // Find assessments that tested this objective
  for (const assessment of student.assessments) {
    const assessmentId =
      assessment.assessment_id?.toUpperCase() || assessment.column?.toUpperCase();

    if (!assessmentId || !relevantAssessments.includes(assessmentId)) {
      continue;
    }

    // Get the correct Cambridge score field for this specific objective
    const scoreField = getCambridgeScoreField(assessmentId, objectiveCode);
    let cambridgeScore: number | null = null;

    if (scoreField === "cambridge_score_1") {
      cambridgeScore = assessment.evaluation_details?.cambridge_score_1 ?? null;
    } else if (scoreField === "cambridge_score_2") {
      cambridgeScore = assessment.evaluation_details?.cambridge_score_2 ?? null;
    } else {
      // Default to cambridge_score (for SD assessments with single C column or KD assessments)
      cambridgeScore = assessment.evaluation_details?.cambridge_score ?? null;
    }

    if (cambridgeScore !== null && cambridgeScore !== undefined) {
      history.push({
        score: cambridgeScore,
        date: assessment.date,
        assessment: assessmentId,
      });
    }
  }

  // Sort history by date
  history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // If we have history, use the most recent score
  // Otherwise, use the current score from _C sheet
  let finalScore = currentScore;
  let lastDate = importDate;

  if (history.length > 0) {
    const lastEntry = history[history.length - 1];
    finalScore = lastEntry.score;
    lastDate = lastEntry.date;
  } else if (currentScore !== null) {
    // No history found, add current score as initial entry
    history.push({
      score: currentScore,
      date: importDate,
      assessment: relevantAssessments.join(", "),
    });
  }

  return {
    current_score: finalScore,
    last_updated: finalScore !== null ? lastDate : null,
    history,
  };
}

/**
 * Calculate summary statistics
 */
function calculateSummary(
  objectives: Record<string, CambridgeObjectiveProgress>
): CambridgeObjectivesSummary {
  const values = Object.values(objectives);

  return {
    total: values.length,
    mastered: values.filter((o) => o.current_score === 1).length,
    partial: values.filter((o) => o.current_score === 0.5).length,
    not_mastered: values.filter((o) => o.current_score === 0).length,
    not_assessed: values.filter((o) => o.current_score === null).length,
    last_full_update: new Date().toISOString().split("T")[0],
  };
}

/**
 * Main import function
 */
async function importCambridgeObjectives(excelPath: string, jsonPath: string, outputPath: string) {
  Logger.info("Starting Cambridge objectives import...", { excelPath, jsonPath });

  // Read Excel data
  const cambridgeData = await readCambridgeSheets(excelPath);

  // Load existing JSON
  const jsonContent = await fs.readFile(jsonPath, "utf-8");
  const data = JSON.parse(jsonContent);
  const students: StudentData[] = data.students || [];

  Logger.info(`Loaded ${students.length} students from JSON`);

  const importDate = new Date().toISOString().split("T")[0];
  let matchedCount = 0;
  let unmatchedCount = 0;
  let totalObjectivesAdded = 0;

  // Process each class
  for (const classData of cambridgeData) {
    Logger.info(`\nProcessing class: ${classData.className}`);

    for (const excelStudent of classData.students) {
      // Resolve name aliases (shortened names in Excel)
      const resolvedName = resolveNameAlias(
        excelStudent.firstName,
        excelStudent.lastName,
        classData.className
      );

      const jsonStudent = findStudent(
        students,
        resolvedName.firstName,
        resolvedName.lastName,
        classData.className
      );

      if (!jsonStudent) {
        Logger.warn(
          `  ❌ Student not found: ${excelStudent.firstName} ${excelStudent.lastName} (resolved to: ${resolvedName.firstName} ${resolvedName.lastName})`
        );
        unmatchedCount++;
        continue;
      }

      matchedCount++;

      // Initialize curriculum_progress if needed
      if (!jsonStudent.curriculum_progress) {
        jsonStudent.curriculum_progress = {};
      }

      if (!jsonStudent.curriculum_progress.cambridge_objectives) {
        jsonStudent.curriculum_progress.cambridge_objectives = {};
      }

      // Build Cambridge objectives with history
      const objectives: Record<string, CambridgeObjectiveProgress> = {};

      for (let i = 0; i < classData.objectives.length; i++) {
        const objectiveCode = classData.objectives[i];
        const score = excelStudent.scores[i];

        objectives[objectiveCode] = buildObjectiveHistory(
          jsonStudent,
          objectiveCode,
          score,
          importDate
        );

        totalObjectivesAdded++;
      }

      jsonStudent.curriculum_progress.cambridge_objectives = objectives;
      jsonStudent.curriculum_progress.cambridge_objectives_summary = calculateSummary(objectives);

      Logger.info(
        `  ✅ ${jsonStudent.first_name} ${jsonStudent.last_name}: ${classData.objectives.length} objectives`
      );
    }
  }

  // Save updated JSON
  Logger.info("\nSaving updated JSON...");
  await fs.writeFile(outputPath, JSON.stringify(data, null, 2), "utf-8");

  Logger.info("\n" + "=".repeat(80));
  Logger.info("✅ Cambridge objectives import complete!");
  Logger.info("=".repeat(80));
  Logger.info(`Students matched: ${matchedCount}`);
  Logger.info(`Students unmatched: ${unmatchedCount}`);
  Logger.info(`Total objectives added: ${totalObjectivesAdded}`);
  Logger.info(`Output file: ${outputPath}`);
}

// Run import
const excelPath = process.argv[2] || "data5.xlsx";
const jsonPath = process.argv[3] || "data_2025-11-08_current.json";
const outputPath = process.argv[4] || "data_2025-11-08_with_cambridge.json";

importCambridgeObjectives(excelPath, jsonPath, outputPath).catch((error) => {
  Logger.error("Import failed:", error);
  process.exit(1);
});
