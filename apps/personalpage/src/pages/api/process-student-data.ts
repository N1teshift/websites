/**
 * API endpoint for processing Excel student data (v5 format)
 * Handles Excel file upload with dynamic column detection
 *
 * V5 Features:
 * - Dynamic column detection (EXT, ND, SD, LNT auto-detected)
 * - Complex ND structure (NDX, NDX K, NDX T)
 * - TVARK/TAIS tracking columns
 * - Context from Excel Row 21/22
 */

import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs/promises";
import { StudentDataManagerV5 } from "@progressReport/student-data/utils/studentDataManagerV5";
import Logger from "@websites/infrastructure/logging/logger";

// Disable body parser to handle file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

interface ProcessingResponse {
  success: boolean;
  studentsUpdated?: number;
  assessmentsAdded?: number;
  newStudents?: number;
  message?: string;
  updatedData?: {
    metadata: {
      exported_at: string;
      schema_version: string;
      total_students: number;
      export_version: string;
      teacher_type: string;
      teacher_name: string;
      features?: string[];
    };
    students: unknown[];
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProcessingResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  let tempFilePath: string | undefined;

  try {
    // Parse the form data with formidable
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB max
    });

    const [fields, files] = await form.parse(req);

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    tempFilePath = file.filepath;

    // Get selected columns from fields
    let selectedColumns: string[] | undefined;
    if (fields.selectedColumns) {
      const columnsField = Array.isArray(fields.selectedColumns)
        ? fields.selectedColumns[0]
        : fields.selectedColumns;
      try {
        selectedColumns = JSON.parse(columnsField);
      } catch (e) {
        Logger.warn("Failed to parse selectedColumns", { error: e });
      }
    }

    Logger.info("Processing Excel upload (v5 - dynamic columns)", {
      filename: file.originalFilename,
      size: file.size,
      selectedColumns: selectedColumns ? selectedColumns.length : "all",
    });

    // Process the Excel file with V5 (dynamic columns + context)
    const manager = new StudentDataManagerV5();
    const result = await manager.processExcelFile(tempFilePath, selectedColumns);

    Logger.info("Excel processing complete (v5), exporting updated collection");

    // Export the updated data to get the complete dataset
    const students = await manager.loadAllStudents();
    const studentsList = Array.from(students.values());

    // Sort by class name, then by last name
    studentsList.sort((a, b) => {
      if (a.class_name !== b.class_name) {
        return a.class_name.localeCompare(b.class_name);
      }
      return a.last_name.localeCompare(b.last_name);
    });

    const updatedData = {
      metadata: {
        exported_at: new Date().toISOString(),
        schema_version: "5.0",
        total_students: studentsList.length,
        export_version: "v5.0-dynamic-columns",
        teacher_type: "main",
        teacher_name: "Main Teacher (Math)",
        features: [
          "Dynamic column detection",
          "Complex ND structure (NDX, NDX K, NDX T)",
          "TVARK/TAIS tracking",
          "Context-aware assessments",
        ],
      },
      students: studentsList,
    };

    Logger.info("Returning updated collection to client", { studentCount: studentsList.length });

    // Return results with the updated data
    return res.status(200).json({
      success: true,
      studentsUpdated: result.studentsUpdated,
      assessmentsAdded: result.assessmentsAdded,
      newStudents: result.newStudents,
      updatedData: updatedData,
      message: `Successfully processed: ${result.studentsUpdated} students updated, ${result.assessmentsAdded} assessments added, ${result.newStudents} new students created`,
    });
  } catch (error) {
    Logger.error("Excel processing API error", { error });

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    });
  } finally {
    // Clean up temp file
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupError) {
        Logger.warn("Failed to cleanup temp file", { error: cleanupError });
      }
    }
  }
}
