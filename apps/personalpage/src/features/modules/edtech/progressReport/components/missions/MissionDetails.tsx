/**
 * Mission Details Component
 * Expanded view showing full mission details with objective-by-objective breakdown
 */

import React from "react";
import { CambridgeMission, MissionObjective } from "../../types/MissionTypes";
import {
  getStrandForObjective,
  getUnitsForObjective,
} from "@progressReport/student-data/config/cambridgeObjectiveMapping";

interface MissionDetailsProps {
  mission: CambridgeMission;
  studentName: string;
  onClose: () => void;
}

export const MissionDetails: React.FC<MissionDetailsProps> = ({
  mission,
  studentName,
  onClose,
}) => {
  const objectivesByStrand = Object.entries(mission.objectives).reduce(
    (acc, [code, obj]) => {
      const strand = getStrandForObjective(code) || "Unknown";
      if (!acc[strand]) acc[strand] = [];
      acc[strand].push({ code, ...obj });
      return acc;
    },
    {} as Record<string, Array<MissionObjective & { code: string }>>
  );

  const getScoreColor = (score: number | null): string => {
    if (score === null) return "text-gray-400";
    if (score === 1) return "text-green-600";
    if (score >= 0.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number | null): string => {
    if (score === null) return "⚪";
    if (score === 1) return "🟢";
    if (score >= 0.5) return "🟡";
    return "🔴";
  };

  const getImprovementBadge = (initial: number | null, current: number | null) => {
    if (initial === null || current === null || initial === current) return null;

    if (current > initial) {
      return (
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
          ↑ Improved
        </span>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{mission.title}</h2>
              <p className="text-gray-600 mt-1">{studentName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mission Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600 mb-1">Status</div>
              <div className="font-semibold">
                {mission.status === "completed" && "✅ Completed"}
                {mission.status === "in_progress" && "🟡 In Progress"}
                {mission.status === "not_started" && "⚪ Not Started"}
                {mission.status === "cancelled" && "❌ Cancelled"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Created</div>
              <div className="font-semibold">
                {new Date(mission.created_date).toLocaleDateString()}
              </div>
            </div>
            {mission.deadline && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Deadline</div>
                <div className="font-semibold">
                  {new Date(mission.deadline).toLocaleDateString()}
                </div>
              </div>
            )}
            {mission.completed_date && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Completed</div>
                <div className="font-semibold text-green-600">
                  {new Date(mission.completed_date).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>

          {/* Missing Points Progress */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Missing Points Progress</h3>
            <div className="flex items-baseline gap-3">
              <div>
                <span className="text-2xl font-bold text-red-600">
                  {mission.missing_points_current.toFixed(1)}
                </span>
                <span className="text-sm text-gray-600 ml-2">current</span>
              </div>
              <span className="text-gray-400">←</span>
              <div>
                <span className="text-xl text-gray-500">
                  {mission.missing_points_initial.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500 ml-2">initial</span>
              </div>
              {mission.missing_points_current < mission.missing_points_initial && (
                <div className="ml-auto text-green-600 font-semibold">
                  -{(mission.missing_points_initial - mission.missing_points_current).toFixed(1)}{" "}
                  improved! 🎉
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {mission.notes && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">📝 Notes</h3>
              <p className="text-gray-700">{mission.notes}</p>
            </div>
          )}

          {/* Objectives by Strand */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Objectives</h3>

            {Object.entries(objectivesByStrand).map(([strand, objectives]) => (
              <div key={strand} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-900">{strand}</div>
                <div className="divide-y divide-gray-200">
                  {objectives.map((obj) => (
                    <div key={obj.code} className="p-4 hover:bg-gray-50">
                      {/* Objective Header */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`text-2xl ${getScoreColor(obj.current_score)}`}>
                            {getScoreBadge(obj.current_score)}
                          </span>
                          <div>
                            <div className="font-mono font-semibold text-gray-900">{obj.code}</div>
                            <div className="text-xs text-gray-500">
                              Units:{" "}
                              {Array.isArray(getUnitsForObjective(obj.code))
                                ? getUnitsForObjective(obj.code).join(", ")
                                : getUnitsForObjective(obj.code)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getImprovementBadge(obj.initial_score, obj.current_score)}
                          <div className="text-sm text-blue-600 font-medium">
                            Use {obj.pd_assessment}
                          </div>
                        </div>
                      </div>

                      {/* Score Progress */}
                      <div className="flex items-center gap-4 mb-3 text-sm">
                        <span className="text-gray-600">Score:</span>
                        <span className={`font-semibold ${getScoreColor(obj.initial_score)}`}>
                          {obj.initial_score !== null ? obj.initial_score : "N/A"} (initial)
                        </span>
                        {obj.current_score !== obj.initial_score && (
                          <>
                            <span className="text-gray-400">→</span>
                            <span className={`font-semibold ${getScoreColor(obj.current_score)}`}>
                              {obj.current_score !== null ? obj.current_score : "N/A"} (current)
                            </span>
                          </>
                        )}
                      </div>

                      {/* Attempts */}
                      {obj.attempts.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs font-semibold text-gray-700 mb-2">
                            Assessment Attempts ({obj.attempts.length})
                          </div>
                          <div className="space-y-1">
                            {obj.attempts.map((attempt, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 text-xs bg-gray-50 rounded px-3 py-2"
                              >
                                <span className="text-gray-600">
                                  {new Date(attempt.date).toLocaleDateString()}
                                </span>
                                <span className="font-mono text-blue-600">
                                  {attempt.assessment_column}
                                </span>
                                <span className={`font-semibold ${getScoreColor(attempt.score)}`}>
                                  Score: {attempt.score !== null ? attempt.score : "N/A"}
                                </span>
                                {attempt.points !== undefined && (
                                  <span className="text-gray-600">Points: {attempt.points}</span>
                                )}
                                {attempt.myp_level !== undefined && (
                                  <span className="text-gray-600">MYP: {attempt.myp_level}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Last Updated */}
                      {obj.last_updated && (
                        <div className="mt-2 text-xs text-gray-500">
                          Last updated: {new Date(obj.last_updated).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
