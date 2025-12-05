/**
 * Data processor for student assessments (v5 format)
 * 
 * V5 Changes from V4:
 * - Dynamic column detection using pattern matching
 * - Complex ND structure: NDX (on_time), NDX K (comment), NDX T (score)
 * - TVARK/TAIS tracking columns that update profile
 * - Context from Excel row added to assessments
 */

import { ExcelRowData } from '../types/StudentDataTypes';
import { STANDARD_COLUMNS } from '../config/columnMapping';
import { StudentData, Assessment, AssessmentType } from '@/features/modules/edtech/progressReport/types/ProgressReportTypes';
import { detectColumnType, DynamicColumnInfo } from '../utils/dynamicColumnMapper';
import { processPDAssessment, updateCambridgeObjective, updateStudentMissionsWithAssessment } from '../utils/cambridgeMissionUpdater';
import { getObjectivesForKD } from '../config/pdKdMappings';

type LearningLevel = "needs_support" | "developing" | "proficient" | "advanced";

interface NDScoreData {
    onTime?: number;
    score?: number;
    comment?: string;
    date: string;
}

interface SDScoreData {
    P?: number;
    MYP?: number;
    C?: number;
    C1?: number;
    C2?: number;
    date: string;
}

interface PDScoreData {
    P?: number;
    MYP?: number;
    C?: number;
    date: string;
    pdNumber: string;
}

interface KDScoreData {
    P?: number;
    MYP?: number;
    C?: { [index: number]: number }; // Dynamic C columns: { 1: score1, 2: score2, etc. }
    date: string;
}

export class DataProcessorV5 {
    private currentDate: string;
    
    constructor() {
        this.currentDate = new Date().toISOString().split('T')[0];
    }
    
    /**
     * Process a student row with dynamic column detection
     */
    processStudentRow(
        studentData: StudentData,
        row: ExcelRowData,
        columnDates: Map<string, string>,
        columnContext: Map<string, string>,
        selectedColumns?: Set<string> | null
    ): { modified: boolean; assessmentsAdded: number } {
        let modified = false;
        let assessmentsAdded = 0;
        
        // Detect all column types dynamically
        const columnInfoMap = new Map<string, DynamicColumnInfo>();
        for (const columnName of Object.keys(row)) {
            const info = detectColumnType(columnName);
            if (info) {
                columnInfoMap.set(columnName, info);
            }
        }
        
        // First pass: collect ND, SD, PD, and KD sub-scores/components
        const ndScores = new Map<string, NDScoreData>();
        const sdScores = new Map<string, SDScoreData>();
        const pdScores = new Map<string, PDScoreData>();
        const kdScores = new Map<string, KDScoreData>();
        
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
            
            const info = columnInfoMap.get(columnName);
            if (!info) continue;
            
            // Collect ND components (NDX, NDX K, NDX T)
            if (info.baseType === 'ND') {
                const ndBase = `ND${info.number}`;
                
                if (!ndScores.has(ndBase)) {
                    ndScores.set(ndBase, {
                        date: columnDates.get(columnName) || this.currentDate
                    });
                }
                
                const ndData = ndScores.get(ndBase)!;
                
                if (info.subtype === 'K') {
                    // Comment column
                    ndData.comment = value ? String(value) : '';
                } else if (info.subtype === 'T') {
                    // Score column
                    if (value !== null && value !== undefined && value !== '' && value !== 'n' && value !== '?') {
                        ndData.score = Number(value);
                    }
                } else {
                    // Main ND column (on_time)
                    if (value !== null && value !== undefined && value !== '' && value !== 'n' && value !== '?') {
                        const numValue = Number(value);
                        ndData.onTime = numValue === 1 ? 1 : 0;
                    }
                }
            }
            
            // Collect SD sub-scores (SDX P, SDX MYP, SDX C, SDX C1, SDX C2)
            if (info.baseType === 'SD' && info.subtype) {
                const sdBase = `SD${info.number}`;
                
                if (!sdScores.has(sdBase)) {
                    sdScores.set(sdBase, {
                        date: columnDates.get(columnName) || this.currentDate
                    });
                }
                
                const sdData = sdScores.get(sdBase)!;
                
                if (value !== null && value !== undefined && value !== '' && value !== 'n' && value !== '?') {
                    const numValue = Number(value);
                    if (!isNaN(numValue)) {
                        if (info.subtype === 'P') sdData.P = numValue;
                        else if (info.subtype === 'MYP') sdData.MYP = numValue;
                        else if (info.subtype === 'C') sdData.C = numValue;
                        else if (info.subtype === 'C1') sdData.C1 = numValue;
                        else if (info.subtype === 'C2') sdData.C2 = numValue;
                    }
                }
            }
            
            // Collect PD sub-scores (PDX P, PDX MYP, PDX C)
            if (info.baseType === 'PD') {
                const pdBase = `PD${info.number}_${info.date}`;
                
                if (!pdScores.has(pdBase)) {
                    pdScores.set(pdBase, {
                        date: info.date || columnDates.get(columnName) || this.currentDate,
                        pdNumber: `PD${info.number}`
                    });
                }
                
                const pdData = pdScores.get(pdBase)!;
                
                if (value !== null && value !== undefined && value !== '' && value !== 'n' && value !== '?') {
                    const numValue = Number(value);
                    if (!isNaN(numValue)) {
                        if (info.subtype === 'P') pdData.P = numValue;
                        else if (info.subtype === 'MYP') pdData.MYP = numValue;
                        else if (info.subtype === 'C') pdData.C = numValue;
                        else if (!info.subtype) pdData.C = numValue; // Default to C if no subtype
                    }
                }
            }
            
            // Collect KD sub-scores (KDX P, KDX MYP, KDX C, KDX C1, KDX C2, KDX C3, etc.)
            if (info.baseType === 'KD' && info.subtype) {
                const kdBase = `KD${info.number}`;
                
                if (!kdScores.has(kdBase)) {
                    kdScores.set(kdBase, {
                        date: columnDates.get(columnName) || this.currentDate,
                        C: {}
                    });
                }
                
                const kdData = kdScores.get(kdBase)!;
                
                if (value !== null && value !== undefined && value !== '' && value !== 'n' && value !== '?') {
                    const numValue = Number(value);
                    if (!isNaN(numValue)) {
                        if (info.subtype === 'P') kdData.P = numValue;
                        else if (info.subtype === 'MYP') kdData.MYP = numValue;
                        else if (info.subtype === 'C') {
                            if (!kdData.C) kdData.C = {};
                            kdData.C[0] = numValue; // C without number is index 0
                        } else if (info.subtype === 'C1') {
                            if (!kdData.C) kdData.C = {};
                            kdData.C[1] = numValue;
                        } else if (info.subtype === 'C2') {
                            if (!kdData.C) kdData.C = {};
                            kdData.C[2] = numValue;
                        }
                        // Can extend for C3, C4, etc. as needed
                    }
                }
            }
        }
        
        // Second pass: create assessments from collected data
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
            
            const info = columnInfoMap.get(columnName);
            if (!info) continue;
            
            // Skip comment and score sub-columns (already collected)
            if (info.baseType === 'ND' && (info.subtype === 'K' || info.subtype === 'T')) {
                continue;
            }
            
            // Skip SD sub-columns (already collected)
            if (info.baseType === 'SD' && info.subtype) {
                continue;
            }
            
            // Skip PD sub-columns (already collected)
            if (info.baseType === 'PD' && info.subtype) {
                continue;
            }
            
            // Skip KD sub-columns (already collected)
            if (info.baseType === 'KD' && info.subtype) {
                continue;
            }
            
            // Handle TVARK tracking
            if (info.baseType === 'TVARK') {
                if (value !== null && value !== undefined && value !== '') {
                    const numValue = Number(value);
                    const level: LearningLevel = numValue === 1 ? 'proficient' : 'needs_support';
                    
                    // Update profile
                    if (!studentData.profile) studentData.profile = {};
                    if (!studentData.profile.learning_attributes) studentData.profile.learning_attributes = {};
                    studentData.profile.learning_attributes.notebook_organization = level;
                    
                    // Create tracking assessment
                    const assessment: Assessment = {
                        date: columnDates.get(columnName) || this.currentDate,
                        column: columnName,
                        type: 'tracking',
                        task_name: 'Notebook Organization',
                        score: String(numValue),
                        comment: numValue === 1 ? 'Notebook organized' : 'Notebook needs organization',
                        added: this.currentDate,
                        assessment_id: `tracking-tvark-${columnDates.get(columnName) || this.currentDate}`,
                        assessment_title: 'Notebook Organization Check',
                        context: columnContext.get(columnName) || ''
                    };
                    
                    const added = this.addAssessment(studentData, assessment);
                    if (added) {
                        assessmentsAdded++;
                        modified = true;
                    }
                }
                continue;
            }
            
            // Handle TAIS tracking
            if (info.baseType === 'TAIS') {
                if (value !== null && value !== undefined && value !== '') {
                    const numValue = Number(value);
                    const level: LearningLevel = numValue === 1 ? 'proficient' : 'needs_support';
                    
                    // Update profile
                    if (!studentData.profile) studentData.profile = {};
                    if (!studentData.profile.learning_attributes) studentData.profile.learning_attributes = {};
                    studentData.profile.learning_attributes.reflective_practice = level;
                    
                    // Create tracking assessment
                    const assessment: Assessment = {
                        date: columnDates.get(columnName) || this.currentDate,
                        column: columnName,
                        type: 'tracking',
                        task_name: 'Corrections Practice',
                        score: String(numValue),
                        comment: numValue === 1 ? 'Makes corrections' : 'Does not make corrections',
                        added: this.currentDate,
                        assessment_id: `tracking-tais-${columnDates.get(columnName) || this.currentDate}`,
                        assessment_title: 'Corrections Practice Check',
                        context: columnContext.get(columnName) || ''
                    };
                    
                    const added = this.addAssessment(studentData, assessment);
                    if (added) {
                        assessmentsAdded++;
                        modified = true;
                    }
                }
                continue;
            }
            
            // Handle regular assessments (EXT, LNT, KD, D, etc.)
            if (info.baseType !== 'ND' && info.baseType !== 'SD') {
                
                if (value !== null && value !== undefined && value !== '' && value !== 'n') {
                    const assessment: Assessment = {
                        date: columnDates.get(columnName) || this.currentDate,
                        column: columnName,
                        type: info.mapping.type as AssessmentType,
                        task_name: info.mapping.task_name || columnName,
                        score: String(value),
                        comment: '',
                        added: this.currentDate,
                        assessment_id: this.generateAssessmentId(columnName, info.baseType, info.number),
                        assessment_title: this.generateAssessmentTitle(columnName, info.baseType, info.number),
                        context: columnContext.get(columnName) || ''
                    };
                    
                    const added = this.addAssessment(studentData, assessment);
                    if (added) {
                        assessmentsAdded++;
                        modified = true;
                    }
                }
            }
        }
        
        // Third pass: create combined ND assessments
        for (const [ndBase, data] of Array.from(ndScores.entries())) {
            const assessment = this.createNDAssessment(ndBase, data, columnContext.get(ndBase));
            if (assessment) {
                const added = this.addAssessment(studentData, assessment);
                if (added) {
                    assessmentsAdded++;
                    modified = true;
                }
            }
        }
        
        // Fourth pass: create combined SD assessments
        for (const [sdBase, data] of Array.from(sdScores.entries())) {
            const assessment = this.createSDAssessment(sdBase, data, columnContext.get(sdBase));
            if (assessment) {
                const added = this.addAssessment(studentData, assessment);
                if (added) {
                    assessmentsAdded++;
                    modified = true;
                }
            }
        }
        
        // Fifth pass: create combined PD assessments and update Cambridge objectives/missions
        for (const [pdBase, data] of Array.from(pdScores.entries())) {
            const assessment = this.createPDAssessment(pdBase, data, columnContext.get(pdBase));
            if (assessment) {
                const added = this.addAssessment(studentData, assessment);
                if (added) {
                    assessmentsAdded++;
                    modified = true;
                }
                
                // Update Cambridge objectives and missions with this PD assessment
                if (data.C !== undefined) {
                    studentData = this.processPDCambridgeUpdate(
                        studentData,
                        data.pdNumber,
                        data.C,
                        data.date,
                        pdBase,
                        data.P,
                        data.MYP
                    );
                }
            }
        }
        
        // Sixth pass: create combined KD assessments and update Cambridge objectives/missions
        for (const [kdBase, data] of Array.from(kdScores.entries())) {
            const assessment = this.createKDAssessment(kdBase, data, columnContext.get(kdBase));
            if (assessment) {
                const added = this.addAssessment(studentData, assessment);
                if (added) {
                    assessmentsAdded++;
                    modified = true;
                }
                
                // Update Cambridge objectives with KD C scores
                if (data.C && Object.keys(data.C).length > 0) {
                    studentData = this.processKDCambridgeUpdate(
                        studentData,
                        kdBase,
                        data.C,
                        data.date,
                        data.P,
                        data.MYP
                    );
                }
            }
        }
        
        return { modified, assessmentsAdded };
    }
    
    /**
     * Create combined ND assessment with on_time, score, and comment
     */
    private createNDAssessment(
        ndBase: string,
        data: NDScoreData,
        context?: string
    ): Assessment | null {
        // Need at least on_time or score
        if (data.onTime === undefined && data.score === undefined) {
            return null;
        }
        
        const num = parseInt(ndBase.replace('ND', ''));
        
        // Determine homework type
        let type: AssessmentType = 'homework';
        if (num === 3) {
            type = 'homework_graded';
        } else if (num === 4 || num === 5) {
            type = 'homework_reflection';
        }
        
        return {
            date: data.date,
            column: ndBase,
            type,
            task_name: `${ndBase}: Homework`,
            score: data.score !== undefined ? String(data.score) : '',
            comment: data.comment || '',
            added: this.currentDate,
            assessment_id: `nd${num}`,
            assessment_title: ndBase,
            on_time: data.onTime,
            completed_on_time: data.onTime,
            context: context || ''
        };
    }
    
    /**
     * Create combined SD assessment with P/MYP/C scores
     */
    private createSDAssessment(
        sdBase: string,
        data: SDScoreData,
        context?: string
    ): Assessment | null {
        // Need at least one score
        if (data.P === undefined && data.MYP === undefined && data.C === undefined && 
            data.C1 === undefined && data.C2 === undefined) {
            return null;
        }
        
        const num = parseInt(sdBase.replace('SD', ''));
        const mainScore = data.P ?? data.MYP ?? data.C ?? data.C1 ?? 0;
        
        return {
            date: data.date,
            column: sdBase,
            type: 'test',
            task_name: `Test ${num}`,
            score: String(mainScore),
            comment: '',
            added: this.currentDate,
            evaluation_details: {
                percentage_score: data.P ?? null,
                myp_score: data.MYP ?? null,
                cambridge_score: data.C ?? null,
                cambridge_score_1: data.C1 ?? null,
                cambridge_score_2: data.C2 ?? null
            },
            assessment_id: `sd${num}`,
            assessment_title: `SD${num}`,
            context: context || ''
        };
    }
    
    /**
     * Create combined PD assessment with P/MYP/C scores
     */
    private createPDAssessment(
        pdBase: string,
        data: PDScoreData,
        context?: string
    ): Assessment | null {
        // Need at least one score
        if (data.P === undefined && data.MYP === undefined && data.C === undefined) {
            return null;
        }
        
        const num = parseInt(data.pdNumber.replace('PD', ''));
        const mainScore = data.C ?? data.P ?? data.MYP ?? 0;
        
        return {
            date: data.date,
            column: pdBase,
            type: 'test', // PD assessments are tests
            task_name: `${data.pdNumber}: Cambridge Practice`,
            score: String(mainScore),
            comment: '',
            added: this.currentDate,
            evaluation_details: {
                percentage_score: data.P ?? null,
                myp_score: data.MYP ?? null,
                cambridge_score: data.C ?? null
            },
            assessment_id: `pd${num}`,
            assessment_title: data.pdNumber,
            context: context || ''
        };
    }
    
    /**
     * Process PD assessment and update Cambridge objectives/missions
     */
    private processPDCambridgeUpdate(
        student: StudentData,
        pdNumber: string,
        cambridgeScore: number,
        date: string,
        assessmentColumn: string,
        points?: number,
        mypLevel?: number
    ): StudentData {
        return processPDAssessment(
            student,
            pdNumber,
            cambridgeScore,
            date,
            assessmentColumn,
            points,
            mypLevel
        );
    }
    
    /**
     * Create combined KD assessment with P/MYP/multiple C scores
     */
    private createKDAssessment(
        kdBase: string,
        data: KDScoreData,
        context?: string
    ): Assessment | null {
        // Need at least one score
        const hasC = data.C && Object.keys(data.C).length > 0;
        if (data.P === undefined && data.MYP === undefined && !hasC) {
            return null;
        }
        
        const num = parseInt(kdBase.replace('KD', ''));
        const mainScore = data.P ?? data.MYP ?? (hasC && data.C ? Object.values(data.C)[0] : 0);
        
        // Build evaluation details with dynamic C scores
        const evalDetails: {
            percentage_score: number | null;
            myp_score: number | null;
            cambridge_score?: number | null;
            [key: string]: number | null | undefined;
        } = {
            percentage_score: data.P ?? null,
            myp_score: data.MYP ?? null,
            cambridge_score: null
        };
        
        // Add C scores dynamically
        if (hasC && data.C) {
            const cKeys = Object.keys(data.C).map(k => parseInt(k)).sort();
            cKeys.forEach((key) => {
                if (key === 0) {
                    evalDetails.cambridge_score = data.C![key];
                } else {
                    evalDetails[`cambridge_score_${key}`] = data.C![key];
                }
            });
        }
        
        return {
            date: data.date,
            column: kdBase,
            type: 'summative',
            task_name: `KD${num}: Cambridge Unit ${num}`,
            score: String(mainScore),
            comment: '',
            added: this.currentDate,
            evaluation_details: evalDetails as import('@/features/modules/edtech/progressReport/types/ProgressReportTypes').Assessment['evaluation_details'],
            assessment_id: `kd${num}`,
            assessment_title: `KD${num}`,
            context: context || ''
        };
    }
    
    /**
     * Process KD assessment and update Cambridge objectives/missions
     */
    private processKDCambridgeUpdate(
        student: StudentData,
        kdBase: string,
        cScores: { [index: number]: number },
        date: string,
        points?: number,
        mypLevel?: number
    ): StudentData {
        const kdNumber = kdBase;
        const objectives = getObjectivesForKD(kdNumber);
        
        if (objectives.length === 0) {
            return student;
        }
        
        let updatedStudent = { ...student };
        
        // Map C scores to objectives by index
        const cKeys = Object.keys(cScores).map(k => parseInt(k)).sort();
        cKeys.forEach((cIndex, _arrayIndex) => {
            const score = cScores[cIndex];
            
            // Map this C score to the corresponding objective
            // C1 (cIndex=1) → objectives[0], C2 (cIndex=2) → objectives[1], etc.
            let objectiveIndex = cIndex === 0 ? 0 : cIndex - 1;
            
            // For plain C (cIndex=0), if there are multiple objectives, use first
            if (cIndex === 0 && objectives.length > 1) {
                objectiveIndex = 0;
            }
            
            if (objectiveIndex < objectives.length) {
                const objectiveCode = objectives[objectiveIndex];
                const columnName = cIndex === 0 ? `${kdBase} C` : `${kdBase} C${cIndex}`;
                
                // Update Cambridge objective
                updatedStudent = updateCambridgeObjective(
                    updatedStudent,
                    objectiveCode,
                    score,
                    date,
                    columnName
                );
                
                // Update missions
                updatedStudent = updateStudentMissionsWithAssessment(
                    updatedStudent,
                    objectiveCode,
                    score,
                    date,
                    columnName,
                    points,
                    mypLevel
                );
            }
        });
        
        return updatedStudent;
    }
    
    /**
     * Generate assessment ID
     */
    private generateAssessmentId(
        columnName: string,
        baseType: string,
        number?: number
    ): string {
        if (baseType === 'EXT' && number) return `ext${number}`;
        if (baseType === 'LNT' && number) return `lnt${number}`;
        if (baseType === 'ND' && number) return `nd${number}`;
        if (baseType === 'SD' && number) return `sd${number}`;
        if (baseType === 'KD' && number) return `kd${number}`;
        if (baseType === 'D' && number) return `d${number}`;
        
        return columnName.toLowerCase().replace(/\s+/g, '-');
    }
    
    /**
     * Generate assessment title
     */
    private generateAssessmentTitle(
        columnName: string,
        baseType: string,
        number?: number
    ): string {
        if (baseType === 'EXT' && number) return `EXT${number}`;
        if (baseType === 'LNT' && number) return `LNT${number}`;
        if (baseType === 'ND' && number) return `ND${number}`;
        if (baseType === 'SD' && number) return `SD${number}`;
        if (baseType === 'KD' && number) return `KD${number}`;
        if (baseType === 'D' && number) return `D${number}`;
        
        return columnName;
    }
    
    /**
     * Add assessment with duplicate detection
     */
    private addAssessment(studentData: StudentData, assessment: Assessment): boolean {
        if (!studentData.assessments) {
            studentData.assessments = [];
        }
        
        // Check for duplicate (same date + column)
        const existingIndex = studentData.assessments.findIndex(
            existing => existing.date === assessment.date && existing.column === assessment.column
        );
        
        if (existingIndex !== -1) {
            // Update existing
            const existing = studentData.assessments[existingIndex];
            studentData.assessments[existingIndex] = {
                ...existing,
                ...assessment,
                updated: this.currentDate
            };
            return false;
        }
        
        // Add new
        studentData.assessments.push(assessment);
        return true;
    }
}




