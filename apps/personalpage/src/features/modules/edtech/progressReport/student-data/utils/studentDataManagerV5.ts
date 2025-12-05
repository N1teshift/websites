/**
 * Student Data Manager (v5 format)
 * Orchestrates Excel processing with dynamic column detection
 * 
 * V5 Changes from V4:
 * - Uses DataProcessorV5 for dynamic column detection
 * - Passes columnContext from Excel (Row 21/22)
 * - Supports complex ND structure (NDX, NDX K, NDX T)
 * - Handles TVARK/TAIS tracking columns
 * - Schema version is 5.0
 */

import fs from 'fs/promises';
import path from 'path';
import { ExcelReader } from './excelReader';
import { DataProcessorV5 } from '../processors/dataProcessorV5';
import { STANDARD_COLUMNS } from '../config/columnMapping';
import { StudentData } from '@/features/modules/edtech/progressReport/types/ProgressReportTypes';
import Logger from '@websites/infrastructure/logging/logger';
import { resolveNameAlias } from '../config/nameAliases';
import { findBestNameMatch } from './fuzzyNameMatcher';

type StudentDataV5 = StudentData;

export class StudentDataManagerV5 {
    private dataDir: string;
    private processor: DataProcessorV5;
    
    constructor(dataDir: string = path.join(process.cwd(), 'src/features/modules/edtech/progressReport/student-data/data')) {
        this.dataDir = dataDir;
        this.processor = new DataProcessorV5();
    }
    
    /**
     * Load all student JSON files from data directory
     */
    async loadAllStudents(): Promise<Map<string, StudentDataV5>> {
        const students = new Map<string, StudentDataV5>();
        
        try {
            const files = await fs.readdir(this.dataDir);
            const jsonFiles = files.filter(f => f.endsWith('.json') && !f.startsWith('_'));
            
            Logger.info(`Loading ${jsonFiles.length} student files (v5)`);
            
            for (const file of jsonFiles) {
                try {
                    const filePath = path.join(this.dataDir, file);
                    const content = await fs.readFile(filePath, 'utf-8');
                    const student: StudentDataV5 = JSON.parse(content);
                    
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
     * Process Excel file with dynamic column detection and context support
     * @param excelPath Path to Excel file
     * @param selectedColumns Optional array of column names to process
     */
    async processExcelFile(excelPath: string, selectedColumns?: string[]): Promise<{
        studentsUpdated: number;
        assessmentsAdded: number;
        newStudents: number;
    }> {
        Logger.info('Starting Excel processing (v5 - dynamic columns)', { 
            excelPath,
            columnFilter: selectedColumns ? `${selectedColumns.length} selected` : 'all'
        });
        
        // Load existing students
        const students = await this.loadAllStudents();
        const studentsList = Array.from(students.values());
        
        // Read Excel data (now includes columnContext)
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
            Logger.info(`Processing sheet: ${sheet.sheetName} (v5)`, {
                rows: sheet.students.length,
                columns: sheet.columnDates.size,
                contexts: sheet.columnContext.size
            });
            
            // Process each student row
            for (const row of sheet.students) {
                const firstName = row[STANDARD_COLUMNS.FIRST_NAME] as string;
                const lastName = row[STANDARD_COLUMNS.LAST_NAME] as string;
                
                if (!firstName || !lastName) {
                    Logger.warn('Skipping row with missing name data');
                    continue;
                }
                
                // Find existing student with name alias resolution
                // Resolve name alias (handles shortened names like "Bonifacijus" -> "Bonifacijus Marijus")
                const resolved = resolveNameAlias(firstName, lastName, sheet.className);
                
                // Try exact match first
                let student = studentsList.find(s => 
                    s.first_name === resolved.firstName && s.last_name === resolved.lastName
                );
                
                if (student && (resolved.firstName !== firstName || resolved.lastName !== lastName)) {
                    Logger.info('✅ Resolved name alias', {
                        excelName: `${firstName} ${lastName}`,
                        fullName: `${resolved.firstName} ${resolved.lastName}`,
                        className: sheet.className
                    });
                }
                
                // If no exact match, try fuzzy matching (handles typos)
                if (!student) {
                    const fuzzyMatch = findBestNameMatch(studentsList, resolved.firstName, resolved.lastName, 0.9);
                    
                    if (fuzzyMatch.isFuzzyMatch && fuzzyMatch.match) {
                        Logger.warn('⚠️ Fuzzy name match detected (possible typo in Excel)', {
                            excelName: `${firstName} ${lastName}`,
                            matchedStudent: `${fuzzyMatch.match.first_name} ${fuzzyMatch.match.last_name}`,
                            similarityScore: fuzzyMatch.score.toFixed(2),
                            className: sheet.className,
                            suggestion: 'Please verify spelling in Excel file to avoid duplicates'
                        });
                        student = fuzzyMatch.match;
                    }
                }
                
                if (!student) {
                    Logger.info('Creating new student (v5)', { firstName, lastName, class: sheet.className });
                    student = this.createNewStudent(
                        resolved.firstName,  // Use resolved name for new students
                        resolved.lastName,
                        sheet.className,
                        `ST${String(nextStudentId).padStart(5, '0')}`
                    );
                    studentsList.push(student);
                    nextStudentId++;
                    newStudents++;
                }
                
                // Process assessments with V5 processor (includes columnContext)
                const result = this.processor.processStudentRow(
                    student, 
                    row, 
                    sheet.columnDates,
                    sheet.columnContext,  // NEW in V5!
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
        
        Logger.info('Excel processing complete (v5)', {
            studentsUpdated,
            assessmentsAdded,
            newStudents
        });
        
        return { studentsUpdated, assessmentsAdded, newStudents };
    }
    
    /**
     * Create a new student record (v5 format)
     */
    private createNewStudent(
        firstName: string,
        lastName: string,
        className: string,
        id: string
    ): StudentDataV5 {
        const academicYear = "2025-2026";
        const grade = 8;
        
        return {
            id,
            first_name: firstName,
            last_name: lastName,
            class_name: className,
            
            academic: {
                year: academicYear,
                grade: grade,
                class_id: className.toLowerCase().replace(/\s+/g, '-'),
                enrolled_date: null
            },
            
            profile: {
                learning_attributes: {
                    writing_quality: "developing",
                    notebook_organization: "developing",
                    reflective_practice: "developing",
                    math_communication: "developing",
                    seeks_tutoring: false
                },
                notes: {
                    date_of_birth: "",
                    language_profile: "",
                    strengths: [],
                    challenges: [],
                    interests: []
                }
            },
            
            assessments: [],
            
            curriculum_progress: {
                cambridge_objectives: {},
                material_completion: {}
            },
            
            engagement: {
                attendance_records: [],
                attendance_notes: [],
                consultations: [],
                social_hours: 0
            },
            
            cambridge_tests: []
        };
    }
    
    /**
     * Save all student data to individual JSON files
     */
    private async saveAllStudents(students: StudentDataV5[]): Promise<void> {
        Logger.info(`Saving ${students.length} student files (v5)`);
        
        for (const student of students) {
            const filename = `${student.first_name}_${student.last_name}.json`;
            const filePath = path.join(this.dataDir, filename);
            
            try {
                await fs.writeFile(filePath, JSON.stringify(student, null, 2), 'utf-8');
            } catch (error) {
                Logger.error(`Failed to save student file: ${filename}`, { error });
            }
        }
        
        Logger.info('All student files saved (v5)');
    }
    
    /**
     * Export all student data to a single JSON file (v5 format)
     */
    async exportToMasterFile(outputPath: string): Promise<number> {
        Logger.info('Exporting to master file (v5)', { outputPath });
        
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
                schema_version: "5.0",
                total_students: studentsList.length,
                export_version: "v5.0-dynamic-columns",
                teacher_type: "main",
                teacher_name: "Main Teacher (Math)",
                features: [
                    "Dynamic column detection",
                    "Complex ND structure (NDX, NDX K, NDX T)",
                    "TVARK/TAIS tracking",
                    "Context-aware assessments"
                ]
            },
            students: studentsList
        };
        
        await fs.writeFile(outputPath, JSON.stringify(masterData, null, 2), 'utf-8');
        
        Logger.info('Master file exported (v5)', {
            students: studentsList.length,
            path: outputPath
        });
        
        return studentsList.length;
    }
    
    /**
     * Get the next available student ID
     */
    private getNextStudentId(students: StudentDataV5[]): number {
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




