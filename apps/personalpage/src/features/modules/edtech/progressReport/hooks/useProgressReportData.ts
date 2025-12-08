import { useState, useCallback, useEffect } from "react";
import { ProgressReportData, StudentData } from "../types/ProgressReportTypes";
import Logger from "@websites/infrastructure/logging/logger";

const STORAGE_KEY = "progress_report_data";

const validateProgressReportData = (data: unknown): { valid: boolean; error?: string } => {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid data format: not an object" };
  }

  const dataObj = data as Record<string, unknown>;

  if (!dataObj.students || !Array.isArray(dataObj.students)) {
    return { valid: false, error: "Invalid data format: missing students array" };
  }

  if (dataObj.students.length === 0) {
    return { valid: false, error: "No students found in data" };
  }

  const requiredFields = ["first_name", "last_name", "class_name"];
  const firstStudent = dataObj.students[0];

  for (const field of requiredFields) {
    if (!(field in firstStudent)) {
      return { valid: false, error: `Invalid student data: missing ${field}` };
    }
  }

  return { valid: true };
};

export const useProgressReportData = () => {
  const [data, setData] = useState<ProgressReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setData(parsed);
        Logger.info("Loaded progress report data from localStorage", {
          studentCount: parsed?.students?.length || 0,
        });
      }
    } catch (error) {
      Logger.error("Failed to load progress report data from localStorage", { error });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadData = useCallback((newData: ProgressReportData) => {
    const validation = validateProgressReportData(newData);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    setData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      Logger.info("Saved progress report data to localStorage", {
        studentCount: newData.students.length,
      });
    } catch (error) {
      Logger.error("Failed to save progress report data to localStorage", { error });
      throw new Error("Failed to save data. Storage might be full.");
    }
  }, []);

  const setUnsavedChanges = useCallback((hasChanges: boolean) => {
    setHasUnsavedChanges(hasChanges);
    Logger.info(`Set unsaved changes flag to: ${hasChanges}`);
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      Logger.info("Cleared progress report data from localStorage");
    } catch (error) {
      Logger.error("Failed to clear progress report data from localStorage", { error });
    }
  }, []);

  const exportData = useCallback(() => {
    if (!data) return;

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    try {
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().split("T")[0];
      link.download = `progress_report_data_${timestamp}.json`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      Logger.info("Exported progress report data");
    } catch (error) {
      Logger.error("Failed to export progress report data", { error });
      throw new Error("Failed to export data");
    }
  }, [data]);

  const getStudentsByClass = useCallback(
    (className: string): StudentData[] => {
      if (!data) return [];
      return data.students.filter((s) => s.class_name === className);
    },
    [data]
  );

  const getUniqueClasses = useCallback((): string[] => {
    if (!data) return [];
    const classes = new Set(data.students.map((s) => s.class_name));
    return Array.from(classes).sort();
  }, [data]);

  const getStudentByName = useCallback(
    (firstName: string, lastName: string): StudentData | null => {
      if (!data) return null;
      return (
        data.students.find((s) => s.first_name === firstName && s.last_name === lastName) || null
      );
    },
    [data]
  );

  const searchStudents = useCallback(
    (query: string): StudentData[] => {
      if (!data || !query) return data?.students || [];

      const lowerQuery = query.toLowerCase();
      return data.students.filter(
        (s) =>
          s.first_name.toLowerCase().includes(lowerQuery) ||
          s.last_name.toLowerCase().includes(lowerQuery) ||
          `${s.first_name} ${s.last_name}`.toLowerCase().includes(lowerQuery)
      );
    },
    [data]
  );

  return {
    data,
    isLoading,
    loadData,
    clearData,
    exportData,
    getStudentsByClass,
    getUniqueClasses,
    getStudentByName,
    searchStudents,
    validateData: validateProgressReportData,
    hasUnsavedChanges,
    setUnsavedChanges,
  };
};
