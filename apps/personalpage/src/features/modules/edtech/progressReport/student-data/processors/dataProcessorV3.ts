/**
 * Data processor for student assessments (v3 format)
 * Handles adding new assessments with duplicate detection
 */

import { AssessmentV3, StudentDataV3, LearningLevel } from "../types/StudentDataTypesV3";
import { ExcelRowData } from "../types/StudentDataTypes";
import { SUMMATIVE_SHEET_COLUMNS, STANDARD_COLUMNS } from "../config/columnMapping";
import { resolveNameAlias } from "../config/nameAliases";
import Logger from "@websites/infrastructure/logging/logger";

export class DataProcessorV3 {
  private currentDate: string;

  constructor() {
    this.currentDate = new Date().toISOString().split("T")[0];
  }

  /**
   * Process a student row from Excel and update student data
   * Returns true if student data was modified
   * @param selectedColumns Optional set of column names to process. If not provided, all columns are processed.
   */
  processStudentRow(
    studentData: StudentDataV3,
    row: ExcelRowData,
    columnDates: Map<string, string>,
    selectedColumns?: Set<string> | null
  ): { modified: boolean; assessmentsAdded: number } {
    let modified = false;
    let assessmentsAdded = 0;

    // First pass: collect comments
    const commentsMap = new Map<string, string>();

    for (const [columnName, value] of Object.entries(row)) {
      // Skip if column not selected
      if (selectedColumns && !selectedColumns.has(columnName)) {
        continue;
      }

      const mapping = SUMMATIVE_SHEET_COLUMNS[columnName];

      if (mapping && mapping.type === "comment" && value) {
        const parentColumn = mapping.parent_column;
        if (parentColumn) {
          commentsMap.set(parentColumn, String(value));
        }
      }
    }

    // Second pass: process assessments and collect SD sub-scores
    const sdScores = new Map<string, { P?: number; MYP?: number; C?: number; date: string }>();

    for (const [columnName, value] of Object.entries(row)) {
      // Skip standard columns
      if (
        columnName === STANDARD_COLUMNS.FIRST_NAME ||
        columnName === STANDARD_COLUMNS.LAST_NAME ||
        columnName === STANDARD_COLUMNS.ID
      ) {
        continue;
      }

      // Skip if column not selected
      if (selectedColumns && !selectedColumns.has(columnName)) {
        continue;
      }

      const mapping = SUMMATIVE_SHEET_COLUMNS[columnName];
      if (!mapping) continue;

      // Skip comment columns (already processed)
      if (mapping.type === "comment") continue;

      // Handle social hours
      if (mapping.type === "social_hours") {
        if (value !== null && value !== undefined && value !== "") {
          studentData.engagement.social_hours = Number(value) || 0;
          modified = true;
        }
        continue;
      }

      // Handle SD summative assessments (collect sub-scores)
      if (mapping.type === "summative" && mapping.summative_subtype) {
        const result = this.processSummativeSubScore(
          columnName,
          value,
          mapping.summative_subtype,
          columnDates,
          sdScores
        );
        if (result) {
          modified = true;
        }
        continue;
      }

      // Handle regular assessments
      if (value !== null && value !== undefined && value !== "" && value !== "n") {
        const assessmentDate = columnDates.get(columnName) || this.currentDate;
        const comment = commentsMap.get(columnName) || "";

        const assessment: AssessmentV3 = {
          date: assessmentDate,
          column: columnName,
          type: mapping.type as
            | "homework"
            | "classwork"
            | "summative"
            | "diagnostic"
            | "participation"
            | "consultation",
          task_name: mapping.task_name || columnName,
          score: String(value),
          comment: comment,
          added: this.currentDate,
        };

        const added = this.addAssessment(studentData, assessment);
        if (added) {
          assessmentsAdded++;
          modified = true;
        }
      }
    }

    // Third pass: create combined SD assessments
    for (const [sdBase, scores] of Array.from(sdScores.entries())) {
      const assessment = this.createSummativeAssessment(sdBase, scores);
      if (assessment) {
        const added = this.addAssessment(studentData, assessment);
        if (added) {
          assessmentsAdded++;
          modified = true;
        }
      }
    }

    return { modified, assessmentsAdded };
  }

  /**
   * Process SD sub-scores (P, MYP, C)
   */
  private processSummativeSubScore(
    columnName: string,
    value: string | number | Date | null | undefined,
    subtype: "percentage" | "myp" | "cambridge",
    columnDates: Map<string, string>,
    sdScores: Map<string, { P?: number; MYP?: number; C?: number; date: string }>
  ): boolean {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === "n" ||
      value instanceof Date
    ) {
      return false;
    }

    // Extract SD base (SD1, SD2, SD3)
    const sdBase = columnName.split(" ")[0]; // "SD1 P" -> "SD1"

    if (!sdScores.has(sdBase)) {
      sdScores.set(sdBase, {
        date: columnDates.get(columnName) || this.currentDate,
      });
    }

    const scores = sdScores.get(sdBase)!;
    const numValue = Number(value);

    if (isNaN(numValue)) {
      Logger.warn("Invalid numeric value for SD score", { columnName, value });
      return false;
    }

    switch (subtype) {
      case "percentage":
        scores.P = numValue;
        break;
      case "myp":
        scores.MYP = numValue;
        break;
      case "cambridge":
        scores.C = numValue;
        break;
    }

    return true;
  }

  /**
   * Create a combined summative assessment from SD sub-scores
   */
  private createSummativeAssessment(
    sdBase: string,
    scores: { P?: number; MYP?: number; C?: number; date: string }
  ): AssessmentV3 | null {
    // Only create assessment if at least one score is present
    if (scores.P === undefined && scores.MYP === undefined && scores.C === undefined) {
      return null;
    }

    // Use the first non-undefined score as the main score for display
    const mainScore = scores.P ?? scores.MYP ?? scores.C ?? 0;

    const assessment: AssessmentV3 = {
      date: scores.date,
      column: sdBase, // Use "SD1", "SD2", etc. as column name
      type: "summative",
      task_name: `Summative assessment ${sdBase.replace("SD", "")}`,
      score: String(mainScore),
      comment: "",
      added: this.currentDate,
      summative_details: {
        percentage_score: scores.P,
        max_points: undefined, // Placeholder for future
        myp_score: scores.MYP,
        cambridge_score: scores.C,
      },
    };

    return assessment;
  }

  /**
   * Add assessment to student record with duplicate detection
   * Returns true if added, false if duplicate found
   */
  private addAssessment(studentData: StudentDataV3, assessment: AssessmentV3): boolean {
    // Check for duplicate (same date + column)
    const existingIndex = studentData.assessments.findIndex(
      (existing) => existing.date === assessment.date && existing.column === assessment.column
    );

    if (existingIndex !== -1) {
      // Update existing assessment
      const existing = studentData.assessments[existingIndex];
      studentData.assessments[existingIndex] = {
        ...existing,
        ...assessment,
        updated: this.currentDate,
      };
      Logger.debug("Updated existing assessment", {
        student: `${studentData.first_name} ${studentData.last_name}`,
        column: assessment.column,
        date: assessment.date,
      });
      return false; // Not added, just updated
    }

    // Add new assessment
    studentData.assessments.push(assessment);
    Logger.debug("Added new assessment", {
      student: `${studentData.first_name} ${studentData.last_name}`,
      column: assessment.column,
      date: assessment.date,
    });
    return true;
  }

  /**
   * Find student in data collection by first and last name
   * Resolves name aliases before searching
   */
  findStudent(
    students: StudentDataV3[],
    firstName: string,
    lastName: string,
    className: string
  ): StudentDataV3 | null {
    // Resolve name alias
    const resolved = resolveNameAlias(firstName, lastName, className);

    const student = students.find(
      (s) => s.first_name === resolved.firstName && s.last_name === resolved.lastName
    );

    if (student && (resolved.firstName !== firstName || resolved.lastName !== lastName)) {
      Logger.info("Resolved name alias", {
        excelName: `${firstName} ${lastName}`,
        fullName: `${resolved.firstName} ${resolved.lastName}`,
        className,
      });
    }

    return student || null;
  }

  /**
   * Create a new student record with minimal data (v3 format)
   */
  createNewStudent(
    firstName: string,
    lastName: string,
    className: string,
    id: string
  ): StudentDataV3 {
    const academicYear = "2024-2025";
    const grade = 8;

    return {
      id,
      first_name: firstName,
      last_name: lastName,
      class_name: className,

      academic: {
        year: academicYear,
        grade: grade,
        class_id: className.toLowerCase().replace(/\s+/g, "-"),
        enrolled_date: `${academicYear.split("-")[0]}-09-01`,
      },

      profile: {
        learning_attributes: {
          writing_quality: "developing" as LearningLevel,
          notebook_organization: "developing" as LearningLevel,
          reflective_practice: "developing" as LearningLevel,
          math_communication: "developing" as LearningLevel,
          seeks_tutoring: false,
        },
        notes: {
          strengths: [],
          challenges: [],
          interests: [],
        },
      },

      assessments: [],

      curriculum_progress: {
        cambridge_objectives: {},
        material_completion: {},
      },

      engagement: {
        attendance_records: [],
        attendance_notes: [],
        consultations: [],
        social_hours: 0,
      },

      cambridge_tests: [],

      metadata: {
        schema_version: "3.0",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }
}
