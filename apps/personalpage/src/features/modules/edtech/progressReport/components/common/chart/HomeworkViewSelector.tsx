import React from "react";

interface HomeworkViewSelectorProps {
  viewMode: "completion" | "scores";
  onViewModeChange: (mode: "completion" | "scores") => void;
  t: (key: string) => string;
}

/**
 * Dropdown selector for homework view mode (completion vs scores)
 */
export const HomeworkViewSelector: React.FC<HomeworkViewSelectorProps> = ({
  viewMode,
  onViewModeChange,
  t,
}) => {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">View:</label>
      <select
        value={viewMode}
        onChange={(e) => onViewModeChange(e.target.value as "completion" | "scores")}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
      >
        <option value="completion">{t("completion")} (Binary)</option>
        <option value="scores">{t("score")} Distribution (1-10)</option>
      </select>
    </div>
  );
};
