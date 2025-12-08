import { StudentData } from "../../types/ProgressReportTypes";
import { getLatestAssessmentById } from "../assessmentColumnUtils";

export function createStudentSortComparators() {
  return {
    name: (a: StudentData, b: StudentData) => {
      let comparison = a.last_name.localeCompare(b.last_name);
      if (comparison === 0) {
        comparison = a.first_name.localeCompare(b.first_name);
      }
      return comparison;
    },

    assessments: (a: StudentData, b: StudentData) => {
      return (a.assessments?.length || 0) - (b.assessments?.length || 0);
    },

    createAssessmentComparator: (
      sortBy: string,
      getAssessmentId: (sortBy: string) => string,
      getScoreType: (sortBy: string) => "percentage" | "myp" | "cambridge" | null
    ) => {
      return (a: StudentData, b: StudentData) => {
        const assessmentId = getAssessmentId(sortBy);
        const scoreType = getScoreType(sortBy);

        const getScore = (student: StudentData) => {
          const assessment = getLatestAssessmentById(student, assessmentId);
          if (!assessment) return 0;

          if (scoreType && assessment.evaluation_details) {
            if (scoreType === "percentage")
              return assessment.evaluation_details.percentage_score || 0;
            if (scoreType === "myp") return assessment.evaluation_details.myp_score || 0;
            if (scoreType === "cambridge")
              return assessment.evaluation_details.cambridge_score || 0;
          }

          return parseFloat(assessment.score || "0");
        };

        return getScore(a) - getScore(b);
      };
    },
  };
}

export type ScoreType =
  | "percentage"
  | "myp"
  | "cambridge"
  | "cambridge_1"
  | "cambridge_2"
  | "paper1"
  | "paper2"
  | "paper3"
  | "paper1_percent"
  | "paper2_percent"
  | "paper3_percent"
  | "lis1"
  | "lis2"
  | "read"
  | "voc1"
  | "voc2"
  | "gr1"
  | "gr2"
  | "gr3"
  | "total"
  | "percent"
  | null;

export function parseAssessmentColumnId(columnId: string): {
  assessmentId: string;
  scoreType: ScoreType;
} {
  let assessmentId = columnId;
  let scoreType: ScoreType = null;

  // Check for English test fields first (more specific)
  if (columnId.endsWith("-paper1-percent")) {
    assessmentId = columnId.replace("-paper1-percent", "");
    scoreType = "paper1_percent";
  } else if (columnId.endsWith("-paper2-percent")) {
    assessmentId = columnId.replace("-paper2-percent", "");
    scoreType = "paper2_percent";
  } else if (columnId.endsWith("-paper3-percent")) {
    assessmentId = columnId.replace("-paper3-percent", "");
    scoreType = "paper3_percent";
  } else if (columnId.endsWith("-paper1")) {
    assessmentId = columnId.replace("-paper1", "");
    scoreType = "paper1";
  } else if (columnId.endsWith("-paper2")) {
    assessmentId = columnId.replace("-paper2", "");
    scoreType = "paper2";
  } else if (columnId.endsWith("-paper3")) {
    assessmentId = columnId.replace("-paper3", "");
    scoreType = "paper3";
  } else if (columnId.endsWith("-lis1")) {
    assessmentId = columnId.replace("-lis1", "");
    scoreType = "lis1";
  } else if (columnId.endsWith("-lis2")) {
    assessmentId = columnId.replace("-lis2", "");
    scoreType = "lis2";
  } else if (columnId.endsWith("-read")) {
    assessmentId = columnId.replace("-read", "");
    scoreType = "read";
  } else if (columnId.endsWith("-voc1")) {
    assessmentId = columnId.replace("-voc1", "");
    scoreType = "voc1";
  } else if (columnId.endsWith("-voc2")) {
    assessmentId = columnId.replace("-voc2", "");
    scoreType = "voc2";
  } else if (columnId.endsWith("-gr1")) {
    assessmentId = columnId.replace("-gr1", "");
    scoreType = "gr1";
  } else if (columnId.endsWith("-gr2")) {
    assessmentId = columnId.replace("-gr2", "");
    scoreType = "gr2";
  } else if (columnId.endsWith("-gr3")) {
    assessmentId = columnId.replace("-gr3", "");
    scoreType = "gr3";
  } else if (columnId.endsWith("-percent")) {
    assessmentId = columnId.replace("-percent", "");
    scoreType = "percent";
  } else if (columnId.endsWith("-total")) {
    assessmentId = columnId.replace("-total", "");
    scoreType = "total";
  } else if (columnId.endsWith("-percentage")) {
    assessmentId = columnId.replace("-percentage", "");
    scoreType = "percentage";
  } else if (columnId.endsWith("-myp")) {
    assessmentId = columnId.replace("-myp", "");
    scoreType = "myp";
  } else if (columnId.endsWith("-cambridge-1")) {
    assessmentId = columnId.replace("-cambridge-1", "");
    scoreType = "cambridge_1";
  } else if (columnId.endsWith("-cambridge-2")) {
    assessmentId = columnId.replace("-cambridge-2", "");
    scoreType = "cambridge_2";
  } else if (columnId.endsWith("-cambridge")) {
    assessmentId = columnId.replace("-cambridge", "");
    scoreType = "cambridge";
  }

  return { assessmentId, scoreType };
}
