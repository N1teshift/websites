/**
 * API endpoint for previewing Excel student data columns
 * Returns column information with dynamic column detection
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
import { ExcelReader } from '@progressReport/student-data/utils/excelReader';
import { SUMMATIVE_SHEET_COLUMNS } from '@progressReport/student-data/config/columnMapping';
import { detectColumnType } from '@progressReport/student-data/utils/dynamicColumnMapper';
import Logger from '@websites/infrastructure/logging/logger';

// Disable body parser to handle file upload
export const config = {
    api: {
        bodyParser: false,
    },
};

interface ColumnInfo {
    columnName: string;
    type: string;
    taskName: string;
    description: string;
    dateFound: string | null;
    sampleValues: (string | number | null)[];
    hasData: boolean;
}

interface SheetPreview {
    sheetName: string;
    className: string;
    studentCount: number;
    columns: ColumnInfo[];
}

interface PreviewResponse {
    success: boolean;
    sheets?: SheetPreview[];
    totalColumns?: number;
    message?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<PreviewResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    let tempFilePath: string | undefined;

    try {
        // Parse the form data with formidable
        const form = formidable({
            maxFileSize: 10 * 1024 * 1024, // 10MB max
        });

        const [_fields, files] = await form.parse(req);
        
        const file = Array.isArray(files.file) ? files.file[0] : files.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        tempFilePath = file.filepath;

        Logger.info('Previewing Excel file', { 
            filename: file.originalFilename,
            size: file.size 
        });

        // Read Excel file
        const reader = new ExcelReader();
        await reader.readFromFile(tempFilePath);
        const sheetsData = await reader.readAllSummativeSheets();

        if (sheetsData.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid sheets found in Excel file'
            });
        }

        // Build preview data
        const sheets: SheetPreview[] = [];
        let totalColumns = 0;

        for (const sheetData of sheetsData) {
            const columns: ColumnInfo[] = [];

            Logger.info(`Processing sheet for preview`, { 
                sheetName: sheetData.sheetName, 
                totalColumnsInSheet: sheetData.columnDates.size 
            });

            // Iterate through ALL columns from columnDates (these are from the header row)
            for (const [columnName, dateValue] of Array.from(sheetData.columnDates.entries())) {
                // Skip standard columns (name fields)
                if (columnName === 'Vardas' || columnName === 'Pavardė' || columnName === 'ID') {
                    continue;
                }

                // Try dynamic detection first (handles EXT, ND, SD, LNT, etc.)
                const dynamicInfo = detectColumnType(columnName);
                
                // Fallback to static mapping for special columns
                const columnConfig = dynamicInfo?.mapping || SUMMATIVE_SHEET_COLUMNS[columnName];
                
                // Skip if neither dynamic nor static mapping found
                if (!columnConfig) {
                    Logger.warn(`Column not recognized (dynamic or static), skipping`, { 
                        columnName, 
                        sheetName: sheetData.sheetName 
                    });
                    continue;
                }

                // Get sample values from first 3 students
                const sampleValues = sheetData.students.slice(0, 3).map(row => {
                    const val = row[columnName];
                    if (val !== undefined && val !== null && val !== '') {
                        return val instanceof Date ? val.toISOString() : val;
                    }
                    return null;
                });

                // Check if column has any data across all students
                const hasData = sheetData.students.some(row => {
                    const val = row[columnName];
                    return val !== undefined && val !== null && val !== '';
                });

                columns.push({
                    columnName,
                    type: columnConfig.type,
                    taskName: columnConfig.task_name || columnName,
                    description: columnConfig.description || '',
                    dateFound: dateValue,
                    sampleValues,
                    hasData
                });

                totalColumns++;
                
                if (dynamicInfo) {
                    Logger.debug(`Dynamic column detected`, {
                        column: columnName,
                        baseType: dynamicInfo.baseType,
                        type: columnConfig.type
                    });
                }
            }

            // Sort columns by type and name
            columns.sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type.localeCompare(b.type);
                }
                return a.columnName.localeCompare(b.columnName);
            });

            sheets.push({
                sheetName: sheetData.sheetName,
                className: sheetData.className,
                studentCount: sheetData.students.length,
                columns
            });
        }

        Logger.info('Preview generated', {
            sheets: sheets.length,
            totalColumns
        });

        return res.status(200).json({
            success: true,
            sheets,
            totalColumns,
            message: `Found ${totalColumns} columns across ${sheets.length} sheets`
        });

    } catch (error) {
        Logger.error('Excel preview API error', { error });
        
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    } finally {
        // Clean up temp file
        if (tempFilePath) {
            try {
                await fs.unlink(tempFilePath);
            } catch (cleanupError) {
                Logger.warn('Failed to cleanup temp file', { error: cleanupError });
            }
        }
    }
}




