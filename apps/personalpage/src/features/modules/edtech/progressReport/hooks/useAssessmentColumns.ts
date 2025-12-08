import { useMemo } from "react";
import { StudentData } from "../types/ProgressReportTypes";
import { buildAssessmentColumns } from "../utils/processing/columnBuilder";
import { ColumnConfig } from "./useColumnVisibility";

export function useAssessmentColumns(
  students: StudentData[],
  translationLabel: string
): ColumnConfig[] {
  return useMemo(() => {
    const cols: ColumnConfig[] = [{ id: "name", label: translationLabel, visible: true }];

    // Build assessment columns (includes diagnostic and summative English tests)
    const assessmentCols = buildAssessmentColumns(students, [
      "summative",
      "homework",
      "homework_graded",
      "homework_reflection",
      "test",
      "classwork",
      "sav_darb",
      "board_solving",
      "consultation",
      "diagnostic",
    ]);

    // Filter out tracking columns (TVARK, TAIS) from class view
    // These should only be visible in student view
    const nonTrackingCols = assessmentCols.filter((col) => {
      // Check if this column ID corresponds to a tracking assessment
      const isTracking = col.id.startsWith("tracking-");
      return !isTracking;
    });

    cols.push(...nonTrackingCols);
    cols.push({ id: "assessments", label: "Total Assessments", visible: true });

    return cols;
  }, [students, translationLabel]);
}
