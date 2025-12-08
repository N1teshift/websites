import { useState, useCallback, useEffect, useMemo } from "react";
import { StudentData } from "../types/ProgressReportTypes";
import { getLatestAssessmentById } from "../utils/assessmentColumnUtils";
import { ScoreType } from "../utils/processing/studentSortComparators";

export interface CellEdit {
  studentKey: string;
  assessmentId: string;
  scoreType: ScoreType;
  newValue: string;
}

interface UseInlineEditingOptions {
  students: StudentData[];
  onDataChange?: (updatedStudents: StudentData[]) => void;
  onPendingEditsChange?: (hasPendingEdits: boolean) => void;
}

interface UseInlineEditingReturn {
  pendingEdits: Map<string, CellEdit>;
  editingCell: string | null;
  setEditingCell: (key: string | null) => void;
  handleCellEdit: (
    studentKey: string,
    assessmentId: string,
    scoreType: ScoreType,
    newValue: string
  ) => void;
  handleSaveChanges: () => void;
  handleDiscardChanges: () => void;
  getCellValue: (student: StudentData, assessmentId: string, scoreType: ScoreType) => string;
  hasPendingEdits: boolean;
}

export function useInlineEditing({
  students,
  onDataChange,
  onPendingEditsChange,
}: UseInlineEditingOptions): UseInlineEditingReturn {
  const [pendingEdits, setPendingEdits] = useState<Map<string, CellEdit>>(new Map());
  const [editingCell, setEditingCell] = useState<string | null>(null);

  const hasPendingEdits = pendingEdits.size > 0;

  // Notify parent when pending edits change
  useEffect(() => {
    if (onPendingEditsChange) {
      onPendingEditsChange(hasPendingEdits);
    }
  }, [hasPendingEdits, onPendingEditsChange]);

  // Compute which assessments have any scores (should display score instead of on_time)
  // This is for ND homework: if all students have empty score, show on_time; otherwise show score
  const assessmentsWithScores = useMemo(() => {
    const hasScores = new Set<string>();

    for (const student of students) {
      if (!student.assessments) continue;

      for (const assessment of student.assessments) {
        if (!assessment.assessment_id) continue;

        // Check if this assessment has a non-empty score
        if (assessment.score && assessment.score !== "" && assessment.score !== null) {
          hasScores.add(assessment.assessment_id);
        }
      }
    }

    return hasScores;
  }, [students]);

  const handleCellEdit = useCallback(
    (studentKey: string, assessmentId: string, scoreType: ScoreType, newValue: string) => {
      const editKey = `${studentKey}-${assessmentId}-${scoreType || "default"}`;
      setPendingEdits((prev) => {
        const newEdits = new Map(prev);
        newEdits.set(editKey, {
          studentKey,
          assessmentId,
          scoreType,
          newValue: newValue.trim(),
        });
        return newEdits;
      });
    },
    []
  );

  const handleSaveChanges = useCallback(() => {
    if (pendingEdits.size === 0) return;

    const updatedStudents = students.map((student) => {
      const studentKey = `${student.first_name}-${student.last_name}`;

      const studentEdits = Array.from(pendingEdits.values()).filter(
        (edit) => edit.studentKey === studentKey
      );

      if (studentEdits.length === 0) return student;

      const updatedAssessments = (student.assessments || []).map((assessment) => {
        // Find all edits for this assessment
        const assessmentEdits = studentEdits.filter(
          (edit) => edit.assessmentId === assessment.assessment_id
        );

        if (assessmentEdits.length === 0) return assessment;

        // Apply all edits to this assessment
        const updatedAssessment = { ...assessment };
        let evalDetails = assessment.evaluation_details || {
          percentage_score: null,
          myp_score: null,
          cambridge_score: null,
          cambridge_score_1: null,
          cambridge_score_2: null,
        };

        for (const edit of assessmentEdits) {
          if (edit.scoreType) {
            // Handle score-type specific edits
            if (edit.newValue === "") {
              // Delete the score
              if (edit.scoreType === "percentage") {
                evalDetails = { ...evalDetails, percentage_score: null };
                updatedAssessment.score = "";
              } else if (edit.scoreType === "myp") {
                evalDetails = { ...evalDetails, myp_score: null };
              } else if (edit.scoreType === "cambridge") {
                evalDetails = { ...evalDetails, cambridge_score: null };
              } else if (edit.scoreType === "cambridge_1") {
                evalDetails = { ...evalDetails, cambridge_score_1: null };
              } else if (edit.scoreType === "cambridge_2") {
                evalDetails = { ...evalDetails, cambridge_score_2: null };
              } else if (edit.scoreType === "paper1") {
                updatedAssessment.paper1_score = null;
              } else if (edit.scoreType === "paper2") {
                updatedAssessment.paper2_score = null;
              } else if (edit.scoreType === "paper3") {
                updatedAssessment.paper3_score = null;
              } else if (edit.scoreType === "lis1") {
                updatedAssessment.lis1 = null;
              } else if (edit.scoreType === "lis2") {
                updatedAssessment.lis2 = null;
              } else if (edit.scoreType === "read") {
                updatedAssessment.read = null;
              } else if (edit.scoreType === "voc1") {
                updatedAssessment.voc1 = null;
              } else if (edit.scoreType === "voc2") {
                updatedAssessment.voc2 = null;
              } else if (edit.scoreType === "gr1") {
                updatedAssessment.gr1 = null;
              } else if (edit.scoreType === "gr2") {
                updatedAssessment.gr2 = null;
              } else if (edit.scoreType === "gr3") {
                updatedAssessment.gr3 = null;
              }
            } else {
              // Update the score
              const numValue = parseFloat(edit.newValue);

              if (!isNaN(numValue)) {
                if (edit.scoreType === "percentage") {
                  evalDetails = { ...evalDetails, percentage_score: numValue };
                  updatedAssessment.score = edit.newValue;
                } else if (edit.scoreType === "myp") {
                  evalDetails = { ...evalDetails, myp_score: numValue };
                } else if (edit.scoreType === "cambridge") {
                  evalDetails = { ...evalDetails, cambridge_score: numValue };
                } else if (edit.scoreType === "cambridge_1") {
                  evalDetails = { ...evalDetails, cambridge_score_1: numValue };
                } else if (edit.scoreType === "cambridge_2") {
                  evalDetails = { ...evalDetails, cambridge_score_2: numValue };
                } else if (edit.scoreType === "paper1") {
                  updatedAssessment.paper1_score = numValue;
                } else if (edit.scoreType === "paper2") {
                  updatedAssessment.paper2_score = numValue;
                } else if (edit.scoreType === "paper3") {
                  updatedAssessment.paper3_score = numValue;
                } else if (edit.scoreType === "lis1") {
                  updatedAssessment.lis1 = numValue;
                } else if (edit.scoreType === "lis2") {
                  updatedAssessment.lis2 = numValue;
                } else if (edit.scoreType === "read") {
                  updatedAssessment.read = numValue;
                } else if (edit.scoreType === "voc1") {
                  updatedAssessment.voc1 = numValue;
                } else if (edit.scoreType === "voc2") {
                  updatedAssessment.voc2 = numValue;
                } else if (edit.scoreType === "gr1") {
                  updatedAssessment.gr1 = numValue;
                } else if (edit.scoreType === "gr2") {
                  updatedAssessment.gr2 = numValue;
                } else if (edit.scoreType === "gr3") {
                  updatedAssessment.gr3 = numValue;
                }
              }
            }
          } else {
            // Handle regular score edits (no scoreType)
            updatedAssessment.score = edit.newValue === "" ? "" : edit.newValue;
          }
        }

        return {
          ...updatedAssessment,
          evaluation_details: evalDetails,
          updated: new Date().toISOString(),
        };
      });

      return { ...student, assessments: updatedAssessments };
    });

    if (onDataChange) {
      onDataChange(updatedStudents);
    }

    setPendingEdits(new Map());
    setEditingCell(null);
  }, [pendingEdits, students, onDataChange]);

  const handleDiscardChanges = useCallback(() => {
    if (window.confirm("Discard all unsaved changes?")) {
      setPendingEdits(new Map());
      setEditingCell(null);
    }
  }, []);

  const getCellValue = useCallback(
    (student: StudentData, assessmentId: string, scoreType: ScoreType): string => {
      const studentKey = `${student.first_name}-${student.last_name}`;
      const editKey = `${studentKey}-${assessmentId}-${scoreType || "default"}`;

      // Check if there's a pending edit
      if (pendingEdits.has(editKey)) {
        return pendingEdits.get(editKey)!.newValue;
      }

      // Get the assessment
      const assessment = getLatestAssessmentById(student, assessmentId);
      if (!assessment) return "";

      if (scoreType) {
        // Handle English test fields
        if (
          scoreType === "paper1" &&
          assessment.paper1_score !== undefined &&
          assessment.paper1_score !== null
        ) {
          return String(assessment.paper1_score);
        } else if (
          scoreType === "paper1_percent" &&
          assessment.paper1_percent !== undefined &&
          assessment.paper1_percent !== null
        ) {
          return String(Math.round(assessment.paper1_percent * 10) / 10);
        } else if (
          scoreType === "paper2" &&
          assessment.paper2_score !== undefined &&
          assessment.paper2_score !== null
        ) {
          return String(assessment.paper2_score);
        } else if (
          scoreType === "paper2_percent" &&
          assessment.paper2_percent !== undefined &&
          assessment.paper2_percent !== null
        ) {
          return String(Math.round(assessment.paper2_percent * 10) / 10);
        } else if (
          scoreType === "paper3" &&
          assessment.paper3_score !== undefined &&
          assessment.paper3_score !== null
        ) {
          return String(assessment.paper3_score);
        } else if (
          scoreType === "paper3_percent" &&
          assessment.paper3_percent !== undefined &&
          assessment.paper3_percent !== null
        ) {
          return String(Math.round(assessment.paper3_percent * 10) / 10);
        } else if (
          scoreType === "lis1" &&
          assessment.lis1 !== undefined &&
          assessment.lis1 !== null
        ) {
          return String(assessment.lis1);
        } else if (
          scoreType === "lis2" &&
          assessment.lis2 !== undefined &&
          assessment.lis2 !== null
        ) {
          return String(assessment.lis2);
        } else if (
          scoreType === "read" &&
          assessment.read !== undefined &&
          assessment.read !== null
        ) {
          return String(assessment.read);
        } else if (
          scoreType === "voc1" &&
          assessment.voc1 !== undefined &&
          assessment.voc1 !== null
        ) {
          return String(assessment.voc1);
        } else if (
          scoreType === "voc2" &&
          assessment.voc2 !== undefined &&
          assessment.voc2 !== null
        ) {
          return String(assessment.voc2);
        } else if (scoreType === "gr1" && assessment.gr1 !== undefined && assessment.gr1 !== null) {
          return String(assessment.gr1);
        } else if (scoreType === "gr2" && assessment.gr2 !== undefined && assessment.gr2 !== null) {
          return String(assessment.gr2);
        } else if (scoreType === "gr3" && assessment.gr3 !== undefined && assessment.gr3 !== null) {
          return String(assessment.gr3);
        } else if (
          scoreType === "total" &&
          assessment.total_score !== undefined &&
          assessment.total_score !== null
        ) {
          return String(assessment.total_score);
        } else if (
          scoreType === "percent" &&
          assessment.total_percent !== undefined &&
          assessment.total_percent !== null
        ) {
          return String(Math.round(assessment.total_percent * 10) / 10); // Round to 1 decimal
        } else if (assessment.evaluation_details) {
          const scoreValue =
            scoreType === "percentage"
              ? assessment.evaluation_details.percentage_score
              : scoreType === "myp"
                ? assessment.evaluation_details.myp_score
                : scoreType === "cambridge_1"
                  ? assessment.evaluation_details.cambridge_score_1
                  : scoreType === "cambridge_2"
                    ? assessment.evaluation_details.cambridge_score_2
                    : assessment.evaluation_details.cambridge_score;

          // If evaluation_details score is null/undefined, fall back to regular score field ONLY for percentage
          if (scoreValue === null || scoreValue === undefined) {
            if (scoreType === "percentage") {
              if (
                assessment.score === "" ||
                assessment.score === null ||
                assessment.score === undefined
              ) {
                return "";
              }
              return String(assessment.score);
            }
            // For MYP and Cambridge, don't fall back - return empty
            return "";
          }

          return scoreValue.toString();
        } else if (scoreType === "percentage") {
          // No evaluation_details, fall back to regular score field only for percentage
          if (
            assessment.score === "" ||
            assessment.score === null ||
            assessment.score === undefined
          ) {
            return "";
          }
          return String(assessment.score);
        }
        // For MYP and Cambridge with no evaluation_details, return empty
        return "";
      } else {
        // Check if this assessment should display on_time or score
        // If NO students have a score for this assessment, display on_time
        // Otherwise, display score
        const shouldDisplayScore = assessmentsWithScores.has(assessmentId);

        if (shouldDisplayScore) {
          // Display score (normal behavior)
          const score = assessment.score;
          if (score !== null && score !== "") {
            return String(score);
          }
        } else {
          // Display on_time if all students have empty score
          if (assessment.on_time !== undefined && assessment.on_time !== null) {
            return String(assessment.on_time);
          }
        }
      }

      return "";
    },
    [pendingEdits, assessmentsWithScores]
  );

  return {
    pendingEdits,
    editingCell,
    setEditingCell,
    handleCellEdit,
    handleSaveChanges,
    handleDiscardChanges,
    getCellValue,
    hasPendingEdits,
  };
}
