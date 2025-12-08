import { StudentData, Assessment } from "../types/ProgressReportTypes";

/**
 * Get the latest assessment score for a specific column
 * @param student - Student data
 * @param columnName - Assessment column name (e.g., 'KD', 'KD1', 'ND1')
 * @returns The score as a string, or null if not found
 */
export const getAssessmentScore = (student: StudentData, columnName: string): string | null => {
  if (!student.assessments) return null;

  const assessments = student.assessments.filter(
    (a) => a.column?.toUpperCase() === columnName.toUpperCase()
  );

  if (assessments.length === 0) return null;

  // Sort by date descending and get the latest
  assessments.sort((a, b) => b.date.localeCompare(a.date));
  return assessments[0].score;
};

/**
 * Get all assessments for a specific column across all students
 * @param students - Array of student data
 * @param columnName - Assessment column name
 * @returns Array of assessments
 */
export const getAssessmentsByColumn = (
  students: StudentData[],
  columnName: string
): Assessment[] => {
  const assessments: Assessment[] = [];

  students.forEach((student) => {
    if (!student.assessments) return;

    const studentAssessments = student.assessments.filter(
      (a) => a.column?.toUpperCase() === columnName.toUpperCase()
    );
    assessments.push(...studentAssessments);
  });

  return assessments;
};

/**
 * Get the latest assessment for a specific column
 * @param student - Student data
 * @param columnName - Assessment column name
 * @returns The latest assessment object, or null if not found
 */
export const getLatestAssessment = (
  student: StudentData,
  columnName: string
): Assessment | null => {
  if (!student.assessments) return null;

  const assessments = student.assessments.filter(
    (a) => a.column?.toUpperCase() === columnName.toUpperCase()
  );

  if (assessments.length === 0) return null;

  // Sort by date descending and get the latest
  assessments.sort((a, b) => b.date.localeCompare(a.date));
  return assessments[0];
};

/**
 * Format assessment score for display
 * Handles special cases like '?', 'n', etc.
 * @param score - Raw score string
 * @returns Formatted score for display
 */
export const formatAssessmentScore = (score: string | null): string => {
  if (!score) return "-";
  if (score === "?" || score === "n") return score;

  const numScore = parseFloat(score);
  if (isNaN(numScore)) return score;

  return numScore.toString();
};

/**
 * Convert homework score to appropriate display format
 * @param score - Score string
 * @param type - Assessment type (homework, homework_graded, homework_reflection)
 * @returns Formatted score for display
 */
export const formatHomeworkCompletion = (score: string | null, _type?: string): string => {
  if (!score) return "-";
  if (score === "?" || score === "n") return score;

  const numScore = parseFloat(score);
  if (isNaN(numScore)) return score;

  // For all homework types, just show the numeric value as-is
  return numScore.toString();
};

/**
 * Get unique assessment columns from all students
 * @param students - Array of student data
 * @returns Array of unique column names
 */
export const getUniqueAssessmentColumns = (students: StudentData[]): string[] => {
  const columns = new Set<string>();

  students.forEach((student) => {
    if (!student.assessments) return;

    student.assessments.forEach((assessment) => {
      if (assessment.column) {
        columns.add(assessment.column);
      }
    });
  });

  return Array.from(columns).sort();
};

/**
 * Get assessment columns by type
 * @param students - Array of student data
 * @param type - Assessment type
 * @returns Array of column names of that type
 */
export const getAssessmentColumnsByType = (students: StudentData[], type: string): string[] => {
  const columns = new Set<string>();

  students.forEach((student) => {
    if (!student.assessments) return;

    student.assessments.forEach((assessment) => {
      if (assessment.type === type && assessment.column) {
        columns.add(assessment.column);
      }
    });
  });

  return Array.from(columns).sort();
};

/**
 * Get the latest assessment score by assessment_id
 * @param student - Student data
 * @param assessmentId - Assessment ID (e.g., 'homework-nd1', 'test-u1s1-irrational-numbers')
 * @returns The score as a string, or null if not found
 */
export const getAssessmentScoreById = (
  student: StudentData,
  assessmentId: string
): string | null => {
  if (!student.assessments) return null;

  const assessments = student.assessments.filter((a) => a.assessment_id === assessmentId);

  if (assessments.length === 0) return null;

  // Sort by date descending and get the latest
  assessments.sort((a, b) => b.date.localeCompare(a.date));
  return assessments[0].score;
};

/**
 * Get the latest assessment by assessment_id
 * @param student - Student data
 * @param assessmentId - Assessment ID
 * @returns The latest assessment object, or null if not found
 */
export const getLatestAssessmentById = (
  student: StudentData,
  assessmentId: string
): Assessment | null => {
  if (!student.assessments) return null;

  const assessments = student.assessments.filter((a) => a.assessment_id === assessmentId);

  if (assessments.length === 0) return null;

  // Sort by date descending and get the latest
  assessments.sort((a, b) => b.date.localeCompare(a.date));
  return assessments[0];
};

/**
 * Get all assessments by assessment_id across all students
 * @param students - Array of student data
 * @param assessmentId - Assessment ID
 * @returns Array of assessments
 */
export const getAssessmentsById = (students: StudentData[], assessmentId: string): Assessment[] => {
  const assessments: Assessment[] = [];

  students.forEach((student) => {
    if (!student.assessments) return;

    const studentAssessments = student.assessments.filter((a) => a.assessment_id === assessmentId);
    assessments.push(...studentAssessments);
  });

  return assessments;
};

/**
 * Get unique assessment IDs and their titles
 * @param students - Array of student data
 * @param types - Optional array of types to filter by
 * @returns Array of objects with assessment_id and assessment_title
 */
export const getUniqueAssessments = (
  students: StudentData[],
  types?: string[]
): Array<{ id: string; title: string; type: string }> => {
  const assessmentMap = new Map<string, { id: string; title: string; type: string }>();

  students.forEach((student) => {
    if (!student.assessments) return;

    student.assessments.forEach((assessment) => {
      if (assessment.assessment_id && assessment.assessment_title) {
        // Filter by type if specified
        if (types && !types.includes(assessment.type)) {
          return;
        }

        if (!assessmentMap.has(assessment.assessment_id)) {
          assessmentMap.set(assessment.assessment_id, {
            id: assessment.assessment_id,
            title: assessment.assessment_title,
            type: assessment.type,
          });
        }
      }
    });
  });

  return Array.from(assessmentMap.values());
};
