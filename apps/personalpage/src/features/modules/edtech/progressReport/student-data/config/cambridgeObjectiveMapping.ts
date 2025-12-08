/**
 * Cambridge Learning Objective Assessment Mapping
 *
 * Maps which assessments (KD/SD) test which Cambridge objectives.
 * Used to track objective mastery history and update scores when processing assessments.
 */

export interface ObjectiveMapping {
  [assessmentId: string]: string[];
}

/**
 * Detailed mapping of SD/KD assessments to specific Cambridge objectives
 * Format: Assessment ID -> { C1: objective, C2: objective, C: objective }
 */
export interface DetailedObjectiveMapping {
  [assessmentId: string]: {
    C?: string; // Single Cambridge score
    C1?: string; // Cambridge score 1
    C2?: string; // Cambridge score 2
  };
}

/**
 * Detailed SD assessment to Cambridge objectives mapping
 * Maps which specific C column (C, C1, C2) tests which objective
 */
export const SD_DETAILED_MAPPING: DetailedObjectiveMapping = {
  SD1: { C1: "9Ni.01", C2: "9Ni.04" },
  SD2: { C: "9Ni.03" },
  SD3: { C: "9Ni.02" },
  SD4: { C: "9Ae.01" },
  SD5: { C: "9Ae.03" },
  SD6: { C: "9Ae.02" },
  SD7: { C: "9Ae.02" },
  SD8: { C: "9Ae.02" },
  SD9: { C: "9Ae.04" },
};

/**
 * Assessment to Cambridge Objectives mapping
 * Format: Assessment ID -> Array of Cambridge objective codes it tests
 */
export const ASSESSMENT_OBJECTIVE_MAPPING: ObjectiveMapping = {
  // KD Assessments (Cambridge Unit Tests)
  KD1: ["9Ni.01", "9Ni.02", "9Ni.03", "9Ni.04"],
  KD2: ["9Ae.01", "9Ae.02", "9Ae.03", "9Ae.04"],

  // SD Assessments (Summative Assessments)
  SD1: ["9Ni.01", "9Ni.04"],
  SD2: ["9Ni.03"],
  SD3: ["9Ni.02"],
  SD4: ["9Ae.01"],
  SD5: ["9Ae.03"],
  SD6: ["9Ae.02"],
  SD7: ["9Ae.02"],
  SD8: ["9Ae.02"],
  SD9: ["9Ae.04"],

  // Future assessments will be added here as they are created
};

/**
 * Get all assessments that test a specific Cambridge objective
 * @param objectiveCode Cambridge objective code (e.g., "9Ni.01")
 * @returns Array of assessment IDs that test this objective
 */
export function getAssessmentsForObjective(objectiveCode: string): string[] {
  const assessments: string[] = [];

  for (const [assessmentId, objectives] of Object.entries(ASSESSMENT_OBJECTIVE_MAPPING)) {
    if (objectives.includes(objectiveCode)) {
      assessments.push(assessmentId);
    }
  }

  return assessments;
}

/**
 * Get the specific Cambridge score field for an objective from an assessment
 * @param assessmentId Assessment ID (e.g., "SD1", "SD2")
 * @param objectiveCode Cambridge objective code (e.g., "9Ni.01")
 * @returns Field name ('cambridge_score', 'cambridge_score_1', 'cambridge_score_2') or null
 */
export function getCambridgeScoreField(assessmentId: string, objectiveCode: string): string | null {
  const mapping = SD_DETAILED_MAPPING[assessmentId];
  if (!mapping) return null;

  if (mapping.C === objectiveCode) return "cambridge_score";
  if (mapping.C1 === objectiveCode) return "cambridge_score_1";
  if (mapping.C2 === objectiveCode) return "cambridge_score_2";

  return null;
}

/**
 * Get all Cambridge objectives tested by a specific assessment
 * @param assessmentId Assessment ID (e.g., "KD1", "SD5")
 * @returns Array of Cambridge objective codes tested by this assessment
 */
export function getObjectivesForAssessment(assessmentId: string): string[] {
  return ASSESSMENT_OBJECTIVE_MAPPING[assessmentId] || [];
}

/**
 * Check if an assessment tests Cambridge objectives
 * @param assessmentId Assessment ID
 * @returns True if assessment has Cambridge objective mapping
 */
export function assessmentHasObjectives(assessmentId: string): boolean {
  return assessmentId in ASSESSMENT_OBJECTIVE_MAPPING;
}

/**
 * All Cambridge objective codes present in the curriculum
 * Extracted from _C sheets (Stage 9 objectives)
 */
export const ALL_CAMBRIDGE_OBJECTIVES = [
  // Number: Integers
  "9Ni.01",
  "9Ni.02",
  "9Ni.03",
  "9Ni.04",

  // Algebra: Expressions
  "9Ae.01",
  "9Ae.02",
  "9Ae.03",
  "9Ae.04",
  "9Ae.05",
  "9Ae.06",
  "9Ae.07",

  // Number: Probability
  "9Np.01",
  "9Np.02",

  // Number: Fractions
  "9NF.01",
  "9NF.02",
  "9NF.03",
  "9NF.05",
  "9NF.06",
  "9NF.07",
  "9NF.08",

  // Algebra: Sequences
  "9As.01",
  "9As.02",
  "9As.03",
  "9As.04",
  "9As.05",
  "9As.06",
  "9As.07",

  // Statistics
  "9Ss.01",
  "9Ss.02",
  "9Ss.03",
  "9Ss.04",
  "9Ss.05",

  // Space/Geometry
  "9Sp.01",
  "9Sp.02",
  "9Sp.03",
  "9Sp.04",

  // Geometry: Properties
  "9Gp.01",
  "9Gp.02",
  "9Gp.03",
  "9Gp.04",
  "9Gp.05",
  "9Gp.06",
  "9Gp.07",

  // Geometry: Graphs
  "9Gg.01",
  "9Gg.02",
  "9Gg.03",
  "9Gg.04",
  "9Gg.05",
  "9Gg.06",
  "9Gg.07",
  "9Gg.08",
  "9Gg.09",
  "9Gg.10",
  "9Gg.11",
];

/**
 * Cambridge objective strand categories for grouping and filtering
 */
export const CAMBRIDGE_OBJECTIVE_STRANDS = {
  "Number: Integers": ["9Ni.01", "9Ni.02", "9Ni.03", "9Ni.04"],
  "Number: Fractions": ["9NF.01", "9NF.02", "9NF.03", "9NF.05", "9NF.06", "9NF.07", "9NF.08"],
  "Number: Probability": ["9Np.01", "9Np.02"],
  "Algebra: Expressions": ["9Ae.01", "9Ae.02", "9Ae.03", "9Ae.04", "9Ae.05", "9Ae.06", "9Ae.07"],
  "Algebra: Sequences": ["9As.01", "9As.02", "9As.03", "9As.04", "9As.05", "9As.06", "9As.07"],
  "Geometry: Graphs": [
    "9Gg.01",
    "9Gg.02",
    "9Gg.03",
    "9Gg.04",
    "9Gg.05",
    "9Gg.06",
    "9Gg.07",
    "9Gg.08",
    "9Gg.09",
    "9Gg.10",
    "9Gg.11",
  ],
  "Geometry: Properties": ["9Gp.01", "9Gp.02", "9Gp.03", "9Gp.04", "9Gp.05", "9Gp.06", "9Gp.07"],
  Space: ["9Sp.01", "9Sp.02", "9Sp.03", "9Sp.04"],
  Statistics: ["9Ss.01", "9Ss.02", "9Ss.03", "9Ss.04", "9Ss.05"],
};

/**
 * Get strand name for a Cambridge objective
 * @param objectiveCode Cambridge objective code
 * @returns Strand name or "Unknown" if not found
 */
export function getStrandForObjective(objectiveCode: string): string {
  for (const [strand, objectives] of Object.entries(CAMBRIDGE_OBJECTIVE_STRANDS)) {
    if (objectives.includes(objectiveCode)) {
      return strand;
    }
  }
  return "Unknown";
}

/**
 * Mapping of Cambridge objectives to teaching units
 * Some objectives are taught in multiple units
 */
export const OBJECTIVE_TO_UNIT_MAPPING: { [key: string]: string[] } = {
  "9Ni.01": ["1.1"],
  "9Ni.04": ["1.1"],
  "9Ni.03": ["1.2"],
  "9Ni.02": ["1.3"],

  "9Ae.01": ["2.1"],
  "9Ae.03": ["2.2"],
  "9Ae.02": ["2.3", "2.4", "2.5"],
  "9Ae.04": ["2.6"],

  "9Np.01": ["3.1"],
  "9Np.06": ["3.2"],
  "9Np.05": ["3.3"],
  "9Np.02": ["3.4"],

  "9Ae.05": ["4.1"],
  "9Ae.06": ["4.2"],
  "9Ae.07": ["4.3"],

  "9Gg.09": ["5.1"],
  "9Gg.07": ["5.2"],
  "9Gg.08": ["5.3"],
  "9Gg.11": ["5.4"],
  "9Gg.10": ["5.5"],

  "9Ss.01": ["6.1"],
  "9Ss.05": ["6.1", "6.2", "15.2"],
  "9Ss.02": ["6.2"],

  "9Gg.01": ["7.1"],
  "9Gg.02": ["7.3"],
  "9Gg.03": ["7.2"],

  "9NF.01": ["8.1"],
  "9NF.02": ["8.2"],
  "9NF.03": ["8.3", "8.4"],
  "9NF.04": ["8.5"],

  "9As.01": ["9.1"],
  "9As.02": ["9.2"],
  "9As.03": ["9.3"],

  "9As.04": ["10.1"],
  "9As.05": ["10.2"],
  "9As.06": ["10.3"],
  "9As.07": ["10.4"],

  "9NF.08": ["11.1"],
  "9NF.07": ["11.2"],

  "9Sp.01": ["12.1"],
  "9Sp.02": ["12.2"],
  "9Sp.03": ["12.3"],
  "9Sp.04": ["12.4"],

  "9Gp.01": ["13.1"],
  "9Gp.02": ["13.2"],
  "9Gp.03": ["13.3"],
  "9Gp.04": ["13.3"],
  "9Gp.05": ["13.3"],
  "9Gp.06": ["13.4"],
  "9Gp.07": ["13.4"],

  "9Gg.04": ["14.1"],
  "9Gg.05": ["14.2"],
  "9Gg.06": ["14.3"],

  "9Ss.03": ["15.1", "15.2", "15.3", "15.5"],
  "9Ss.04": ["15.4"],
};

/**
 * Get the teaching unit(s) for a Cambridge objective
 * @param objectiveCode Cambridge objective code
 * @returns Array of unit codes (e.g., ["1.1"] or ["2.3", "2.4", "2.5"])
 */
export function getUnitsForObjective(objectiveCode: string): string[] {
  return OBJECTIVE_TO_UNIT_MAPPING[objectiveCode] || [];
}
