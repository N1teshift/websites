/**
 * Excel file upload component for processing student data with preview
 */

import React, { useState, useRef } from "react";
import Logger from "@websites/infrastructure/logging/logger";
import ExcelColumnPreview, { SheetPreview } from "./ExcelColumnPreview";
import { ProgressReportData } from "../../types/ProgressReportTypes";

interface ExcelUploadResult {
  success: boolean;
  studentsUpdated?: number;
  assessmentsAdded?: number;
  newStudents?: number;
  message?: string;
  updatedData?: unknown; // The complete updated dataset
}

interface PreviewResponse {
  success: boolean;
  sheets?: SheetPreview[];
  totalColumns?: number;
  message?: string;
}

interface ExcelFileUploadProps {
  onSuccess: () => void;
  buttonText?: string;
}

type UploadStep = "select" | "preview" | "processing" | "result";

const ExcelFileUpload: React.FC<ExcelFileUploadProps> = ({ onSuccess, buttonText }) => {
  const [step, setStep] = useState<UploadStep>("select");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<SheetPreview[] | null>(null);
  const [result, setResult] = useState<ExcelUploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file extension
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setResult({
        success: false,
        message: "Please select an Excel file (.xlsx or .xls)",
      });
      setStep("result");
      return;
    }

    setSelectedFile(file);
    setStep("processing");
    setResult(null);

    try {
      Logger.info("Generating preview for Excel file", { filename: file.name, size: file.size });

      // Create FormData for preview
      const formData = new FormData();
      formData.append("file", file);

      // Get preview from API
      const response = await fetch("/api/preview-student-data", {
        method: "POST",
        body: formData,
      });

      const data: PreviewResponse = await response.json();

      if (data.success && data.sheets) {
        Logger.info("Preview generated", {
          sheets: data.sheets.length,
          totalColumns: data.totalColumns,
          sheetDetails: data.sheets.map((s) => ({
            name: s.sheetName,
            columnCount: s.columns.length,
            sdColumns: s.columns
              .filter((c) => c.columnName.startsWith("SD"))
              .map((c) => c.columnName),
          })),
        });
        setPreviewData(data.sheets);
        setStep("preview");
      } else {
        setResult({
          success: false,
          message: data.message || "Failed to generate preview",
        });
        setStep("result");
      }
    } catch (error) {
      Logger.error("Preview generation error", { error });
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Preview failed",
      });
      setStep("result");
    }
  };

  const handleConfirmImport = async (selectedColumns: string[]) => {
    if (!selectedFile) return;

    setStep("processing");
    setResult(null);

    try {
      Logger.info("Processing Excel with selected columns", {
        filename: selectedFile.name,
        selectedColumns: selectedColumns.length,
      });

      // Create FormData
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("selectedColumns", JSON.stringify(selectedColumns));

      // Upload to API
      const response = await fetch("/api/process-student-data", {
        method: "POST",
        body: formData,
      });

      const data: ExcelUploadResult = await response.json();

      setResult(data);
      setStep("result");

      if (data.success) {
        Logger.info("Excel processing successful (v4)", {
          studentsUpdated: data.studentsUpdated,
          assessmentsAdded: data.assessmentsAdded,
          newStudents: data.newStudents,
          hasUpdatedData: !!data.updatedData,
        });

        // If we received updated data, save it to localStorage automatically
        if (data.updatedData) {
          try {
            const updatedData = data.updatedData as ProgressReportData;
            localStorage.setItem("progress_report_data", JSON.stringify(updatedData));
            Logger.info("✨ Auto-synced updated data to browser", {
              studentCount: updatedData.students?.length || 0,
            });
          } catch (error) {
            Logger.error("Failed to save updated data to localStorage", { error });
          }
        }

        // Call success callback after a short delay to show results
        setTimeout(() => {
          onSuccess();
          handleReset();
        }, 3000);
      } else {
        Logger.error("Excel processing failed", { message: data.message });
      }
    } catch (error) {
      Logger.error("Excel upload error", { error });
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
      });
      setStep("result");
    }
  };

  const handleCancelPreview = () => {
    handleReset();
  };

  const handleReset = () => {
    setStep("select");
    setSelectedFile(null);
    setPreviewData(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
        disabled={step === "processing"}
      />

      {/* Step 1: Select file */}
      {step === "select" && (
        <>
          <button
            onClick={handleButtonClick}
            className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors touch-manipulation min-h-[44px]"
          >
            <span className="mr-2">📊</span>
            {buttonText || "Select & Preview Excel File"}
          </button>

          <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded p-3">
            <div className="font-semibold mb-1">📋 New: Column Preview & Selection</div>
            <ul className="list-disc list-inside pl-2 space-y-0.5">
              <li>Upload Excel to preview all available columns</li>
              <li>Select which columns you want to import</li>
              <li>Deselect columns you don&apos;t need</li>
              <li>Confirm to import only selected data</li>
            </ul>
          </div>
        </>
      )}

      {/* Step 2: Processing/Loading */}
      {step === "processing" && (
        <div className="border rounded-md p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-center space-x-3">
            <span className="text-2xl animate-spin">⏳</span>
            <div className="text-blue-800 font-medium">
              {selectedFile ? "Generating preview..." : "Processing..."}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Preview and column selection */}
      {step === "preview" && previewData && (
        <div className="border border-blue-300 rounded-lg p-4 bg-white">
          <ExcelColumnPreview
            sheets={previewData}
            onConfirm={handleConfirmImport}
            onCancel={handleCancelPreview}
          />
        </div>
      )}

      {/* Step 4: Result */}
      {step === "result" && result && (
        <>
          <div
            className={`border rounded-md p-4 ${
              result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-start space-x-2">
              <span className={`text-xl ${result.success ? "text-green-600" : "text-red-600"}`}>
                {result.success ? "✓" : "✗"}
              </span>
              <div className="flex-1 space-y-2">
                <div
                  className={`font-medium ${result.success ? "text-green-800" : "text-red-800"}`}
                >
                  {result.message}
                </div>

                {result.success && (
                  <div className="text-sm text-gray-700 space-y-1">
                    {result.studentsUpdated !== undefined && (
                      <div>
                        👥 Students updated:{" "}
                        <span className="font-semibold">{result.studentsUpdated}</span>
                      </div>
                    )}
                    {result.assessmentsAdded !== undefined && (
                      <div>
                        📝 Assessments added:{" "}
                        <span className="font-semibold">{result.assessmentsAdded}</span>
                      </div>
                    )}
                    {result.newStudents !== undefined && result.newStudents > 0 && (
                      <div>
                        ✨ New students: <span className="font-semibold">{result.newStudents}</span>
                      </div>
                    )}
                    {!!result.updatedData && (
                      <div className="mt-2 pt-2 border-t border-green-200">
                        <div className="flex items-center gap-2 text-green-700 font-semibold">
                          <span>🔄</span>
                          <span>Auto-synced to browser!</span>
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          Your dashboard will reload with the updated data automatically.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
          >
            Upload Another File
          </button>
        </>
      )}
    </div>
  );
};

export default ExcelFileUpload;
