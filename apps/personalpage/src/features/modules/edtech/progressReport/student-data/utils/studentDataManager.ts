/**
 * Student Data Manager - Main orchestrator for processing Excel data
 * Handles loading, processing, and saving student data
 */

import fs from "fs/promises";
import path from "path";
import { StudentData, StudentDataCollection, ProcessingResult } from "../types/StudentDataTypes";
import { ExcelReader, SheetData } from "./excelReader";
import { DataProcessor } from "../processors/dataProcessor";
import { STANDARD_COLUMNS } from "../config/columnMapping";
import Logger from "@websites/infrastructure/logging/logger";

export class StudentDataManager {
  private dataDirectory: string;
  private excelReader: ExcelReader;
  private dataProcessor: DataProcessor;

  constructor(dataDirectory?: string) {
    // Default to the feature data directory
    this.dataDirectory =
      dataDirectory || path.join(process.cwd(), "src", "features", "student-data", "data");
    this.excelReader = new ExcelReader();
    this.dataProcessor = new DataProcessor();
  }

  /**
   * Main processing workflow
   */
  async processExcelFile(excelFilePath: string): Promise<ProcessingResult> {
    const result: ProcessingResult = {
      success: false,
      studentsProcessed: 0,
      assessmentsAdded: 0,
      errors: [],
      warnings: [],
    };

    try {
      Logger.info("Starting Excel processing", { excelFilePath });

      // Step 1: Read Excel file
      await this.excelReader.readFromFile(excelFilePath);
      const sheetsData = await this.excelReader.readAllSummativeSheets();

      if (sheetsData.length === 0) {
        throw new Error("No valid sheets found in Excel file");
      }

      // Step 2: Load existing student data
      const studentData = await this.loadStudentData();

      // Step 3: Process each sheet
      for (const sheetData of sheetsData) {
        try {
          const sheetResult = await this.processSheet(sheetData, studentData);
          result.studentsProcessed += sheetResult.studentsProcessed;
          result.assessmentsAdded += sheetResult.assessmentsAdded;
        } catch (error) {
          const errorMsg = `Failed to process sheet ${sheetData.sheetName}: ${error}`;
          result.errors.push(errorMsg);
          Logger.error(errorMsg, { error });
        }
      }

      // Step 4: Save updated student data
      await this.saveStudentData(studentData);

      result.success = result.errors.length === 0;

      Logger.info("Excel processing complete", {
        studentsProcessed: result.studentsProcessed,
        assessmentsAdded: result.assessmentsAdded,
        errors: result.errors.length,
        warnings: result.warnings.length,
      });

      return result;
    } catch (error) {
      const errorMsg = `Failed to process Excel file: ${error}`;
      result.errors.push(errorMsg);
      Logger.error(errorMsg, { error });
      return result;
    }
  }

  /**
   * Process Excel from buffer (for browser/API usage)
   */
  async processExcelBuffer(buffer: ArrayBuffer): Promise<ProcessingResult> {
    const result: ProcessingResult = {
      success: false,
      studentsProcessed: 0,
      assessmentsAdded: 0,
      errors: [],
      warnings: [],
    };

    try {
      Logger.info("Starting Excel processing from buffer");

      // Step 1: Read Excel buffer
      await this.excelReader.readFromBuffer(buffer);
      const sheetsData = await this.excelReader.readAllSummativeSheets();

      if (sheetsData.length === 0) {
        throw new Error("No valid sheets found in Excel file");
      }

      // Step 2: Load existing student data
      const studentData = await this.loadStudentData();

      // Step 3: Process each sheet
      for (const sheetData of sheetsData) {
        try {
          const sheetResult = await this.processSheet(sheetData, studentData);
          result.studentsProcessed += sheetResult.studentsProcessed;
          result.assessmentsAdded += sheetResult.assessmentsAdded;
        } catch (error) {
          const errorMsg = `Failed to process sheet ${sheetData.sheetName}: ${error}`;
          result.errors.push(errorMsg);
          Logger.error(errorMsg, { error });
        }
      }

      // Step 4: Save updated student data
      await this.saveStudentData(studentData);

      result.success = result.errors.length === 0;

      Logger.info("Excel processing from buffer complete", {
        studentsProcessed: result.studentsProcessed,
        assessmentsAdded: result.assessmentsAdded,
      });

      return result;
    } catch (error) {
      const errorMsg = `Failed to process Excel buffer: ${error}`;
      result.errors.push(errorMsg);
      Logger.error(errorMsg, { error });
      return result;
    }
  }

  /**
   * Process a single sheet
   */
  private async processSheet(
    sheetData: SheetData,
    studentData: StudentData[]
  ): Promise<{ studentsProcessed: number; assessmentsAdded: number }> {
    let studentsProcessed = 0;
    let assessmentsAdded = 0;

    for (const row of sheetData.students) {
      const firstName = String(row[STANDARD_COLUMNS.FIRST_NAME] || "").trim();
      const lastName = String(row[STANDARD_COLUMNS.LAST_NAME] || "").trim();

      if (!firstName || !lastName) {
        continue;
      }

      // Find or create student (with name alias resolution)
      let student = this.dataProcessor.findStudent(
        studentData,
        firstName,
        lastName,
        sheetData.className
      );

      if (!student) {
        // Create new student if not found
        student = this.dataProcessor.createNewStudent(firstName, lastName, sheetData.className);
        studentData.push(student);
        Logger.info("Created new student", { firstName, lastName, className: sheetData.className });
      }

      // Process student row
      const processResult = this.dataProcessor.processStudentRow(
        student,
        row,
        sheetData.columnDates
      );

      if (processResult.modified) {
        studentsProcessed++;
        assessmentsAdded += processResult.assessmentsAdded;
      }
    }

    return { studentsProcessed, assessmentsAdded };
  }

  /**
   * Load all student data from JSON files
   */
  private async loadStudentData(): Promise<StudentData[]> {
    try {
      const files = await fs.readdir(this.dataDirectory);
      const studentFiles = files.filter((f) => f.endsWith(".json") && f !== "_metadata.json");

      const students: StudentData[] = [];

      for (const file of studentFiles) {
        try {
          const filePath = path.join(this.dataDirectory, file);
          const content = await fs.readFile(filePath, "utf-8");
          const student = JSON.parse(content) as StudentData;
          students.push(student);
        } catch (error) {
          Logger.warn("Failed to load student file", { file, error });
        }
      }

      Logger.info("Loaded student data", { count: students.length });
      return students;
    } catch (error) {
      Logger.error("Failed to load student data directory", { error });
      throw new Error(`Failed to load student data: ${error}`);
    }
  }

  /**
   * Save all student data back to JSON files
   */
  private async saveStudentData(students: StudentData[]): Promise<void> {
    try {
      for (const student of students) {
        const fileName = this.generateFileName(student);
        const filePath = path.join(this.dataDirectory, fileName);
        const content = JSON.stringify(student, null, 2);

        await fs.writeFile(filePath, content, "utf-8");
      }

      Logger.info("Saved student data", { count: students.length });
    } catch (error) {
      Logger.error("Failed to save student data", { error });
      throw new Error(`Failed to save student data: ${error}`);
    }
  }

  /**
   * Generate file name for student
   */
  private generateFileName(student: StudentData): string {
    const className = student.class_name.replace(/\s+/g, "_");
    const lastName = student.last_name.replace(/\s+/g, "_");
    const firstName = student.first_name.replace(/\s+/g, "_");
    return `${className}_${lastName}_${firstName}.json`;
  }

  /**
   * Export all student data as a single collection file
   */
  async exportCollection(outputPath: string): Promise<void> {
    try {
      const students = await this.loadStudentData();

      const collection: StudentDataCollection = {
        students,
        metadata: {
          created: new Date().toISOString().split("T")[0],
          last_updated: new Date().toISOString().split("T")[0],
          version: "3.0",
          schema_version: "2.0",
          total_students: students.length,
        },
      };

      const content = JSON.stringify(collection, null, 2);
      await fs.writeFile(outputPath, content, "utf-8");

      Logger.info("Exported student collection", { outputPath, count: students.length });
    } catch (error) {
      Logger.error("Failed to export collection", { error });
      throw new Error(`Failed to export collection: ${error}`);
    }
  }
}
