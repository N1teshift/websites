import React from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";
import { Assessment } from "../../../types/ProgressReportTypes";

interface AssessmentTableProps {
  assessments: Assessment[];
  showRowNumbers?: boolean;
  emptyMessage?: string;
}

// Binary columns that should display "Completed" / "Not completed"
const BINARY_COLUMNS = ["ND1", "D1", "D2", "ND2", "ND4", "ND5"];

const AssessmentTable: React.FC<AssessmentTableProps> = ({
  assessments,
  showRowNumbers = false,
  emptyMessage,
}) => {
  const { t } = useFallbackTranslation();

  const formatScore = (assessment: Assessment): React.ReactNode => {
    // Check if this is a binary column
    if (BINARY_COLUMNS.includes(assessment.column)) {
      const isCompleted =
        assessment.score === "1" || assessment.score === "1.0" || assessment.score === "1?";

      if (isCompleted) {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            {t("completed")}
          </span>
        );
      } else {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
            {t("not_completed")}
          </span>
        );
      }
    }

    // For non-binary columns, display the score as-is
    return assessment.score;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {showRowNumbers && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
            )}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {t("date")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {t("task")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {t("type")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {t("score")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {t("comment")}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {assessments.length > 0 ? (
            assessments.map((assessment, index) => (
              <tr key={index}>
                {showRowNumbers && <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>}
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {assessment.date}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{assessment.task_name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{assessment.type}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {formatScore(assessment)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{assessment.comment || "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={showRowNumbers ? 6 : 5} className="px-4 py-8 text-center text-gray-500">
                {emptyMessage || t("no_assessments")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssessmentTable;
