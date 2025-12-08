import React, { useState, useMemo } from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";
import { StudentData } from "../../types/ProgressReportTypes";
import { getStudentFullName } from "../../utils/progressReportUtils";
import ClassSelectorWithSearch from "../common/shared/ClassSelectorWithSearch";
import SortableTableHeader from "../common/shared/SortableTableHeader";
import { useTableSorting } from "../../hooks/useTableSorting";
import { useStudentFiltering } from "../../hooks/useStudentFiltering";
import {
  calculateGrade,
  getMissingTests,
  calculateOptimalMaxPoints,
  SDGroup,
  SD_GROUP_CONFIGS,
  getMaxPointsForGroup,
} from "../../utils/processing/gradeCalculations";

interface GradeGeneratorSectionProps {
  students: StudentData[];
  classes: string[];
  onSaveGrades: (grades: Map<string, number>) => void;
}

const GradeGeneratorSection: React.FC<GradeGeneratorSectionProps> = ({
  students,
  classes,
  onSaveGrades,
}) => {
  const { t } = useFallbackTranslation();
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPointsFor10, setMaxPointsFor10] = useState<number>(16);
  const [targetAverage, setTargetAverage] = useState<number>(7);
  const [selectedSDGroup, setSelectedSDGroup] = useState<SDGroup>("SD1+SD2+SD3");

  // Get max available points for the selected SD group
  const MAX_AVAILABLE_POINTS = getMaxPointsForGroup(selectedSDGroup);
  const currentGroupConfig = SD_GROUP_CONFIGS[selectedSDGroup];

  // Filter students
  const filteredStudents = useStudentFiltering({
    students,
    filters: {
      searchQuery,
      selectedClass,
      showAllClasses: selectedClass === "all",
    },
  });

  // Sort students
  const {
    sortedData: classStudents,
    handleSort,
    getSortIcon,
  } = useTableSorting({
    data: filteredStudents,
    defaultSortField: "name",
    comparators: {
      name: (a, b) => getStudentFullName(a).localeCompare(getStudentFullName(b)),
      calculated: (a, b) => {
        const gradeA = calculateGrade(a, maxPointsFor10, selectedSDGroup).grade ?? -1;
        const gradeB = calculateGrade(b, maxPointsFor10, selectedSDGroup).grade ?? -1;
        return gradeA - gradeB;
      },
      sum: (a, b) => {
        const sumA = calculateGrade(a, maxPointsFor10, selectedSDGroup).sum ?? -1;
        const sumB = calculateGrade(b, maxPointsFor10, selectedSDGroup).sum ?? -1;
        return sumA - sumB;
      },
      sd1: (a, b) => {
        const scoreA = calculateGrade(a, maxPointsFor10, selectedSDGroup).testScores.sd1 ?? -1;
        const scoreB = calculateGrade(b, maxPointsFor10, selectedSDGroup).testScores.sd1 ?? -1;
        return scoreA - scoreB;
      },
      sd2: (a, b) => {
        const scoreA = calculateGrade(a, maxPointsFor10, selectedSDGroup).testScores.sd2 ?? -1;
        const scoreB = calculateGrade(b, maxPointsFor10, selectedSDGroup).testScores.sd2 ?? -1;
        return scoreA - scoreB;
      },
      sd3: (a, b) => {
        const scoreA = calculateGrade(a, maxPointsFor10, selectedSDGroup).testScores.sd3 ?? -1;
        const scoreB = calculateGrade(b, maxPointsFor10, selectedSDGroup).testScores.sd3 ?? -1;
        return scoreA - scoreB;
      },
    },
  });

  const handleSaveGrades = () => {
    const grades = new Map<string, number>();

    classStudents.forEach((student) => {
      const { grade } = calculateGrade(student, maxPointsFor10, selectedSDGroup);
      if (grade !== null) {
        const studentKey = `${student.first_name}-${student.last_name}`;
        grades.set(studentKey, grade);
      }
    });

    if (grades.size === 0) {
      alert(
        `No grades to save. Make sure students have all three test scores (${selectedSDGroup}).`
      );
      return;
    }

    if (
      confirm(
        `Save calculated grades for ${grades.size} student(s) with threshold ${maxPointsFor10} points?`
      )
    ) {
      onSaveGrades(grades);
    }
  };

  const handleAutoAdjust = () => {
    const optimal = calculateOptimalMaxPoints(classStudents, targetAverage, selectedSDGroup);
    setMaxPointsFor10(optimal);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const validGrades = classStudents
      .map((s) => calculateGrade(s, maxPointsFor10, selectedSDGroup).grade)
      .filter((g) => g !== null) as number[];

    if (validGrades.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0 };
    }

    return {
      count: validGrades.length,
      average:
        Math.round((validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length) * 10) / 10,
      min: Math.min(...validGrades),
      max: Math.max(...validGrades),
    };
  }, [classStudents, maxPointsFor10, selectedSDGroup]);

  // Find students with missing data
  const studentsWithMissingData = useMemo(() => {
    return classStudents
      .filter((student) => {
        const { testScores } = calculateGrade(student, maxPointsFor10, selectedSDGroup);
        return testScores.sd1 === null || testScores.sd2 === null || testScores.sd3 === null;
      })
      .map((student) => {
        const { testScores } = calculateGrade(student, maxPointsFor10, selectedSDGroup);
        const missing = getMissingTests(testScores, selectedSDGroup);
        return {
          name: getStudentFullName(student),
          missing: missing.join(", "),
        };
      });
  }, [classStudents, maxPointsFor10, selectedSDGroup]);

  // Calculate average difference from target
  const averageDiff = Math.abs(stats.average - targetAverage);
  const isCloseToTarget = averageDiff < 0.15;
  const averageColor = isCloseToTarget ? "green" : averageDiff < 0.5 ? "orange" : "red";

  // Get SD labels and breakdown based on selected group
  const sdLabels =
    selectedSDGroup === "SD4+SD5+SD6" ? ["SD4", "SD5", "SD6"] : ["SD1", "SD2", "SD3"];
  const breakdownText = currentGroupConfig.breakdown
    .map((b) => `${b.test}: ${b.points}`)
    .join(" + ");

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{t("no_data_loaded")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-purple-900 mb-2">🎯 Grade Generator</h2>
        <p className="text-purple-700">
          Calculate percentage grades from {selectedSDGroup} test scores
        </p>
        <p className="text-sm text-purple-600 mt-2">
          Current Formula: (Total Points /{" "}
          <span className="font-bold text-purple-900">{maxPointsFor10}</span>) × 10, rounded up (max
          10)
        </p>
        <p className="text-xs text-purple-500 mt-1">
          Max Available: <span className="font-bold">{MAX_AVAILABLE_POINTS}</span> points (
          {breakdownText})
        </p>
      </div>

      {/* SD Group Selector */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-indigo-900 mb-3">📊 Test Group Selection</h3>
        <label className="block text-sm font-medium text-indigo-900 mb-2">
          Select which test group to use for grade calculation:
        </label>
        <select
          value={selectedSDGroup}
          onChange={(e) => setSelectedSDGroup(e.target.value as SDGroup)}
          className="w-full px-4 py-3 border-2 border-indigo-300 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        >
          <option value="SD1+SD2+SD3">SD1 + SD2 + SD3</option>
          <option value="SD4+SD5+SD6">SD4 + SD5 + SD6</option>
        </select>
        <p className="text-xs text-indigo-600 mt-2">
          {selectedSDGroup === "SD1+SD2+SD3"
            ? "Using first semester tests (SD1, SD2, SD3)"
            : "Using second semester tests (SD4, SD5, SD6)"}
        </p>
      </div>

      {/* Formula Controls Panel */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg p-6">
        <h3 className="text-lg font-bold text-amber-900 mb-4">⚙️ Formula Controls</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Points Threshold Control */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Points for Grade 10:{" "}
                <span className="text-xl font-bold text-amber-700">{maxPointsFor10}</span>
              </label>
              <p className="text-xs text-amber-700 mb-2">
                Students with {maxPointsFor10} points get 10/10 (100%)
              </p>
              <input
                type="range"
                min="10"
                max={MAX_AVAILABLE_POINTS}
                step="1"
                value={maxPointsFor10}
                onChange={(e) => setMaxPointsFor10(parseFloat(e.target.value))}
                className="w-full h-3 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-xs text-amber-600 mt-1">
                <span>
                  10 pts
                  <br />
                  (generous)
                </span>
                <span>
                  16 pts
                  <br />
                  (50%)
                </span>
                <span>
                  24 pts
                  <br />
                  (75%)
                </span>
                <span>
                  {MAX_AVAILABLE_POINTS} pts
                  <br />
                  (max)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Manual Threshold Input
              </label>
              <input
                type="number"
                min="10"
                max={MAX_AVAILABLE_POINTS}
                step="1"
                value={maxPointsFor10}
                onChange={(e) =>
                  setMaxPointsFor10(
                    Math.round(
                      Math.max(10, Math.min(MAX_AVAILABLE_POINTS, parseFloat(e.target.value) || 16))
                    )
                  )
                }
                className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <p className="text-xs text-amber-600 mt-1">Range: 10-{MAX_AVAILABLE_POINTS} points</p>
            </div>
          </div>

          {/* Right Column: Target Average */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Target Average Grade
              </label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={targetAverage}
                onChange={(e) =>
                  setTargetAverage(Math.max(1, Math.min(10, parseFloat(e.target.value) || 7)))
                }
                className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleAutoAdjust}
              disabled={stats.count === 0}
              className="w-full px-6 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              🎯 Auto-Adjust to Target {targetAverage}
            </button>

            <div
              className={`p-4 rounded-lg border-2 ${
                averageColor === "green"
                  ? "bg-green-50 border-green-300"
                  : averageColor === "orange"
                    ? "bg-orange-50 border-orange-300"
                    : "bg-red-50 border-red-300"
              }`}
            >
              <div className="text-sm font-medium mb-1">
                Current Average:{" "}
                <span
                  className={`text-2xl font-bold ${
                    averageColor === "green"
                      ? "text-green-700"
                      : averageColor === "orange"
                        ? "text-orange-700"
                        : "text-red-700"
                  }`}
                >
                  {stats.average}
                </span>
              </div>
              <div className="text-xs">
                {isCloseToTarget ? (
                  <span className="text-green-700">✅ Within target range!</span>
                ) : (
                  <span className={averageColor === "orange" ? "text-orange-700" : "text-red-700"}>
                    {stats.average < targetAverage ? "📉" : "📈"} {averageDiff.toFixed(2)} away from
                    target
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Missing Data Warning */}
      {studentsWithMissingData.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900 mb-2">
                Students with Missing Test Data ({studentsWithMissingData.length})
              </h3>
              <p className="text-sm text-red-700 mb-3">
                The following students cannot have grades calculated because they are missing test
                scores:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {studentsWithMissingData.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-red-300 rounded px-3 py-2 text-sm"
                  >
                    <span className="font-semibold text-red-900">{item.name}</span>
                    <span className="text-red-600 ml-2">Missing: {item.missing}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class Selector */}
      <ClassSelectorWithSearch
        classes={classes}
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Statistics */}
      {selectedClass && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium mb-1">Students</div>
            <div className="text-3xl font-bold text-blue-900">{classStudents.length}</div>
          </div>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium mb-1">With Grades</div>
            <div className="text-3xl font-bold text-green-900">{stats.count}</div>
          </div>
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium mb-1">Average</div>
            <div className="text-3xl font-bold text-purple-900">{stats.average}</div>
          </div>
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
            <div className="text-sm text-orange-600 font-medium mb-1">Range</div>
            <div className="text-2xl font-bold text-orange-900">
              {stats.min} - {stats.max}
            </div>
          </div>
        </div>
      )}

      {/* Grades Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Calculated Grades
            {selectedClass !== "all" && ` - ${selectedClass}`}
          </h3>
          <button
            onClick={handleSaveGrades}
            disabled={stats.count === 0}
            className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            💾 Save Grades ({stats.count})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableTableHeader
                  label={t("student")}
                  field="name"
                  currentSortField={handleSort.toString()}
                  currentDirection="asc"
                  onSort={handleSort}
                />
                <SortableTableHeader
                  label={`${sdLabels[0]} (%)`}
                  field="sd1"
                  currentSortField={handleSort.toString()}
                  currentDirection="asc"
                  onSort={handleSort}
                />
                <SortableTableHeader
                  label={`${sdLabels[1]} (%)`}
                  field="sd2"
                  currentSortField={handleSort.toString()}
                  currentDirection="asc"
                  onSort={handleSort}
                />
                <SortableTableHeader
                  label={`${sdLabels[2]} (%)`}
                  field="sd3"
                  currentSortField={handleSort.toString()}
                  currentDirection="asc"
                  onSort={handleSort}
                />
                <th
                  onClick={() => handleSort("sum")}
                  className="px-4 py-3 text-left text-xs font-medium text-blue-600 uppercase cursor-pointer hover:bg-gray-100"
                >
                  Sum {getSortIcon("sum")}
                </th>
                <th
                  onClick={() => handleSort("calculated")}
                  className="px-4 py-3 text-left text-xs font-medium text-purple-600 uppercase cursor-pointer hover:bg-gray-100"
                >
                  Calculated Grade {getSortIcon("calculated")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classStudents.length > 0 ? (
                classStudents.map((student) => {
                  const { sum, grade, testScores } = calculateGrade(
                    student,
                    maxPointsFor10,
                    selectedSDGroup
                  );

                  return (
                    <tr
                      key={`${student.first_name}-${student.last_name}`}
                      className="hover:bg-purple-50"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {getStudentFullName(student)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {testScores.sd1 !== null ? testScores.sd1 : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {testScores.sd2 !== null ? testScores.sd2 : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {testScores.sd3 !== null ? testScores.sd3 : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                        {sum !== null ? sum.toFixed(1) : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-purple-600">
                        {grade !== null ? grade : "-"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    {searchQuery ? t("no_students") : t("no_data")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-500 text-center">
          💡 Calculated grades will be saved as a new assessment record for each student
        </div>
      </div>
    </div>
  );
};

export default GradeGeneratorSection;
