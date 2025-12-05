import { Assessment } from '../../types/ProgressReportTypes';

/**
 * Extract math assessment value from evaluation_details
 */
export function extractAssessmentValue(
    assessments: Assessment[] | undefined, 
    assessmentId: string, 
    field: 'percentage_score' | 'myp_score' | 'cambridge_score' | 'cambridge_score_1' | 'cambridge_score_2'
): number | null {
    if (!assessments) return null;
    const assessment = assessments.find(a => a.assessment_id === assessmentId);
    if (!assessment?.evaluation_details) return null;
    const value = assessment.evaluation_details[field];
    return value !== null && value !== undefined ? value : null;
}

/**
 * Extract English test values directly from assessment fields
 */
export function extractEnglishTestValue(
    assessments: Assessment[] | undefined, 
    assessmentId: string, 
    field: string
): number | null {
    if (!assessments) return null;
    const assessment = assessments.find(a => a.assessment_id === assessmentId);
    if (!assessment) return null;
    const value = (assessment as unknown as Record<string, unknown>)[field];
    return typeof value === 'number' && !isNaN(value) ? value : null;
}

/**
 * Extract Math test data for a student
 */
export interface MathTestData {
    sd1p: number | null;
    sd1myp: number | null;
    sd1c1: number | null;
    sd1c2: number | null;
    sd2p: number | null;
    sd2myp: number | null;
    sd2c: number | null;
    sd3p: number | null;
    sd3myp: number | null;
    sd3c: number | null;
    p1: number | null;
}

export function extractMathTestData(assessments: Assessment[] | undefined): MathTestData {
    const sd1p = extractAssessmentValue(assessments, 'sd1', 'percentage_score');
    const sd1myp = extractAssessmentValue(assessments, 'sd1', 'myp_score');
    const sd1c1 = extractAssessmentValue(assessments, 'sd1', 'cambridge_score_1');
    const sd1c2 = extractAssessmentValue(assessments, 'sd1', 'cambridge_score_2');
    
    const sd2p = extractAssessmentValue(assessments, 'sd2', 'percentage_score');
    const sd2myp = extractAssessmentValue(assessments, 'sd2', 'myp_score');
    const sd2c = extractAssessmentValue(assessments, 'sd2', 'cambridge_score');
    
    const sd3p = extractAssessmentValue(assessments, 'sd3', 'percentage_score');
    const sd3myp = extractAssessmentValue(assessments, 'sd3', 'myp_score');
    const sd3c = extractAssessmentValue(assessments, 'sd3', 'cambridge_score');

    // P1 is stored in the score field directly for sav_darb type
    const p1Assessment = assessments?.find(a => a.assessment_id === 'p1');
    const p1 = p1Assessment ? parseFloat(p1Assessment.score) : null;

    return { sd1p, sd1myp, sd1c1, sd1c2, sd2p, sd2myp, sd2c, sd3p, sd3myp, sd3c, p1 };
}

/**
 * Extract English Diagnostic TEST 1 data
 */
export interface EnglishDiagnosticData {
    d1Paper1Percent: number | null;
    d1Paper2Percent: number | null;
    d1Paper3Percent: number | null;
    d1TotalPercent: number | null;
}

export function extractEnglishDiagnosticData(assessments: Assessment[] | undefined): EnglishDiagnosticData {
    const d1Paper1Percent = extractEnglishTestValue(assessments, 'd1', 'paper1_percent');
    const d1Paper2Percent = extractEnglishTestValue(assessments, 'd1', 'paper2_percent');
    const d1Paper3Percent = extractEnglishTestValue(assessments, 'd1', 'paper3_percent');
    const d1TotalPercent = extractEnglishTestValue(assessments, 'd1', 'total_percent');

    return { d1Paper1Percent, d1Paper2Percent, d1Paper3Percent, d1TotalPercent };
}

/**
 * Extract English Unit 1 TEST data
 */
export interface EnglishUnit1Data {
    t1Lis: number | null;
    t1LisMax: number;
    t1Read: number | null;
    t1ReadMax: number;
    t1Voc: number | null;
    t1VocMax: number;
    t1Gr: number | null;
    t1GrMax: number;
    t1TotalScore: number | null;
    t1TotalPercent: number | null;
}

export function extractEnglishUnit1Data(assessments: Assessment[] | undefined): EnglishUnit1Data {
    const t1Lis1 = extractEnglishTestValue(assessments, 't1', 'lis1');
    const t1Lis2 = extractEnglishTestValue(assessments, 't1', 'lis2');
    
    // Listening: combine available components
    let t1Lis: number | null = null;
    let t1LisMax = 0;
    
    if (t1Lis1 !== null || t1Lis2 !== null) {
        t1Lis = 0;
        if (t1Lis1 !== null) { t1Lis += t1Lis1; t1LisMax += 5; }
        if (t1Lis2 !== null) { t1Lis += t1Lis2; t1LisMax += 5; }
    }
    
    const t1Read = extractEnglishTestValue(assessments, 't1', 'read');
    const t1ReadMax = t1Read !== null ? 10 : 0;
    
    const t1Voc1 = extractEnglishTestValue(assessments, 't1', 'voc1');
    const t1Voc2 = extractEnglishTestValue(assessments, 't1', 'voc2');
    
    // Vocabulary: combine available components
    let t1Voc: number | null = null;
    let t1VocMax = 0;
    
    if (t1Voc1 !== null || t1Voc2 !== null) {
        t1Voc = 0;
        if (t1Voc1 !== null) { t1Voc += t1Voc1; t1VocMax += 5; }
        if (t1Voc2 !== null) { t1Voc += t1Voc2; t1VocMax += 5; }
    }
    
    const t1Gr1 = extractEnglishTestValue(assessments, 't1', 'gr1');
    const t1Gr2 = extractEnglishTestValue(assessments, 't1', 'gr2');
    const t1Gr3 = extractEnglishTestValue(assessments, 't1', 'gr3');
    
    // Grammar: combine available components (unit tests typically only have gr1 and gr2)
    let t1Gr: number | null = null;
    let t1GrMax = 0;
    
    if (t1Gr1 !== null || t1Gr2 !== null || t1Gr3 !== null) {
        t1Gr = 0;
        if (t1Gr1 !== null) { t1Gr += t1Gr1; t1GrMax += 5; }
        if (t1Gr2 !== null) { t1Gr += t1Gr2; t1GrMax += 5; }
        if (t1Gr3 !== null) { t1Gr += t1Gr3; t1GrMax += 5; }
    }
    
    const t1TotalScore = extractEnglishTestValue(assessments, 't1', 'total_score');
    const t1TotalPercent = extractEnglishTestValue(assessments, 't1', 'total_percent');

    return {
        t1Lis, t1LisMax, t1Read, t1ReadMax,
        t1Voc, t1VocMax, t1Gr, t1GrMax,
        t1TotalScore, t1TotalPercent
    };
}




