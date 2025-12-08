/**
 * Column mapping configuration for Excel data import
 *
 * NOTE: Most columns (EXT, ND, SD, LNT, KD, D) are now detected dynamically
 * using pattern matching in dynamicColumnMapper.ts
 *
 * This file only contains special/legacy columns that don't follow patterns
 */

import { ColumnMapping } from "../types/StudentDataTypes";

/**
 * Static column mappings for special/legacy columns
 * Dynamic columns (EXT\d+, ND\d+, SD\d+, LNT\d+, etc.) are handled by dynamicColumnMapper
 */
export const SUMMATIVE_SHEET_COLUMNS: ColumnMapping = {
  // Special needs or specification column (DEPRECATED - no longer used)
  SPEC: {
    type: "participation",
    task_name: "Special designation",
    description: "Special student designation or specification (DEPRECATED)",
  },

  // Legacy homework columns (old format)
  ND: {
    type: "homework",
    task_name: "Homework",
    description: "Homework completion (legacy format)",
  },

  "ND K": {
    type: "comment",
    parent_column: "ND",
    description: "Comment for homework (legacy format)",
  },

  // Consultations (KONS1-5) - V4: Mapped to classwork since 'consultation' is not a valid AssessmentType
  KONS1: {
    type: "classwork",
    task_name: "Consultation 1",
    description: "Consultation attendance 1",
  },
  KONS2: {
    type: "classwork",
    task_name: "Consultation 2",
    description: "Consultation attendance 2",
  },
  KONS3: {
    type: "classwork",
    task_name: "Consultation 3",
    description: "Consultation attendance 3",
  },
  KONS4: {
    type: "classwork",
    task_name: "Consultation 4",
    description: "Consultation attendance 4",
  },
  KONS5: {
    type: "classwork",
    task_name: "Consultation 5",
    description: "Consultation attendance 5",
  },

  // Social hours
  SOC: {
    type: "social_hours",
    task_name: "Social hours",
    description: "Social hours collected in minutes",
  },

  // Cumulative board points (not processed as assessment, just metadata)
  LNT: {
    type: "participation",
    task_name: "Board solving (cumulative)",
    description: "Cumulative board solving points",
  },
};

/**
 * Class sheet name mapping (Excel sheet names to display class names)
 */
export const CLASS_SHEET_MAPPING: { [key: string]: string } = {
  Vyd_S: "8 Vydūnas",
  Grei_S: "8 A. J. Greimas",
  Gim_S: "8 M. A. Gimbutienė",
  Vei_S: "8 I. Veisaitė",
};

/**
 * Standard column names that should be present in all sheets
 */
export const STANDARD_COLUMNS = {
  FIRST_NAME: "Vardas",
  LAST_NAME: "Pavardė",
  ID: "ID",
};
