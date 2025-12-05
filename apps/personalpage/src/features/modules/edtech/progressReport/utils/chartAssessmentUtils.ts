import { StudentData } from '../types/ProgressReportTypes';
import { getLatestAssessmentById } from './assessmentColumnUtils';

/**
 * Check if an assessment is an English test by looking for English-specific fields
 */
export function isEnglishTest(students: StudentData[], assessmentId: string): boolean {
    return students.some(student => {
        const assessment = getLatestAssessmentById(student, assessmentId);
        return assessment && (
            assessment.paper1_score !== undefined || 
            assessment.lis1 !== undefined ||
            assessment.paper2_score !== undefined || 
            assessment.read !== undefined ||
            assessment.voc1 !== undefined ||
            assessment.gr1 !== undefined
        );
    });
}

/**
 * Check if any student has data for a specific field in an assessment
 */
export function hasFieldData(students: StudentData[], assessmentId: string, field: string): boolean {
    let foundValues = 0;
    students.forEach(student => {
        const assessment = getLatestAssessmentById(student, assessmentId);
        if (!assessment) return;
        const value = (assessment as unknown as Record<string, unknown>)[field];
        // Only count if the field has a numeric value
        if (typeof value === 'number' && !isNaN(value)) {
            foundValues++;
        }
    });
    return foundValues > 0;
}

export interface AssessmentInfo {
    id: string;
    title: string;
    type: string;
}

export interface GroupedAssessments {
    summative: AssessmentInfo[];
    test: AssessmentInfo[];
    homework: AssessmentInfo[];
    homework_graded: AssessmentInfo[];
    english_diagnostic: AssessmentInfo[];
    english_unit: AssessmentInfo[];
}

/**
 * Group assessments by type, routing English tests to their specific groups
 */
export function groupAssessmentsByType(
    chartOptions: Array<{ id: string; title: string; type: string }>,
    availableAssessments: AssessmentInfo[],
    students: StudentData[]
): GroupedAssessments {
    const groups: GroupedAssessments = {
        summative: [],
        test: [],
        homework: [],
        homework_graded: [],
        english_diagnostic: [],
        english_unit: []
    };
    
    chartOptions.forEach(option => {
        if (option.type === 'assessment') {
            const assessment = availableAssessments.find(a => a.id === option.id);
            if (assessment) {
                const isEnglish = isEnglishTest(students, assessment.id);
                
                if (isEnglish) {
                    // Route English tests to their specific groups
                    if (assessment.type === 'diagnostic') {
                        groups.english_diagnostic.push(assessment);
                    } else if (assessment.type === 'summative') {
                        groups.english_unit.push(assessment);
                    }
                } else {
                    // Route regular math assessments to their type groups
                    const groupKey = assessment.type as keyof GroupedAssessments;
                    if (groups[groupKey] && Array.isArray(groups[groupKey])) {
                        groups[groupKey].push(assessment);
                    }
                }
            }
        } else if (option.type === 'english_test') {
            // Legacy support for old english_test type
            if (option.id.startsWith('diagnostic_')) {
                groups.english_diagnostic.push({ id: option.id, title: option.title, type: 'diagnostic' });
            } else if (option.id.startsWith('unit_')) {
                groups.english_unit.push({ id: option.id, title: option.title, type: 'summative' });
            }
        }
    });
    
    return groups;
}




