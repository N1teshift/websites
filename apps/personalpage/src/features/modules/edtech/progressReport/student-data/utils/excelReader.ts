/**
 * Excel file reading and parsing utility
 * Handles reading Excel files with date extraction from row 1 and column names from row 2
 */

import ExcelJS from "exceljs";
import { ExcelRowData } from "../types/StudentDataTypes";
import { CLASS_SHEET_MAPPING, STANDARD_COLUMNS } from "../config/columnMapping";
import Logger from "@websites/infrastructure/logging/logger";

export interface SheetData {
  className: string;
  sheetName: string;
  students: ExcelRowData[];
  columnDates: Map<string, string>;
  columnContext: Map<string, string>;
}

export class ExcelReader {
  private workbook: ExcelJS.Workbook;
  private currentDate: string;

  constructor() {
    this.workbook = new ExcelJS.Workbook();
    this.currentDate = new Date().toISOString().split("T")[0];
  }

  /**
   * Read Excel file from file path
   */
  async readFromFile(filePath: string): Promise<void> {
    try {
      await this.workbook.xlsx.readFile(filePath);
      Logger.info("Excel file loaded successfully", { filePath });
    } catch (error) {
      Logger.error("Failed to read Excel file", { error, filePath });
      throw new Error(`Failed to read Excel file: ${error}`);
    }
  }

  /**
   * Read Excel file from buffer (for browser/API usage)
   */
  async readFromBuffer(buffer: ArrayBuffer): Promise<void> {
    try {
      await this.workbook.xlsx.load(buffer);
      Logger.info("Excel file loaded from buffer");
    } catch (error) {
      Logger.error("Failed to read Excel buffer", { error });
      throw new Error(`Failed to read Excel buffer: ${error}`);
    }
  }

  /**
   * Read all _S sheets (summative assessment sheets)
   */
  async readAllSummativeSheets(): Promise<SheetData[]> {
    const sheetsData: SheetData[] = [];

    for (const [sheetName, className] of Object.entries(CLASS_SHEET_MAPPING)) {
      try {
        const sheetData = await this.readSheet(sheetName, className);
        if (sheetData) {
          sheetsData.push(sheetData);
          Logger.info("Loaded sheet", {
            sheetName,
            className,
            studentCount: sheetData.students.length,
          });
        }
      } catch (error) {
        Logger.warn("Could not read sheet", { sheetName, error });
      }
    }

    if (sheetsData.length === 0) {
      throw new Error("No data loaded from Excel file");
    }

    return sheetsData;
  }

  /**
   * Read a single sheet with date extraction from row 1 and context from the last data row
   */
  private async readSheet(sheetName: string, className: string): Promise<SheetData | null> {
    const worksheet = this.workbook.getWorksheet(sheetName);

    if (!worksheet) {
      Logger.warn("Sheet not found", { sheetName });
      return null;
    }

    // Get dates from row 1 and column names from row 2
    const dateRow = worksheet.getRow(1);
    const headerRow = worksheet.getRow(2);

    // Create mapping of column names to dates and contexts
    const columnDates = new Map<string, string>();
    const columnContext = new Map<string, string>();
    const columnNames: string[] = [];

    headerRow.eachCell((cell, colNumber) => {
      const columnName = this.getCellValue(cell);
      if (columnName) {
        const columnNameStr = String(columnName);
        columnNames[colNumber] = columnNameStr;

        // Get date from row 1 for this column
        const dateCell = dateRow.getCell(colNumber);
        const dateValue = this.extractDate(dateCell);
        columnDates.set(columnNameStr, dateValue);
      }
    });

    // Read student data (starting from row 3) and find context row
    const students: ExcelRowData[] = [];
    let lastStudentRow = 0;

    worksheet.eachRow((row, rowNumber) => {
      // Skip header rows (1 and 2)
      if (rowNumber <= 2) return;

      const studentData: ExcelRowData = {};
      let hasData = false;

      row.eachCell((cell, colNumber) => {
        const columnName = columnNames[colNumber];
        if (columnName) {
          const value = this.getCellValue(cell);
          studentData[columnName] = value;

          // Check if this row has student name data
          if (columnName === STANDARD_COLUMNS.FIRST_NAME && value) {
            hasData = true;
          }
        }
      });

      // Only add rows with student names
      if (
        hasData &&
        studentData[STANDARD_COLUMNS.FIRST_NAME] &&
        studentData[STANDARD_COLUMNS.LAST_NAME]
      ) {
        students.push(studentData);
        lastStudentRow = rowNumber;
      }
    });

    // Read context row (row after last student, typically row 21 or 22)
    const contextRowNumber = lastStudentRow + 1;
    const contextRow = worksheet.getRow(contextRowNumber);

    contextRow.eachCell((cell, colNumber) => {
      const columnName = columnNames[colNumber];
      if (columnName) {
        const contextValue = this.getCellValue(cell);
        if (contextValue) {
          columnContext.set(columnName, String(contextValue));
          Logger.debug("Read context for column", {
            sheetName,
            column: columnName,
            context: String(contextValue).substring(0, 50),
          });
        }
      }
    });

    Logger.info("Sheet processed with context", {
      sheetName,
      students: students.length,
      contextRowNumber,
      contextsFound: columnContext.size,
    });

    return {
      className,
      sheetName,
      students,
      columnDates,
      columnContext,
    };
  }

  /**
   * Extract date from cell, handling various formats
   */
  private extractDate(cell: ExcelJS.Cell): string {
    const value = cell.value;

    if (!value) {
      return this.currentDate;
    }

    // Handle Date objects
    if (value instanceof Date) {
      return this.formatDate(value);
    }

    // Handle date numbers (Excel stores dates as numbers)
    if (typeof value === "number") {
      const date = this.excelDateToJSDate(value);
      return this.formatDate(date);
    }

    // Handle string dates
    if (typeof value === "string") {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return this.formatDate(parsed);
      }
    }

    // Default to current date
    return this.currentDate;
  }

  /**
   * Convert Excel date number to JavaScript Date
   */
  private excelDateToJSDate(excelDate: number): Date {
    // Excel date system starts from 1900-01-01
    // But there's a leap year bug in Excel (1900 is not a leap year but Excel thinks it is)
    const daysOffset = excelDate > 59 ? 1 : 0;
    const date = new Date(1900, 0, excelDate - daysOffset);
    return date;
  }

  /**
   * Format date to YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Extract cell value, handling various cell types
   */
  private getCellValue(cell: ExcelJS.Cell): string | number | null {
    const value = cell.value;

    if (value === null || value === undefined) {
      return null;
    }

    // Handle formula cells
    if (typeof value === "object" && "result" in value) {
      return value.result as string | number;
    }

    // Handle rich text
    if (typeof value === "object" && "richText" in value) {
      return (value as ExcelJS.CellRichTextValue).richText.map((rt) => rt.text).join("");
    }

    // Handle hyperlinks
    if (typeof value === "object" && "text" in value) {
      return (value as ExcelJS.CellHyperlinkValue).text;
    }

    // Handle dates
    if (value instanceof Date) {
      return this.formatDate(value);
    }

    // Handle strings and numbers
    if (typeof value === "string" || typeof value === "number") {
      return value;
    }

    return String(value);
  }

  /**
   * Get date for a specific column
   */
  getColumnDate(columnName: string, columnDates: Map<string, string>): string {
    return columnDates.get(columnName) || this.currentDate;
  }
}
