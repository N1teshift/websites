import React, { useState, useMemo } from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";
import { StudentData, Assessment } from "../../types/ProgressReportTypes";
import { formatPercentage, getStudentFullName } from "../../utils/progressReportUtils";
import { getLatestAssessmentById, getUniqueAssessments } from "../../utils/assessmentColumnUtils";
import ClassPerformanceChartEnhanced, {
  ChartMode,
  AllScoreTypes,
} from "../common/ClassPerformanceChartEnhanced";
import ColumnCustomizer, { ColumnCategoryShortcuts } from "../common/ColumnCustomizer";
import CollapsibleSection from "../common/CollapsibleSection";
import ClassSelectorWithSearch from "../common/shared/ClassSelectorWithSearch";
import StatisticsCards from "../common/shared/StatisticsCards";
import StudentDataTable from "../common/shared/StudentDataTable";
import PendingEditsActionBar from "../common/shared/PendingEditsActionBar";
import LearningJourneyTimeline from "../charts/LearningJourneyTimeline";
import CambridgeObjectivesTable from "../cambridge/CambridgeObjectivesTable";
import { useColumnVisibility } from "../../hooks/useColumnVisibility";
import { useInlineEditing } from "../../hooks/useInlineEditing";
import { useTableSorting } from "../../hooks/useTableSorting";
import { useAssessmentColumns } from "../../hooks/useAssessmentColumns";
import { buildChartOptions } from "../../utils/processing/chartOptionsBuilder";
import { calculateAssessmentStatistics } from "../../utils/processing/assessmentStatistics";
import {
  createStudentSortComparators,
  parseAssessmentColumnId,
} from "../../utils/processing/studentSortComparators";

interface ClassViewSectionProps {
  students: StudentData[];
  classes: string[];
  onSelectStudent: (student: StudentData) => void;
  onSwitchToStudentView: () => void;
  onDataChange?: (updatedStudents: StudentData[]) => void;
  onPendingEditsChange?: (hasPendingEdits: boolean) => void;
  isEnglishTeacher?: boolean;
}

const ClassViewSection: React.FC<ClassViewSectionProps> = ({
  students,
  classes,
  onSelectStudent,
  onSwitchToStudentView,
  onDataChange,
  onPendingEditsChange,
  isEnglishTeacher = false,
}) => {
  const { t } = useFallbackTranslation();
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [chartMode, setChartMode] = useState<ChartMode>("");
  const [chartScoreType, setChartScoreType] = useState<AllScoreTypes>("percentage");

  // Get available assessments
  const availableAssessments = useMemo(() => {
    const assessments = getUniqueAssessments(students, [
      "summative",
      "homework",
      "homework_graded",
      "homework_reflection",
      "test",
      "diagnostic",
    ]);

    assessments.sort((a, b) => {
      const getEarliestDate = (id: string) => {
        let earliestDate = "";
        students.forEach((student) => {
          const assessment = getLatestAssessmentById(student, id);
          if (assessment?.date) {
            if (!earliestDate || assessment.date < earliestDate) {
              earliestDate = assessment.date;
            }
          }
        });
        return earliestDate;
      };

      return getEarliestDate(a.id).localeCompare(getEarliestDate(b.id));
    });

    return assessments;
  }, [students]);

  // Build chart options
  const chartOptions = useMemo(() => {
    return buildChartOptions(availableAssessments);
  }, [availableAssessments]);

  // Initialize chartMode
  React.useEffect(() => {
    if (chartOptions.length > 0 && !chartMode) {
      setChartMode(chartOptions[0].id);
    }
  }, [chartOptions, chartMode]);

  // Build columns
  const initialColumns = useAssessmentColumns(students, t("student"));

  const { columns, visibleColumns, setColumns, updateColumns } = useColumnVisibility(
    initialColumns,
    {
      storageKey: "progress-report-class-view-columns",
    }
  );

  // Update columns when students array reference changes, preserving visibility
  React.useEffect(() => {
    updateColumns(initialColumns);
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    let filtered =
      selectedClass === "all" ? students : students.filter((s) => s.class_name === selectedClass);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.first_name.toLowerCase().includes(query) ||
          s.last_name.toLowerCase().includes(query) ||
          getStudentFullName(s).toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [students, selectedClass, searchQuery]);

  // Sort students
  const sortComparators = useMemo(() => {
    const base = createStudentSortComparators();
    const comparators: Record<string, (a: StudentData, b: StudentData) => number> = {
      name: base.name,
      assessments: base.assessments,
    };

    // Add comparators for all assessment columns
    visibleColumns.forEach((column) => {
      if (column.id !== "name" && column.id !== "assessments") {
        // Parse the column ID to get assessment info
        const { assessmentId, scoreType } = parseAssessmentColumnId(column.id);

        // Create a comparator for this assessment
        comparators[column.id] = (a: StudentData, b: StudentData) => {
          const assessmentA = getLatestAssessmentById(a, assessmentId);
          const assessmentB = getLatestAssessmentById(b, assessmentId);

          // Handle missing data: always put students without data at the end
          if (!assessmentA && !assessmentB) return 0;
          if (!assessmentA) return 1; // a goes after b
          if (!assessmentB) return -1; // b goes after a

          const getScore = (assessment: Assessment): number => {
            if (scoreType && assessment.evaluation_details) {
              let detailScore: number | null | undefined;
              if (scoreType === "percentage")
                detailScore = assessment.evaluation_details.percentage_score;
              else if (scoreType === "myp") detailScore = assessment.evaluation_details.myp_score;
              else if (scoreType === "cambridge")
                detailScore = assessment.evaluation_details.cambridge_score;

              // Only use evaluation_details score if it's actually set (not null/undefined)
              if (detailScore !== null && detailScore !== undefined) {
                return detailScore;
              }

              // Fall back to regular score field ONLY for percentage score type
              if (scoreType === "percentage") {
                const score = parseFloat(assessment.score || "0");
                return isNaN(score) ? 0 : score;
              }

              // For MYP and Cambridge, no fallback
              return 0;
            }

            // No scoreType specified, use regular score field
            const score = parseFloat(assessment.score || "0");
            return isNaN(score) ? 0 : score;
          };

          return getScore(assessmentA) - getScore(assessmentB);
        };
      }
    });

    return comparators;
  }, [visibleColumns]);

  const {
    sortedData: classStudents,
    handleSort,
    getSortIcon,
  } = useTableSorting({
    data: filteredStudents,
    defaultSortField: "name",
    comparators: sortComparators,
  });

  // Inline editing
  const inlineEditing = useInlineEditing({
    students,
    onDataChange,
    onPendingEditsChange,
  });

  // Class statistics
  const classStats = useMemo(() => {
    return calculateAssessmentStatistics(
      classStudents,
      chartMode,
      chartScoreType,
      chartOptions,
      availableAssessments
    );
  }, [classStudents, chartMode, chartScoreType, chartOptions, availableAssessments]);

  const handleStudentClick = (student: StudentData) => {
    onSelectStudent(student);
    onSwitchToStudentView();
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{t("no_data_loaded")}</p>
      </div>
    );
  }

  const statCards =
    selectedClass && classStats
      ? [
          { label: t("students"), value: classStats.studentCount, color: "blue" as const },
          {
            label: classStats.assessmentLabel,
            value: classStats.isPercentage
              ? formatPercentage(classStats.assessmentValue)
              : classStats.assessmentValue,
            color: "green" as const,
            subtitle: classStats.assessmentDescription,
          },
        ]
      : [];

  return (
    <div className="space-y-6">
      <ClassSelectorWithSearch
        classes={classes}
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {selectedClass && classStats && (
        <>
          <StatisticsCards cards={statCards} columns={2} />

          {!isEnglishTeacher && (
            <CollapsibleSection
              title="Learning Journey Timeline (Oct 20 - Nov 7)"
              icon="🛤️"
              defaultOpen={true}
              id="class-view-learning-journey"
            >
              <LearningJourneyTimeline students={students} selectedClass={selectedClass} />
            </CollapsibleSection>
          )}

          <CollapsibleSection
            title="Class Performance Distribution"
            icon="📊"
            defaultOpen={true}
            id="class-view-performance-chart"
          >
            <ClassPerformanceChartEnhanced
              students={classStudents}
              onModeChange={setChartMode}
              onScoreTypeChange={setChartScoreType}
              chartOptions={chartOptions}
            />
          </CollapsibleSection>

          {!isEnglishTeacher && (
            <CollapsibleSection
              title="Cambridge Learning Objectives Mastery"
              icon="🎯"
              defaultOpen={false}
              id="class-view-cambridge-objectives"
            >
              <CambridgeObjectivesTable students={classStudents} />
            </CollapsibleSection>
          )}

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {t("students_data").charAt(0).toUpperCase() + t("students_data").slice(1)}
                {selectedClass !== "all" && ` - ${selectedClass}`}
              </h3>
              <div className="flex items-center gap-3">
                <ColumnCategoryShortcuts
                  columns={columns}
                  onChange={setColumns}
                  students={students}
                />
                <ColumnCustomizer columns={columns} onChange={setColumns} />
              </div>
            </div>

            {inlineEditing.hasPendingEdits && (
              <div className="mb-4">
                <PendingEditsActionBar
                  pendingEditsCount={inlineEditing.pendingEdits.size}
                  onSave={inlineEditing.handleSaveChanges}
                  onDiscard={inlineEditing.handleDiscardChanges}
                />
              </div>
            )}

            <StudentDataTable
              students={classStudents}
              allStudents={students}
              visibleColumns={visibleColumns}
              searchQuery={searchQuery}
              getSortIcon={getSortIcon}
              onSort={handleSort}
              onStudentClick={handleStudentClick}
              inlineEditing={inlineEditing}
            />

            <div className="mt-4 text-sm text-gray-500 text-center">
              💡 Click on a student&apos;s name to view detailed information
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClassViewSection;
