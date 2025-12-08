import { StudentData, Assessment } from "../types/ProgressReportTypes";

/**
 * Get the latest KD (summative) assessment for a student
 */
export const getLatestKDAssessment = (student: StudentData): Assessment | null => {
  if (!student.assessments) return null;

  const kdAssessments = student.assessments.filter(
    (a) => a.column?.toUpperCase().includes("KD") || a.type === "summative"
  );

  if (kdAssessments.length === 0) return null;

  // Sort by date descending and get the latest
  kdAssessments.sort((a, b) => b.date.localeCompare(a.date));
  return kdAssessments[0];
};

/**
 * Calculate average KD (summative) assessment score
 */
export const calculateKDAverage = (student: StudentData): number => {
  if (!student.assessments) return 0;

  const kdAssessments = student.assessments.filter(
    (a) => a.column?.toUpperCase().includes("KD") || a.type === "summative"
  );

  const scores = kdAssessments.map((a) => parseFloat(a.score)).filter((score) => !isNaN(score));

  if (scores.length === 0) return 0;

  return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10;
};

/**
 * Get the latest ND1 homework assessment for a student
 * ND1 is specifically the first homework column (not ND2, ND4, etc.)
 */
export const getLatestND1Assessment = (student: StudentData): Assessment | null => {
  if (!student.assessments) return null;

  const nd1Assessments = student.assessments.filter((a) => a.column?.toUpperCase() === "ND1");

  if (nd1Assessments.length === 0) return null;

  // Sort by date descending and get the latest
  nd1Assessments.sort((a, b) => b.date.localeCompare(a.date));
  return nd1Assessments[0];
};

/**
 * Calculate ND1 homework completion rate (percentage)
 * ND1 uses on_time/completed_on_time field (0 or 1), where: 0 = 0% complete, 1 = 100% complete
 * This calculates the average completion rate across all ND1 assessments
 */
export const calculateND1CompletionRate = (student: StudentData): number => {
  if (!student.assessments) return 0;

  const nd1Assessments = student.assessments.filter((a) => a.column?.toUpperCase() === "ND1");

  if (nd1Assessments.length === 0) return 0;

  // Use on_time/completed_on_time if available, otherwise fall back to score
  const completionValues = nd1Assessments
    .map((a) => {
      // Check on_time field first (V5 structure)
      if (a.on_time !== undefined && a.on_time !== null) {
        return a.on_time;
      }

      // Check completed_on_time field (V5 structure)
      if (a.completed_on_time !== undefined && a.completed_on_time !== null) {
        return a.completed_on_time;
      }

      // Fall back to score field (legacy structure)
      const score = parseFloat(a.score);
      return isNaN(score) ? null : score;
    })
    .filter((val) => val !== null) as number[];

  if (completionValues.length === 0) return 0;

  // Calculate average (values are 0 or 1) and convert to percentage
  const avgCompletion =
    completionValues.reduce((sum, val) => sum + val, 0) / completionValues.length;

  // Convert to percentage (0-1 range becomes 0-100%)
  return Math.round(avgCompletion * 100 * 10) / 10;
};

/**
 * Get all KD assessments for chart data
 */
export const getAllKDAssessments = (students: StudentData[]): Assessment[] => {
  const allAssessments: Assessment[] = [];

  students.forEach((student) => {
    if (!student.assessments) return;

    const kdAssessments = student.assessments.filter(
      (a) => a.column?.toUpperCase().includes("KD") || a.type === "summative"
    );
    allAssessments.push(...kdAssessments);
  });

  return allAssessments;
};

/**
 * Get all ND1 assessments for chart data
 */
export const getAllND1Assessments = (students: StudentData[]): Assessment[] => {
  const allAssessments: Assessment[] = [];

  students.forEach((student) => {
    if (!student.assessments) return;

    const nd1Assessments = student.assessments.filter((a) => a.column?.toUpperCase() === "ND1");
    allAssessments.push(...nd1Assessments);
  });

  return allAssessments;
};
