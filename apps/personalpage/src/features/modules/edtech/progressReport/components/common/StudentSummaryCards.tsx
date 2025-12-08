import React from "react";
import { StudentStats } from "../../types/ProgressReportTypes";
import { formatPercentage } from "../../utils/progressReportUtils";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";

interface StudentSummaryCardsProps {
  stats: StudentStats;
}

const StudentSummaryCards: React.FC<StudentSummaryCardsProps> = ({ stats }) => {
  const { t } = useFallbackTranslation();

  const getScoreColor = (score: number): string => {
    if (score >= 8) return "bg-green-50 border-green-200 text-green-900";
    if (score >= 6) return "bg-yellow-50 border-yellow-200 text-yellow-900";
    if (score >= 4) return "bg-orange-50 border-orange-200 text-orange-900";
    return "bg-red-50 border-red-200 text-red-900";
  };

  const getAttendanceColor = (rate: number): string => {
    if (rate >= 95) return "bg-green-50 border-green-200 text-green-900";
    if (rate >= 85) return "bg-yellow-50 border-yellow-200 text-yellow-900";
    if (rate >= 75) return "bg-orange-50 border-orange-200 text-orange-900";
    return "bg-red-50 border-red-200 text-red-900";
  };

  const getCompletionColor = (rate: number): string => {
    if (rate >= 80) return "bg-green-50 border-green-200 text-green-900";
    if (rate >= 60) return "bg-yellow-50 border-yellow-200 text-yellow-900";
    if (rate >= 40) return "bg-orange-50 border-orange-200 text-orange-900";
    return "bg-red-50 border-red-200 text-red-900";
  };

  const getScoreIcon = (score: number): string => {
    if (score >= 8) return "🌟";
    if (score >= 6) return "✅";
    if (score >= 4) return "⚠️";
    return "🔴";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Average Score Card */}
      <div className={`border-2 rounded-lg p-4 ${getScoreColor(stats.averageScore)}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="text-sm font-medium opacity-80">{t("average_score")}</div>
          <span className="text-2xl">{getScoreIcon(stats.averageScore)}</span>
        </div>
        <div className="text-3xl font-bold mb-1">{stats.averageScore}</div>
        <div className="text-xs opacity-75">
          Based on {stats.totalAssessments}{" "}
          {stats.totalAssessments === 1 ? "assessment" : "assessments"}
        </div>
      </div>

      {/* Total Assessments Card */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-blue-900">
        <div className="flex items-start justify-between mb-2">
          <div className="text-sm font-medium opacity-80">{t("total_assessments")}</div>
          <span className="text-2xl">📝</span>
        </div>
        <div className="text-3xl font-bold mb-1">{stats.totalAssessments}</div>
        <div className="text-xs opacity-75">Total recorded</div>
      </div>

      {/* Attendance Rate Card */}
      <div className={`border-2 rounded-lg p-4 ${getAttendanceColor(stats.attendanceRate)}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="text-sm font-medium opacity-80">{t("attendance_rate")}</div>
          <span className="text-2xl">📅</span>
        </div>
        <div className="text-3xl font-bold mb-1">{formatPercentage(stats.attendanceRate)}</div>
        <div className="text-xs opacity-75">Presence in class</div>
      </div>

      {/* Material Completion Card */}
      <div className={`border-2 rounded-lg p-4 ${getCompletionColor(stats.completionRate)}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="text-sm font-medium opacity-80">{t("completion_rate")}</div>
          <span className="text-2xl">📚</span>
        </div>
        <div className="text-3xl font-bold mb-1">{formatPercentage(stats.completionRate)}</div>
        <div className="text-xs opacity-75">Material mastery</div>
      </div>

      {/* Latest Cambridge Test (if exists) */}
      {stats.latestCambridgeTest && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-purple-900 sm:col-span-2 lg:col-span-4">
          <div className="flex items-start justify-between mb-2">
            <div className="text-sm font-medium opacity-80">Latest Cambridge Test</div>
            <span className="text-2xl">🎓</span>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <div className="text-2xl font-bold">
                {formatPercentage(stats.latestCambridgeTest.percentage)}
              </div>
              <div className="text-xs opacity-75">
                {stats.latestCambridgeTest.marks}/{stats.latestCambridgeTest.total_marks} marks
              </div>
            </div>
            <div className="text-sm">
              <div className="font-medium">{stats.latestCambridgeTest.stage}</div>
              <div className="opacity-75">{stats.latestCambridgeTest.paper_title}</div>
              <div className="opacity-75 text-xs">{stats.latestCambridgeTest.year}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSummaryCards;
