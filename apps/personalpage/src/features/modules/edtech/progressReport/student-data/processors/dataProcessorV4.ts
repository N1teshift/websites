/**
 * Data processor for student assessments (v4 format)
 * Handles adding new assessments with duplicate detection
 * 
 * V4 Changes from V3:
 * - Renamed 'summative_details' to 'evaluation_details'
 * - Renamed assessment type 'participation' to 'board_solving'
 * - SD columns are now type 'test' instead of 'summative'
 * - Added assessment_id and assessment_title fields
 * - Updated academic year to 2025-2026
 * - Set enrolled_date to null for new students
 */

import { ExcelRowData } from '../types/StudentDataTypes';
import { SUMMATIVE_SHEET_COLUMNS, STANDARD_COLUMNS } from '../config/columnMapping';
import { resolveNameAlias } from '../config/nameAliases';
import { StudentData, Assessment, AssessmentType } from '@/features/modules/edtech/progressReport/types/ProgressReportTypes';
import Logger from '@websites/infrastructure/logging/logger';
import { findBestNameMatch } from '../utils/fuzzyNameMatcher';

// V4 uses ProgressReportTypes which are already v4-compatible
type StudentDataV4 = StudentData;
type AssessmentV4 = Assessment;
type AssessmentTypeV4 = AssessmentType;
type LearningLevel = "needs_support" | "developing" | "proficient" | "advanced";

export class DataProcessorV4 {
    private currentDate: string;
    
    constructor() {
        this.currentDate = new Date().toISOString().split('T')[0];
    }
    
    /**
     * Process a student row from Excel and update student data
     * Returns true if student data was modified
     * @param selectedColumns Optional set of column names to process. If not provided, all columns are processed.
     */
    processStudentRow(
        studentData: StudentDataV4,
        row: ExcelRowData,
        columnDates: Map<string, string>,
        selectedColumns?: Set<string> | null
    ): { modified: boolean; assessmentsAdded: number } {
        let modified = false;
        let assessmentsAdded = 0;
        
        // First pass: collect comments
        const commentsMap = new Map<string, string>();
        
        for (const [columnName, value] of Object.entries(row)) {
            // Skip if column not selected
            if (selectedColumns && !selectedColumns.has(columnName)) {
                continue;
            }
            
            const mapping = SUMMATIVE_SHEET_COLUMNS[columnName];
            
            if (mapping && mapping.type === 'comment' && value) {
                const parentColumn = mapping.parent_column;
                if (parentColumn) {
                    commentsMap.set(parentColumn, String(value));
                }
            }
        }
        
        // Second pass: process assessments and collect SD sub-scores
        const sdScores = new Map<string, { P?: number; MYP?: number; C?: number; date: string }>();
        
        for (const [columnName, value] of Object.entries(row)) {
            // Skip standard columns
            if (columnName === STANDARD_COLUMNS.FIRST_NAME ||
                columnName === STANDARD_COLUMNS.LAST_NAME ||
                columnName === STANDARD_COLUMNS.ID) {
                continue;
            }
            
            // Skip if column not selected
            if (selectedColumns && !selectedColumns.has(columnName)) {
                continue;
            }
            
            const mapping = SUMMATIVE_SHEET_COLUMNS[columnName];
            if (!mapping) continue;
            
            // Skip comment columns (already processed)
            if (mapping.type === 'comment') continue;
            
            // Handle social hours
            if (mapping.type === 'social_hours') {
                if (value !== null && value !== undefined && value !== '') {
                    if (!studentData.engagement) {
                        studentData.engagement = { social_hours: 0 };
                    }
                    studentData.engagement.social_hours = Number(value) || 0;
                    modified = true;
                }
                continue;
            }
            
            // Handle SD test assessments (collect sub-scores) - V4: Changed to 'test' type
            if (mapping.type === 'summative' && mapping.summative_subtype) {
                const result = this.processTestSubScore(
                    columnName,
                    value,
                    mapping.summative_subtype,
                    columnDates,
                    sdScores
                );
                if (result) {
                    modified = true;
                }
                continue;
            }
            
            // Handle regular assessments
            if (value !== null && value !== undefined && value !== '' && value !== 'n') {
                const assessmentDate = columnDates.get(columnName) || this.currentDate;
                const comment = commentsMap.get(columnName) || '';
                
                // V4: Convert 'participation' to 'board_solving'
                let assessmentType = mapping.type as AssessmentTypeV4;
                if ((assessmentType as string) === 'participation') {
                    assessmentType = 'board_solving';
                }
                
                const assessment: AssessmentV4 = {
                    date: assessmentDate,
                    column: columnName,
                    type: assessmentType,
                    task_name: mapping.task_name || columnName,
                    score: String(value),
                    comment: comment,
                    added: this.currentDate,
                    assessment_id: this.generateAssessmentId(columnName, assessmentType),
                    assessment_title: this.generateAssessmentTitle(columnName, mapping.task_name)
                };
                
                const added = this.addAssessment(studentData, assessment);
                if (added) {
                    assessmentsAdded++;
                    modified = true;
                }
            }
        }
        
        // Third pass: create combined SD test assessments (V4: type 'test')
        if (sdScores.size > 0) {
            Logger.info('Creating SD test assessments', { 
                student: `${studentData.first_name} ${studentData.last_name}`,
                sdScoresCount: sdScores.size,
                sdBases: Array.from(sdScores.keys())
            });
        }
        
        for (const [sdBase, scores] of Array.from(sdScores.entries())) {
            const assessment = this.createTestAssessment(sdBase, scores);
            if (assessment) {
                Logger.info('Created assessment, attempting to add', {
                    student: `${studentData.first_name} ${studentData.last_name}`,
                    column: assessment.column,
                    date: assessment.date,
                    scores: { P: scores.P, MYP: scores.MYP, C: scores.C }
                });
                const added = this.addAssessment(studentData, assessment);
                if (added) {
                    assessmentsAdded++;
                    modified = true;
                    Logger.info('✅ Successfully ADDED SD assessment', {
                        student: `${studentData.first_name} ${studentData.last_name}`,
                        column: assessment.column
                    });
                } else {
                    Logger.warn('⚠️ SD assessment was NOT added (updated existing)', {
                        student: `${studentData.first_name} ${studentData.last_name}`,
                        column: assessment.column,
                        date: assessment.date
                    });
                }
            } else {
                Logger.warn('Failed to create assessment (no scores)', {
                    student: `${studentData.first_name} ${studentData.last_name}`,
                    sdBase
                });
            }
        }
        
        return { modified, assessmentsAdded };
    }
    
    /**
     * Process SD sub-scores (P, MYP, C) - V4: For 'test' type
     */
    private processTestSubScore(
        columnName: string,
        value: string | number | Date | null | undefined,
        subtype: 'percentage' | 'myp' | 'cambridge',
        columnDates: Map<string, string>,
        sdScores: Map<string, { P?: number; MYP?: number; C?: number; date: string }>
    ): boolean {
        if (value === null || value === undefined || value === '' || value === 'n' || value instanceof Date) {
            return false;
        }
        
        // Extract SD base (SD1, SD2, SD3)
        const sdBase = columnName.split(' ')[0]; // "SD1 P" -> "SD1"
        
        if (!sdScores.has(sdBase)) {
            sdScores.set(sdBase, {
                date: columnDates.get(columnName) || this.currentDate
            });
        }
        
        const scores = sdScores.get(sdBase)!;
        const numValue = Number(value);
        
        if (isNaN(numValue)) {
            Logger.warn('Invalid numeric value for SD score', { columnName, value });
            return false;
        }
        
        switch (subtype) {
            case 'percentage':
                scores.P = numValue;
                break;
            case 'myp':
                scores.MYP = numValue;
                break;
            case 'cambridge':
                scores.C = numValue;
                break;
        }
        
        return true;
    }
    
    /**
     * Create a combined test assessment from SD sub-scores
     * V4: Changed to 'test' type and 'evaluation_details'
     */
    private createTestAssessment(
        sdBase: string,
        scores: { P?: number; MYP?: number; C?: number; date: string }
    ): AssessmentV4 | null {
        // Only create assessment if at least one score is present
        if (scores.P === undefined && scores.MYP === undefined && scores.C === undefined) {
            return null;
        }
        
        // Use the first non-undefined score as the main score for display
        const mainScore = scores.P ?? scores.MYP ?? scores.C ?? 0;
        
        const assessment: AssessmentV4 = {
            date: scores.date,
            column: sdBase, // Use "SD1", "SD2", etc. as column name
            type: 'test', // V4: Changed from 'summative' to 'test'
            task_name: `Test ${sdBase.replace('SD', '')}`,
            score: String(mainScore),
            comment: '',
            added: this.currentDate,
            evaluation_details: { // V4: Renamed from summative_details
                percentage_score: scores.P ?? null,
                myp_score: scores.MYP ?? null,
                cambridge_score: scores.C ?? null
            },
            assessment_id: `test-${sdBase.toLowerCase()}`,
            assessment_title: `Test ${sdBase.replace('SD', '')}`
        };
        
        return assessment;
    }
    
    /**
     * Generate assessment_id based on column and type
     */
    private generateAssessmentId(column: string, type: AssessmentTypeV4): string | null {
        // Generate consistent IDs for common assessment types
        const col = column.toLowerCase();
        
        if (type === 'homework' || type === 'homework_graded' || type === 'homework_reflection') {
            return `homework-${col}`;
        } else if (type === 'classwork') {
            return `classwork-${col}`;
        } else if (type === 'diagnostic') {
            return `diagnostic-${col.replace('diag', '')}`;
        } else if (type === 'board_solving') {
            return `board-solving-${col}`;
        } else if (type === 'summative') {
            return `summative-${col}`;
        } else if (type === 'test') {
            return `test-${col}`;
        } else if (type === 'sav_darb') {
            return `sav-darb-${col}`;
        }
        
        return null;
    }
    
    /**
     * Generate assessment_title based on column and task name
     */
    private generateAssessmentTitle(column: string, taskName?: string): string | null {
        if (taskName) {
            return taskName;
        }
        
        // Generate title from column name
        const col = column.toUpperCase();
        
        if (col.startsWith('ND')) {
            return `Homework ${col}`;
        } else if (col.startsWith('EXT')) {
            return `Classwork ${col}`;
        } else if (col.startsWith('DIAG')) {
            return `Diagnostic Assessment ${col.replace('DIAG', '')}`;
        } else if (col.startsWith('LNT')) {
            return `Board Solving ${col}`;
        } else if (col.startsWith('KD')) {
            return `Summative ${col}`;
        } else if (col.startsWith('SD')) {
            return `Test ${col}`;
        } else if (col.startsWith('P1')) {
            return `SAV Darb ${col}`;
        }
        
        return column;
    }
    
    /**
     * Add assessment to student record with duplicate detection
     * Returns true if added, false if duplicate found
     */
    private addAssessment(studentData: StudentDataV4, assessment: AssessmentV4): boolean {
        // Initialize assessments array if undefined
        if (!studentData.assessments) {
            studentData.assessments = [];
        }
        
        // Check for duplicate (same date + column)
        const existingIndex = studentData.assessments.findIndex(
            existing => existing.date === assessment.date && existing.column === assessment.column
        );
        
        if (existingIndex !== -1) {
            // Update existing assessment
            const existing = studentData.assessments[existingIndex];
            studentData.assessments[existingIndex] = {
                ...existing,
                ...assessment,
                updated: this.currentDate
            };
            Logger.debug('Updated existing assessment', {
                student: `${studentData.first_name} ${studentData.last_name}`,
                column: assessment.column,
                date: assessment.date
            });
            return false; // Not added, just updated
        }
        
        // Add new assessment
        studentData.assessments.push(assessment);
        Logger.debug('Added new assessment', {
            student: `${studentData.first_name} ${studentData.last_name}`,
            column: assessment.column,
            date: assessment.date
        });
        return true;
    }
    
    /**
     * Find student in data collection by first and last name
     * Resolves name aliases before searching
     */
    findStudent(students: StudentDataV4[], firstName: string, lastName: string, className: string): StudentDataV4 | null {
        // Resolve name alias
        const resolved = resolveNameAlias(firstName, lastName, className);
        
        // Try exact match first
        const exactMatch = students.find(
            s => s.first_name === resolved.firstName && s.last_name === resolved.lastName
        );
        
        if (exactMatch) {
            if (resolved.firstName !== firstName || resolved.lastName !== lastName) {
                Logger.info('Resolved name alias', {
                    excelName: `${firstName} ${lastName}`,
                    fullName: `${resolved.firstName} ${resolved.lastName}`,
                    className
                });
            }
            return exactMatch;
        }
        
        // If no exact match, try fuzzy matching (handles typos like "Krunglevičiūtė" vs "Krungelevičiūtė")
        const fuzzyMatch = findBestNameMatch(students, resolved.firstName, resolved.lastName, 0.9);
        
        if (fuzzyMatch.isFuzzyMatch && fuzzyMatch.match) {
            Logger.warn('⚠️ Fuzzy name match detected (possible typo in Excel)', {
                excelName: `${firstName} ${lastName}`,
                matchedStudent: `${fuzzyMatch.match.first_name} ${fuzzyMatch.match.last_name}`,
                similarityScore: fuzzyMatch.score.toFixed(2),
                className,
                suggestion: 'Please verify spelling in Excel file to avoid duplicates'
            });
            return fuzzyMatch.match;
        }
        
        return null;
    }
    
    /**
     * Create a new student record with minimal data (v4 format)
     * V4: Academic year is 2025-2026, enrolled_date is null
     */
    createNewStudent(firstName: string, lastName: string, className: string, id: string): StudentDataV4 {
        const academicYear = "2025-2026"; // V4: Updated academic year
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
                enrolled_date: null // V4: Set to null
            },
            
            profile: {
                learning_attributes: {
                    writing_quality: "developing" as LearningLevel,
                    notebook_organization: "developing" as LearningLevel,
                    reflective_practice: "developing" as LearningLevel,
                    math_communication: "developing" as LearningLevel,
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
}




