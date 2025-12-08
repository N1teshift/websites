import React, { useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { StudentData } from "../../types/ProgressReportTypes";
import { getUniqueAssessments, getLatestAssessmentById } from "../../utils/assessmentColumnUtils";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";
import { groupAssessmentsByType } from "../../utils/chartAssessmentUtils";
import { useAvailableScoreTypes } from "../../hooks/useAvailableScoreTypes";
import { useChartData } from "../../hooks/useChartData";
import { getScaleConfig } from "../../utils/chartScaleConfig";
import { ChartModeSelector } from "./chart/ChartModeSelector";
import { ScoreTypeSelector } from "./chart/ScoreTypeSelector";
import { HomeworkViewSelector } from "./chart/HomeworkViewSelector";

export type EnglishTestScoreType =
  | "lis1"
  | "lis2"
  | "read"
  | "voc1"
  | "voc2"
  | "gr1"
  | "gr2"
  | "gr3"
  | "total_percent"
  | "paper1"
  | "paper2"
  | "paper3"
  | "paper1_percent"
  | "paper2_percent"
  | "paper3_percent";

export type AllScoreTypes =
  | "percentage"
  | "myp"
  | "cambridge"
  | "cambridge_1"
  | "cambridge_2"
  | EnglishTestScoreType;

interface ClassPerformanceChartEnhancedProps {
  students: StudentData[];
  height?: number;
  onModeChange?: (mode: ChartMode) => void;
  onScoreTypeChange?: (scoreType: AllScoreTypes) => void;
  chartOptions?: Array<{ id: string; title: string; type: string }>;
}

export type ChartMode = string;

const ClassPerformanceChartEnhanced: React.FC<ClassPerformanceChartEnhancedProps> = ({
  students,
  height = 300,
  onModeChange,
  onScoreTypeChange,
  chartOptions: providedChartOptions,
}) => {
  const { t } = useFallbackTranslation();

  // Get available assessments
  const availableAssessments = useMemo(() => {
    return getUniqueAssessments(students, [
      "summative",
      "homework",
      "homework_graded",
      "test",
      "diagnostic",
    ]);
  }, [students]);

  // Build chart options
  const chartOptions =
    providedChartOptions ||
    availableAssessments.map((a) => ({
      id: a.id,
      title: a.title,
      type: "assessment",
    }));

  // State
  const [mode, setMode] = useState<ChartMode>(chartOptions[0]?.id || "");
  const [scoreType, setScoreType] = useState<AllScoreTypes>("percentage");
  const [homeworkViewMode, setHomeworkViewMode] = useState<"completion" | "scores">("completion");

  // Initialize mode when chart options change
  useEffect(() => {
    if (chartOptions.length > 0) {
      const isValidMode = chartOptions.some((opt) => opt.id === mode);
      if (!isValidMode || !mode) {
        const newMode = chartOptions[0].id;
        setMode(newMode);
        if (onModeChange) {
          onModeChange(newMode);
        }
      }
    }
  }, [chartOptions, mode, onModeChange]);

  // Reset homework view mode when switching assessments
  useEffect(() => {
    setHomeworkViewMode("completion");
  }, [mode]);

  // Get current assessment info
  const currentOption = useMemo(() => {
    return chartOptions.find((o) => o.id === mode);
  }, [chartOptions, mode]);

  const currentAssessmentType = useMemo(() => {
    return availableAssessments.find((a) => a.id === mode)?.type || "";
  }, [availableAssessments, mode]);

  const supportsMultipleScores =
    currentAssessmentType === "test" ||
    currentAssessmentType === "summative" ||
    currentAssessmentType === "diagnostic";

  // Check if homework has scores
  const homeworkHasScores = useMemo(() => {
    if (currentAssessmentType !== "homework") return false;

    return students.some((student) => {
      const assessment = getLatestAssessmentById(student, mode);
      if (!assessment) return false;
      const score = assessment.score;
      return score !== null && score !== undefined && score !== "";
    });
  }, [currentAssessmentType, students, mode]);

  // Get assessment max points
  const assessmentMaxPoints = useMemo(() => {
    const student = students.find((s) => {
      const a = getLatestAssessmentById(s, mode);
      return a && a.max_points !== undefined && a.max_points !== null;
    });

    if (student) {
      const a = getLatestAssessmentById(student, mode);
      return a?.max_points || null;
    }

    return null;
  }, [students, mode]);

  // Get available score types using the hook
  const availableScoreTypes = useAvailableScoreTypes(students, mode, supportsMultipleScores);

  // Auto-select first available score type if current is not available
  useEffect(() => {
    if (supportsMultipleScores && availableScoreTypes.length > 0) {
      const isCurrentTypeAvailable = availableScoreTypes.some((t) => t.value === scoreType);
      if (!isCurrentTypeAvailable) {
        const newScoreType = availableScoreTypes[0].value;
        setScoreType(newScoreType);
        if (onScoreTypeChange) {
          onScoreTypeChange(newScoreType);
        }
      }
    }
  }, [availableScoreTypes, scoreType, supportsMultipleScores, onScoreTypeChange]);

  // Calculate chart data using the hook
  const chartData = useChartData({
    students,
    assessmentId: mode,
    assessmentType: currentAssessmentType,
    scoreType,
    currentOptionType: currentOption?.type,
    homeworkHasScores,
    homeworkViewMode,
    assessmentMaxPoints,
    supportsMultipleScores,
    t,
  });

  const maxCount = Math.max(...chartData.map((d) => d.count));

  // Group assessments for dropdown
  const groupedOptions = useMemo(() => {
    return groupAssessmentsByType(chartOptions, availableAssessments, students);
  }, [chartOptions, availableAssessments, students]);

  // Handlers
  const handleModeChange = (newMode: ChartMode) => {
    setMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const handleScoreTypeChange = (newScoreType: AllScoreTypes) => {
    setScoreType(newScoreType);
    if (onScoreTypeChange) {
      onScoreTypeChange(newScoreType);
    }
  };

  // Build X-axis label
  const getXAxisLabel = () => {
    if (
      currentAssessmentType === "homework" &&
      (!homeworkHasScores || homeworkViewMode === "completion")
    ) {
      return t("completion");
    }

    // Check if this is an English test score type with specific scale
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

    if (englishScoreTypes.includes(scoreType as EnglishTestScoreType)) {
      const scaleConfig = getScaleConfig(scoreType);
      return scaleConfig.label;
    }

    // Regular assessment types
    if (supportsMultipleScores && scoreType === "cambridge") {
      return `${t("cambridge_score")} (0, 0.5, 1)`;
    }
    if (supportsMultipleScores && scoreType === "cambridge_1") {
      return "Cambridge 1 (0, 0.5, 1)";
    }
    if (supportsMultipleScores && scoreType === "cambridge_2") {
      return "Cambridge 2 (0, 0.5, 1)";
    }
    if (supportsMultipleScores && scoreType === "myp") {
      return `${t("myp_score")} (0-8)`;
    }
    if (assessmentMaxPoints !== null && assessmentMaxPoints > 0) {
      return `${t("score")} (0-${assessmentMaxPoints})`;
    }
    return t("score");
  };

  if (students.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">{t("no_students")}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Chart Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <ChartModeSelector
          mode={mode}
          groupedOptions={groupedOptions}
          onModeChange={handleModeChange}
          label={t("data").charAt(0).toUpperCase() + t("data").slice(1)}
        />

        {supportsMultipleScores && (
          <ScoreTypeSelector
            scoreType={scoreType}
            availableScoreTypes={availableScoreTypes}
            onScoreTypeChange={handleScoreTypeChange}
          />
        )}

        {currentAssessmentType === "homework" && homeworkHasScores && (
          <HomeworkViewSelector
            viewMode={homeworkViewMode}
            onViewModeChange={setHomeworkViewMode}
            t={t}
          />
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="range"
            tick={{ fontSize: 12 }}
            stroke="#6B7280"
            label={{
              value: getXAxisLabel(),
              position: "insideBottom",
              offset: -5,
            }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6B7280"
            allowDecimals={false}
            domain={[0, maxCount + 1]}
            label={{
              value: t("students").charAt(0).toUpperCase() + t("students").slice(1),
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "0.5rem",
              padding: "0.75rem",
            }}
            formatter={(value: number) => [value, t("students")]}
            labelFormatter={(label) => {
              if (
                currentAssessmentType === "homework" &&
                (!homeworkHasScores || homeworkViewMode === "completion")
              ) {
                return `Status: ${label}`;
              }
              return `Score: ${label}`;
            }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClassPerformanceChartEnhanced;
