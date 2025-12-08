import React, { useState } from "react";

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

interface DateRangeFilterProps {
  onRangeChange: (range: DateRange) => void;
  currentRange: DateRange;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ onRangeChange, currentRange }) => {
  const [customMode, setCustomMode] = useState(false);

  const getPresetRange = (preset: string): DateRange => {
    const now = new Date();
    let startDate: Date;

    switch (preset) {
      case "last_month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case "last_3_months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case "last_6_months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case "this_year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "all":
        return { startDate: null, endDate: null };
      default:
        return { startDate: null, endDate: null };
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
    };
  };

  const handlePresetClick = (preset: string) => {
    setCustomMode(false);
    onRangeChange(getPresetRange(preset));
  };

  const handleCustomChange = (field: "startDate" | "endDate", value: string) => {
    onRangeChange({
      ...currentRange,
      [field]: value || null,
    });
  };

  const handleClear = () => {
    setCustomMode(false);
    onRangeChange({ startDate: null, endDate: null });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">Date Range Filter</h4>
        {(currentRange.startDate || currentRange.endDate) && (
          <button onClick={handleClear} className="text-sm text-red-600 hover:text-red-800">
            Clear
          </button>
        )}
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handlePresetClick("last_month")}
          className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
        >
          Last Month
        </button>
        <button
          onClick={() => handlePresetClick("last_3_months")}
          className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
        >
          Last 3 Months
        </button>
        <button
          onClick={() => handlePresetClick("last_6_months")}
          className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
        >
          Last 6 Months
        </button>
        <button
          onClick={() => handlePresetClick("this_year")}
          className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
        >
          This Year
        </button>
        <button
          onClick={() => handlePresetClick("all")}
          className="px-3 py-1.5 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
        >
          All Time
        </button>
        <button
          onClick={() => setCustomMode(!customMode)}
          className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 border border-purple-200 rounded hover:bg-purple-100 transition-colors"
        >
          Custom
        </button>
      </div>

      {/* Custom Date Inputs */}
      {customMode && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={currentRange.startDate || ""}
              onChange={(e) => handleCustomChange("startDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={currentRange.endDate || ""}
              onChange={(e) => handleCustomChange("endDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Current Range Display */}
      {(currentRange.startDate || currentRange.endDate) && (
        <div className="text-sm text-gray-600 pt-2 border-t border-gray-200">
          <span className="font-medium">Active Range: </span>
          {currentRange.startDate ? new Date(currentRange.startDate).toLocaleDateString() : "Any"}
          {" - "}
          {currentRange.endDate ? new Date(currentRange.endDate).toLocaleDateString() : "Any"}
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
