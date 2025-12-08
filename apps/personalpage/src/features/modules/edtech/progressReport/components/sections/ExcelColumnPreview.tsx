/**
 * Excel Column Preview Component
 * Displays columns from Excel file with selection checkboxes
 */

import React, { useState, useMemo } from "react";

export interface ColumnInfo {
  columnName: string;
  type: string;
  taskName: string;
  description: string;
  dateFound: string | null;
  sampleValues: (string | number | null)[];
  hasData: boolean;
}

export interface SheetPreview {
  sheetName: string;
  className: string;
  studentCount: number;
  columns: ColumnInfo[];
}

interface ExcelColumnPreviewProps {
  sheets: SheetPreview[];
  onConfirm: (selectedColumns: string[]) => void;
  onCancel: () => void;
}

const ExcelColumnPreview: React.FC<ExcelColumnPreviewProps> = ({ sheets, onConfirm, onCancel }) => {
  // Initialize all columns as selected
  const allColumns = useMemo(() => {
    return sheets.flatMap((sheet) => sheet.columns.map((col) => col.columnName));
  }, [sheets]);

  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set(allColumns));

  const handleToggleColumn = (columnName: string) => {
    setSelectedColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(columnName)) {
        newSet.delete(columnName);
      } else {
        newSet.add(columnName);
      }
      return newSet;
    });
  };

  const handleToggleAll = () => {
    if (selectedColumns.size === allColumns.length) {
      // Deselect all
      setSelectedColumns(new Set());
    } else {
      // Select all
      setSelectedColumns(new Set(allColumns));
    }
  };

  const handleSelectByType = (type: string) => {
    const columnsOfType = sheets.flatMap((sheet) =>
      sheet.columns.filter((col) => col.type === type).map((col) => col.columnName)
    );

    setSelectedColumns((prev) => {
      const newSet = new Set(prev);
      columnsOfType.forEach((col) => newSet.add(col));
      return newSet;
    });
  };

  const handleDeselectByType = (type: string) => {
    const columnsOfType = sheets.flatMap((sheet) =>
      sheet.columns.filter((col) => col.type === type).map((col) => col.columnName)
    );

    setSelectedColumns((prev) => {
      const newSet = new Set(prev);
      columnsOfType.forEach((col) => newSet.delete(col));
      return newSet;
    });
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedColumns));
  };

  // Group columns by type
  const columnsByType = useMemo(() => {
    const types = new Map<string, ColumnInfo[]>();

    sheets.forEach((sheet) => {
      sheet.columns.forEach((col) => {
        if (!types.has(col.type)) {
          types.set(col.type, []);
        }
        types.get(col.type)!.push(col);
      });
    });

    return types;
  }, [sheets]);

  const getTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      classwork: "bg-blue-50 border-blue-200 text-blue-800",
      participation: "bg-purple-50 border-purple-200 text-purple-800",
      summative: "bg-red-50 border-red-200 text-red-800",
      homework: "bg-green-50 border-green-200 text-green-800",
      consultation: "bg-yellow-50 border-yellow-200 text-yellow-800",
      social_hours: "bg-pink-50 border-pink-200 text-pink-800",
      comment: "bg-gray-50 border-gray-200 text-gray-800",
    };
    return colors[type] || "bg-gray-50 border-gray-200 text-gray-800";
  };

  const totalColumns = allColumns.length;
  const selectedCount = selectedColumns.size;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          📊 Excel Preview - Select Columns to Import
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Found <strong>{totalColumns} columns</strong> across{" "}
          <strong>{sheets.length} sheets</strong>. Select which columns you want to import into the
          database.
        </p>
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-blue-800">
            Selected: {selectedCount} / {totalColumns} columns
          </div>
          <button
            onClick={handleToggleAll}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            {selectedColumns.size === allColumns.length ? "Deselect All" : "Select All"}
          </button>
        </div>
      </div>

      {/* Quick filters by type */}
      <div className="flex flex-wrap gap-2">
        {Array.from(columnsByType.keys()).map((type) => {
          const typeColumns = columnsByType.get(type)!;
          const selectedOfType = typeColumns.filter((col) =>
            selectedColumns.has(col.columnName)
          ).length;

          return (
            <div key={type} className="flex items-center gap-1">
              <button
                onClick={() => handleSelectByType(type)}
                className={`px-2 py-1 text-xs rounded border ${getTypeColor(type)} hover:opacity-80`}
              >
                ✓ {type} ({selectedOfType}/{typeColumns.length})
              </button>
              {selectedOfType > 0 && (
                <button
                  onClick={() => handleDeselectByType(type)}
                  className="text-xs text-red-600 hover:text-red-800"
                  title={`Deselect all ${type}`}
                >
                  ✗
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Sheets and columns */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg p-4">
        {sheets.map((sheet) => (
          <div key={sheet.sheetName} className="space-y-2">
            <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2 sticky top-0 bg-white py-2 border-b">
              <span>📄</span>
              <span>{sheet.className}</span>
              <span className="text-sm font-normal text-gray-500">
                ({sheet.studentCount} students)
              </span>
            </h4>

            <div className="space-y-2 pl-6">
              {sheet.columns.map((column) => {
                const isSelected = selectedColumns.has(column.columnName);

                return (
                  <div
                    key={`${sheet.sheetName}-${column.columnName}`}
                    className={`border rounded-lg p-3 transition-all ${
                      isSelected
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 bg-gray-50 opacity-60"
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleColumn(column.columnName)}
                        className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{column.columnName}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded border ${getTypeColor(column.type)}`}
                          >
                            {column.type}
                          </span>
                          {!column.hasData && (
                            <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 border border-yellow-300 text-yellow-800">
                              No data
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-600">{column.taskName}</div>

                        {column.dateFound && (
                          <div className="text-xs text-gray-500">📅 Date: {column.dateFound}</div>
                        )}

                        {column.sampleValues.length > 0 && column.hasData && (
                          <div className="text-xs text-gray-500">
                            Sample:{" "}
                            {column.sampleValues.filter((v) => v !== null).join(", ") || "Empty"}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          onClick={handleConfirm}
          disabled={selectedCount === 0}
          className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Import Selected Columns ({selectedCount})
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ExcelColumnPreview;
