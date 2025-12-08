/**
 * PD and KD Assessment Mappings for Cambridge Learning Objectives
 *
 * PD (Papildomas Darbas / Additional Work):
 * - Custom assessments for specific learning objectives
 * - GLOBAL mapping: PD1 always tests the same objective(s) for ALL students
 *
 * KD (Cambridge Unit Tests):
 * - Future summative assessments
 * - Each KD tests multiple objectives with separate C columns
 */

/**
 * PD Mappings - Global per objective
 * Format: PD number -> Array of Cambridge objective codes it tests
 */
export const PD_MAPPINGS: { [key: string]: string[] } = {
  // Unit 1: Number - Integers
  PD1: ["9Ni.01", "9Ni.04"],
  PD2: ["9Ni.03"],
  PD3: ["9Ni.02"],

  // Unit 2: Algebra - Expressions
  PD4: ["9Ae.01"],
  PD5: ["9Ae.03"],
  PD6: ["9Ae.02"],
  PD7: ["9Ae.04"],
  PD12: ["9Ae.05"],
  PD13: ["9Ae.06"],
  PD14: ["9Ae.07"],

  // Unit 3: Number - Probability
  PD8: ["9Np.01"],
  PD9: ["9NF.06"],
  PD10: ["9NF.05"],
  PD11: ["9Np.02"],

  // Unit 5: Geometry - Graphs
  PD15: ["9Gg.09"],
  PD16: ["9Gg.07"],
  PD17: ["9Gg.08"],
  PD18: ["9Gg.11"],
  PD19: ["9Gg.10"],

  // Unit 6: Statistics
  PD20: ["9Ss.01"],
  PD21: ["9Ss.05"],
  PD22: ["9Ss.02"],
  PD52: ["9Ss.03"],
  PD53: ["9Ss.05"],
  PD54: ["9Ss.04"],

  // Unit 7: Geometry - Graphs (continued)
  PD23: ["9Gg.01"],
  PD24: ["9Gg.02"],
  PD25: ["9Gg.03"],

  // Unit 8: Number - Fractions
  PD26: ["9NF.01"],
  PD27: ["9NF.02"],
  PD28: ["9NF.03"],
  PD36: ["9NF.08"],
  PD37: ["9NF.07"],

  // Unit 9: Algebra - Sequences
  PD29: ["9As.01"],
  PD30: ["9As.02"],
  PD31: ["9As.03"],
  PD32: ["9As.04"],
  PD33: ["9As.05"],
  PD34: ["9As.06"],
  PD35: ["9As.07"],

  // Unit 12: Space
  PD38: ["9Sp.01"],
  PD39: ["9Sp.02"],
  PD40: ["9Sp.03"],
  PD41: ["9Sp.04"],

  // Unit 13: Geometry - Properties
  PD42: ["9Gp.01"],
  PD43: ["9Gp.02"],
  PD44: ["9Gp.03"],
  PD45: ["9Gp.04"],
  PD46: ["9Gp.05"],
  PD47: ["9Gp.06"],
  PD48: ["9Gp.07"],

  // Unit 14: Geometry - Graphs (final)
  PD49: ["9Gg.04"],
  PD50: ["9Gg.05"],
  PD51: ["9Gg.06"],
};

/**
 * KD Mappings - Future summative assessments
 * Format: KD number -> Array of Cambridge objective codes it tests
 */
export const KD_MAPPINGS: { [key: string]: string[] } = {
  KD1: ["9Ni.01", "9Ni.02", "9Ni.03"],
  KD2: ["9Ae.01", "9Ae.02", "9Ae.03", "9Ae.04"],
  KD3: ["9Np.01", "9NF.06", "9NF.05", "9Np.02"],
  KD4: ["9Ae.05", "9Ae.06", "9Ae.07"],
  KD5: ["9Gg.09", "9Gg.07", "9Gg.08", "9Gg.11", "9Gg.10"],
  KD6: ["9Ss.01", "9Ss.02", "9Ss.05"],
  KD7: ["9Gg.01", "9Gg.02", "9Gg.03"],
  KD8: ["9NF.01", "9NF.02", "9NF.03"],
  KD9: ["9As.01", "9As.02", "9As.03"],
  KD10: ["9As.04", "9As.05", "9As.06", "9As.07"],
  KD11: ["9NF.08", "9NF.07"],
  KD12: ["9Sp.01", "9Sp.02", "9Sp.03", "9Sp.04"],
  KD13: ["9Gp.01", "9Gp.02", "9Gp.03", "9Gp.04", "9Gp.05", "9Gp.06", "9Gp.07"],
  KD14: ["9Gg.04", "9Gg.05", "9Gg.06"],
  KD15: ["9Ss.03", "9Ss.04"],
};

/**
 * Get Cambridge objectives tested by a PD assessment
 * @param pdNumber PD number (e.g., "PD1", "PD15")
 * @returns Array of Cambridge objective codes
 */
export function getObjectivesForPD(pdNumber: string): string[] {
  return PD_MAPPINGS[pdNumber] || [];
}

/**
 * Get Cambridge objectives tested by a KD assessment
 * @param kdNumber KD number (e.g., "KD1", "KD3")
 * @returns Array of Cambridge objective codes
 */
export function getObjectivesForKD(kdNumber: string): string[] {
  return KD_MAPPINGS[kdNumber] || [];
}

/**
 * Find which PD assessment tests a specific objective
 * @param objectiveCode Cambridge objective code (e.g., "9Ni.01")
 * @returns PD number or null if not found
 */
export function getPDForObjective(objectiveCode: string): string | null {
  for (const [pd, objectives] of Object.entries(PD_MAPPINGS)) {
    if (objectives.includes(objectiveCode)) {
      return pd;
    }
  }
  return null;
}

/**
 * Find which KD assessment tests a specific objective
 * @param objectiveCode Cambridge objective code (e.g., "9Ni.01")
 * @returns KD number or null if not found
 */
export function getKDForObjective(objectiveCode: string): string | null {
  for (const [kd, objectives] of Object.entries(KD_MAPPINGS)) {
    if (objectives.includes(objectiveCode)) {
      return kd;
    }
  }
  return null;
}

/**
 * Get all PD assessments
 * @returns Array of PD numbers
 */
export function getAllPDs(): string[] {
  return Object.keys(PD_MAPPINGS).sort((a, b) => {
    const numA = parseInt(a.replace("PD", ""));
    const numB = parseInt(b.replace("PD", ""));
    return numA - numB;
  });
}

/**
 * Get all KD assessments
 * @returns Array of KD numbers
 */
export function getAllKDs(): string[] {
  return Object.keys(KD_MAPPINGS).sort((a, b) => {
    const numA = parseInt(a.replace("KD", ""));
    const numB = parseInt(b.replace("KD", ""));
    return numA - numB;
  });
}

/**
 * Check if a PD assessment exists
 * @param pdNumber PD number
 * @returns True if PD mapping exists
 */
export function pdExists(pdNumber: string): boolean {
  return pdNumber in PD_MAPPINGS;
}

/**
 * Check if a KD assessment exists
 * @param kdNumber KD number
 * @returns True if KD mapping exists
 */
export function kdExists(kdNumber: string): boolean {
  return kdNumber in KD_MAPPINGS;
}
