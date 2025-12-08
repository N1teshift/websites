import { StudentData } from "../../types/ProgressReportTypes";
import { getLatestAssessmentById } from "../assessmentColumnUtils";
import type {
  AllScoreTypes,
  EnglishTestScoreType,
} from "../../components/common/ClassPerformanceChartEnhanced";
import { getScaleConfig } from "../chartScaleConfig";

export interface AssessmentStatsResult {
  studentCount: number;
  assessmentLabel: string;
  assessmentDescription: string;
  assessmentValue: number;
  isPercentage: boolean;
}

export interface ChartOption {
  id: string;
  title: string;
  type: string;
}

export interface AssessmentInfo {
  id: string;
  title: string;
  type: string;
}

export function calculateAssessmentStatistics(
  students: StudentData[],
  chartMode: string,
  chartScoreType: AllScoreTypes,
  chartOptions: ChartOption[],
  availableAssessments: AssessmentInfo[]
): AssessmentStatsResult | null {
  if (students.length === 0) return null;

  const selectedOption = chartOptions.find((o) => o.id === chartMode) || chartOptions[0];
  if (!selectedOption) {
    return {
      studentCount: students.length,
      assessmentLabel: "No data",
      assessmentDescription: "",
      assessmentValue: 0,
      isPercentage: false,
    };
  }

  // Handle assessments (including English tests which are now diagnostic/summative assessments)
  const selectedAssessment = availableAssessments.find((a) => a.id === chartMode);
  if (!selectedAssessment) {
    return {
      studentCount: students.length,
      assessmentLabel: "No assessments",
      assessmentDescription: "",
      assessmentValue: 0,
      isPercentage: false,
    };
  }

  const isPercentage = selectedAssessment.type === "homework";
  const supportsMultipleScores =
    selectedAssessment.type === "test" ||
    selectedAssessment.type === "summative" ||
    selectedAssessment.type === "diagnostic";

  // Check if this is an English test score type
  const englishScoreTypes: EnglishTestScoreType[] = [
    "lis1",
    "lis2",
    "read",
    "voc1",
    "voc2",
    "gr1",
    "gr2",
    "gr3",
    "paper1",
    "paper2",
    "paper3",
    "paper1_percent",
    "paper2_percent",
    "paper3_percent",
    "total_percent",
  ];
  const isEnglishTestScoreType = englishScoreTypes.includes(chartScoreType as EnglishTestScoreType);

  let statValue = 0;

  if (isEnglishTestScoreType) {
    // Handle English test score types
    const scaleConfig = getScaleConfig(chartScoreType);
    const fieldName = scaleConfig.fieldName || chartScoreType;

    const scores = students
      .map((s) => {
        const assessment = getLatestAssessmentById(s, selectedAssessment.id);
        if (!assessment) return null;

        const value = (assessment as unknown as Record<string, unknown>)[fieldName];
        if (typeof value !== "number" || isNaN(value)) return null;

        return value;
      })
      .filter((score) => score !== null) as number[];

    statValue =
      scores.length > 0
        ? Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 10) / 10
        : 0;
  } else if (isPercentage) {
    // Binary homework completion rate - use on_time/completed_on_time if available, otherwise fall back to score
    const completionData = students
      .map((s) => {
        const assessment = getLatestAssessmentById(s, selectedAssessment.id);
        if (!assessment) return null;

        // Check on_time field first (V5 structure)
        if (assessment.on_time !== undefined && assessment.on_time !== null) {
          return assessment.on_time;
        }

        // Check completed_on_time field (V5 structure)
        if (assessment.completed_on_time !== undefined && assessment.completed_on_time !== null) {
          return assessment.completed_on_time;
        }

        // Fall back to score field (legacy structure)
        const score = parseFloat(assessment.score || "0");
        return isNaN(score) ? null : score;
      })
      .filter((val) => val !== null) as number[];

    const completed = completionData.filter((val) => val === 1).length;
    statValue =
      completionData.length > 0
        ? Math.round((completed / completionData.length) * 100 * 10) / 10
        : 0;
  } else if (supportsMultipleScores) {
    // Tests/summatives with multiple score types
    const scores = students
      .map((s) => {
        const assessment = getLatestAssessmentById(s, selectedAssessment.id);
        if (!assessment) return null;

        // Check evaluation_details first
        if (assessment.evaluation_details) {
          let detailScore: number | null | undefined;
          if (chartScoreType === "percentage")
            detailScore = assessment.evaluation_details.percentage_score;
          else if (chartScoreType === "myp") detailScore = assessment.evaluation_details.myp_score;
          else if (
            chartScoreType === "cambridge" ||
            chartScoreType === "cambridge_1" ||
            chartScoreType === "cambridge_2"
          ) {
            detailScore = assessment.evaluation_details.cambridge_score;
          }

          // Only use evaluation_details score if it's actually set (not null/undefined)
          if (detailScore !== null && detailScore !== undefined) {
            return detailScore;
          }
        }

        // Fall back to regular score field ONLY for percentage score type
        if (chartScoreType === "percentage") {
          const score = parseFloat(assessment.score || "0");
          return isNaN(score) ? null : score;
        }

        // For MYP and Cambridge, no fallback - return null if not in evaluation_details
        return null;
      })
      .filter((score) => score !== null && score > 0) as number[];

    statValue =
      scores.length > 0
        ? Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 10) / 10
        : 0;
  } else {
    // Other scored assessments
    const scores = students
      .map((s) => parseFloat(getLatestAssessmentById(s, selectedAssessment.id)?.score || "0"))
      .filter((score) => score > 0);

    statValue =
      scores.length > 0
        ? Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 10) / 10
        : 0;
  }

  // Build label
  let assessmentLabel = isPercentage ? "Completion Rate" : "Average Score";

  if (isEnglishTestScoreType) {
    // Get appropriate label for English test score types
    const scaleConfig = getScaleConfig(chartScoreType);
    const isPercentageField = chartScoreType.toString().includes("percent");

    if (isPercentageField) {
      assessmentLabel = "Average %";
    } else if (
      chartScoreType === "paper1" ||
      chartScoreType === "paper2" ||
      chartScoreType === "paper3"
    ) {
      assessmentLabel = "Average Score (0-50)";
    } else if (
      ["lis1", "lis2", "read", "voc1", "voc2", "gr1", "gr2", "gr3"].includes(
        chartScoreType as string
      )
    ) {
      assessmentLabel = "Average Score (0-10)";
    } else {
      assessmentLabel = `Average ${scaleConfig.label}`;
    }
  } else if (supportsMultipleScores) {
    if (chartScoreType === "percentage") assessmentLabel = "Average (0-10)";
    else if (chartScoreType === "myp") assessmentLabel = "Average MYP (0-8)";
    else if (
      chartScoreType === "cambridge" ||
      chartScoreType === "cambridge_1" ||
      chartScoreType === "cambridge_2"
    ) {
      assessmentLabel = "Average Cambridge";
    }
  }

  return {
    studentCount: students.length,
    assessmentLabel,
    assessmentDescription: selectedAssessment.title,
    assessmentValue: statValue,
    isPercentage,
  };
}
