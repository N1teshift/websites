/**
 * Student Data Manager (v4 format)
 * Orchestrates Excel processing and student data updates
 * 
 * V4 Changes from V3:
 * - Uses DataProcessorV4 for v4-compatible assessments
 * - Schema version is 4.0
 * - Exports data with v4 metadata structure
 */

import fs from 'fs/promises';
import path from 'path';
import { ExcelReader } from './excelReader';
import { DataProcessorV4 } from '../processors/dataProcessorV4';
import { STANDARD_COLUMNS } from '../config/columnMapping';
import { StudentData } from '@/features/modules/edtech/progressReport/types/ProgressReportTypes';
import Logger from '@websites/infrastructure/logging/logger';

// Use StudentData from ProgressReportTypes (v4-compatible)
type StudentDataV4 = StudentData;

export class StudentDataManagerV4 {
    private dataDir: string;
    private processor: DataProcessorV4;
    
    constructor(dataDir: string = path.join(process.cwd(), 'src/features/modules/edtech/progressReport/student-data/data')) {
        this.dataDir = dataDir;
        this.processor = new DataProcessorV4();
    }
    
    /**
     * Load all student JSON files from data directory
     * V4: Accepts both v3 and v4 formats for compatibility during migration
     */
    async loadAllStudents(): Promise<Map<string, StudentDataV4>> {
        const students = new Map<string, StudentDataV4>();
        
        try {
            const files = await fs.readdir(this.dataDir);
            const jsonFiles = files.filter(f => f.endsWith('.json') && !f.startsWith('_'));
            
            Logger.info(`Loading ${jsonFiles.length} student files`);
            
            for (const file of jsonFiles) {
                try {
                    const filePath = path.join(this.dataDir, file);
                    const content = await fs.readFile(filePath, 'utf-8');
                    const student: StudentDataV4 = JSON.parse(content);
                    
                    const key = `${student.first_name}_${student.last_name}`;
                    students.set(key, student);
                } catch (error) {
                    Logger.error(`Failed to load student file: ${file}`, { error });
                }
            }
            
            Logger.info(`Successfully loaded ${students.size} students`);
            return students;
            
        } catch (error) {
            Logger.error('Failed to load student data', { error });
            throw error;
        }
    }
    
    /**
     * Process Excel file and update student data
     * @param excelPath Path to Excel file
     * @param selectedColumns Optional array of column names to process. If not provided, all columns are processed.
     */
    async processExcelFile(excelPath: string, selectedColumns?: string[]): Promise<{
        studentsUpdated: number;
        assessmentsAdded: number;
        newStudents: number;
    }> {
        Logger.info('Starting Excel processing (v4)', { 
            excelPath,
            columnFilter: selectedColumns ? `${selectedColumns.length} selected` : 'all'
        });
        
        // Load existing students
        const students = await this.loadAllStudents();
        const studentsList = Array.from(students.values());
        
        // Read Excel data
        const reader = new ExcelReader();
        await reader.readFromFile(excelPath);
        const excelData = await reader.readAllSummativeSheets();
        
        let studentsUpdated = 0;
        let assessmentsAdded = 0;
        let newStudents = 0;
        let nextStudentId = this.getNextStudentId(studentsList);
        
        // Convert selectedColumns to Set for faster lookup
        const selectedColumnsSet = selectedColumns ? new Set(selectedColumns) : null;
        
        // Process each sheet
        for (const sheet of excelData) {
            Logger.info(`Processing sheet: ${sheet.sheetName}`, {
                rows: sheet.students.length,
                columns: sheet.columnDates.size
            });
            
            // Process each student row
            for (const row of sheet.students) {
                const firstName = row[STANDARD_COLUMNS.FIRST_NAME] as string;
                const lastName = row[STANDARD_COLUMNS.LAST_NAME] as string;
                
                if (!firstName || !lastName) {
                    Logger.warn('Skipping row with missing name data');
                    continue;
                }
                
                // Find or create student (use className for alias resolution)
                let student = this.processor.findStudent(studentsList, firstName, lastName, sheet.className);
                
                if (!student) {
                    Logger.info('Creating new student (v4)', { firstName, lastName, class: sheet.className });
                    student = this.processor.createNewStudent(
                        firstName,
                        lastName,
                        sheet.className,
                        `ST${String(nextStudentId).padStart(5, '0')}`
                    );
                    studentsList.push(student);
                    nextStudentId++;
                    newStudents++;
                }
                
                // Process assessments with column filtering
                const result = this.processor.processStudentRow(
                    student, 
                    row, 
                    sheet.columnDates,
                    selectedColumnsSet
                );
                
                if (result.modified) {
                    studentsUpdated++;
                }
                
                assessmentsAdded += result.assessmentsAdded;
            }
        }
        
        // Save all modified students
        await this.saveAllStudents(studentsList);
        
        Logger.info('Excel processing complete (v4)', {
            studentsUpdated,
            assessmentsAdded,
            newStudents
        });
        
        return { studentsUpdated, assessmentsAdded, newStudents };
    }
    
    /**
     * Save all student data to individual JSON files
     */
    private async saveAllStudents(students: StudentDataV4[]): Promise<void> {
        Logger.info(`Saving ${students.length} student files`);
        
        for (const student of students) {
            const filename = `${student.first_name}_${student.last_name}.json`;
            const filePath = path.join(this.dataDir, filename);
            
            try {
                await fs.writeFile(filePath, JSON.stringify(student, null, 2), 'utf-8');
            } catch (error) {
                Logger.error(`Failed to save student file: ${filename}`, { error });
            }
        }
        
        Logger.info('All student files saved');
    }
    
    /**
     * Export all student data to a single JSON file (v4 format)
     */
    async exportToMasterFile(outputPath: string): Promise<number> {
        Logger.info('Exporting to master file (v4)', { outputPath });
        
        const students = await this.loadAllStudents();
        const studentsList = Array.from(students.values());
        
        // Sort by class name, then by last name
        studentsList.sort((a, b) => {
            if (a.class_name !== b.class_name) {
                return a.class_name.localeCompare(b.class_name);
            }
            return a.last_name.localeCompare(b.last_name);
        });
        
        const masterData = {
            metadata: {
                exported_at: new Date().toISOString(),
                schema_version: "4.0",
                total_students: studentsList.length,
                export_version: "v4.0",
                teacher_type: "main",
                teacher_name: "Main Teacher (Math)"
            },
            students: studentsList
        };
        
        await fs.writeFile(outputPath, JSON.stringify(masterData, null, 2), 'utf-8');
        
        Logger.info('Master file exported (v4)', {
            students: studentsList.length,
            path: outputPath
        });
        
        return studentsList.length;
    }
    
    /**
     * Get the next available student ID
     */
    private getNextStudentId(students: StudentDataV4[]): number {
        let maxId = 0;
        
        for (const student of students) {
            if (student.id && student.id.startsWith('ST')) {
                const idNum = parseInt(student.id.substring(2));
                if (!isNaN(idNum) && idNum > maxId) {
                    maxId = idNum;
                }
            }
        }
        
        return maxId + 1;
    }
}




