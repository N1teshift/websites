import { useMemo } from 'react';
import { StudentData } from '../types/ProgressReportTypes';
import { getLatestAssessmentById } from '../utils/assessmentColumnUtils';
import { hasFieldData } from '../utils/chartAssessmentUtils';
import { AllScoreTypes } from '../components/common/ClassPerformanceChartEnhanced';

export interface ScoreTypeOption {
    value: AllScoreTypes;
    label: string;
    field?: string;
}

/**
 * Hook to determine available score types for a given assessment
 */
export function useAvailableScoreTypes(
    students: StudentData[],
    assessmentId: string,
    supportsMultipleScores: boolean
): ScoreTypeOption[] {
    return useMemo(() => {
        if (!supportsMultipleScores || !assessmentId) {
            return [];
        }
        
        // Check if this is an English test with special fields
        const hasEnglishFields = students.some(student => {
            const assessment = getLatestAssessmentById(student, assessmentId);
            return assessment && (
                assessment.lis1 !== undefined || assessment.lis2 !== undefined ||
                assessment.read !== undefined || assessment.voc1 !== undefined ||
                assessment.voc2 !== undefined || assessment.gr1 !== undefined ||
                assessment.gr2 !== undefined || assessment.gr3 !== undefined ||
                assessment.paper1_score !== undefined || assessment.paper2_score !== undefined ||
                assessment.paper3_score !== undefined
            );
        });
        
        if (hasEnglishFields) {
            return buildEnglishScoreTypes(students, assessmentId);
        }
        
        return buildRegularScoreTypes(students, assessmentId);
    }, [supportsMultipleScores, assessmentId, students]);
}

/**
 * Build score type options for English tests
 */
function buildEnglishScoreTypes(students: StudentData[], assessmentId: string): ScoreTypeOption[] {
    const scoreTypes: ScoreTypeOption[] = [];
    
    // Diagnostic test fields
    if (hasFieldData(students, assessmentId, 'paper1_score')) {
        scoreTypes.push({ value: 'paper1', label: 'Paper 1 (Reading & Use)', field: 'paper1_score' });
    }
    if (hasFieldData(students, assessmentId, 'paper1_percent')) {
        scoreTypes.push({ value: 'paper1_percent', label: 'Paper 1 %', field: 'paper1_percent' });
    }
    if (hasFieldData(students, assessmentId, 'paper2_score')) {
        scoreTypes.push({ value: 'paper2', label: 'Paper 2 (Listening)', field: 'paper2_score' });
    }
    if (hasFieldData(students, assessmentId, 'paper2_percent')) {
        scoreTypes.push({ value: 'paper2_percent', label: 'Paper 2 %', field: 'paper2_percent' });
    }
    if (hasFieldData(students, assessmentId, 'paper3_score')) {
        scoreTypes.push({ value: 'paper3', label: 'Paper 3 (Writing)', field: 'paper3_score' });
    }
    if (hasFieldData(students, assessmentId, 'paper3_percent')) {
        scoreTypes.push({ value: 'paper3_percent', label: 'Paper 3 %', field: 'paper3_percent' });
    }
    
    // Unit test fields
    if (hasFieldData(students, assessmentId, 'lis1')) {
        scoreTypes.push({ value: 'lis1', label: 'Listening', field: 'lis1' });
    }
    if (hasFieldData(students, assessmentId, 'lis2')) {
        scoreTypes.push({ value: 'lis2', label: 'Listening 2', field: 'lis2' });
    }
    if (hasFieldData(students, assessmentId, 'read')) {
        scoreTypes.push({ value: 'read', label: 'Reading', field: 'read' });
    }
    if (hasFieldData(students, assessmentId, 'voc1')) {
        scoreTypes.push({ value: 'voc1', label: 'Vocabulary 1', field: 'voc1' });
    }
    if (hasFieldData(students, assessmentId, 'voc2')) {
        scoreTypes.push({ value: 'voc2', label: 'Vocabulary 2', field: 'voc2' });
    }
    if (hasFieldData(students, assessmentId, 'gr1')) {
        scoreTypes.push({ value: 'gr1', label: 'Grammar 1', field: 'gr1' });
    }
    if (hasFieldData(students, assessmentId, 'gr2')) {
        scoreTypes.push({ value: 'gr2', label: 'Grammar 2', field: 'gr2' });
    }
    if (hasFieldData(students, assessmentId, 'gr3')) {
        scoreTypes.push({ value: 'gr3', label: 'Grammar 3', field: 'gr3' });
    }
    
    // Total percentage
    if (hasFieldData(students, assessmentId, 'total_percent')) {
        scoreTypes.push({ value: 'total_percent', label: 'Total Percentage', field: 'total_percent' });
    }
    
    return scoreTypes;
}

/**
 * Build score type options for regular math tests
 */
function buildRegularScoreTypes(students: StudentData[], assessmentId: string): ScoreTypeOption[] {
    const allScoreTypes: ScoreTypeOption[] = [
        { value: 'percentage', label: 'Percentage (0-10)' },
        { value: 'myp', label: 'MYP Score (0-8)', field: 'myp_score' },
        { value: 'cambridge', label: 'Cambridge Score (0, 0.5, 1)', field: 'cambridge_score' },
        { value: 'cambridge_1', label: 'Cambridge 1 (0, 0.5, 1)', field: 'cambridge_score_1' },
        { value: 'cambridge_2', label: 'Cambridge 2 (0, 0.5, 1)', field: 'cambridge_score_2' }
    ];
    
    return allScoreTypes.filter(scoreType => {
        if (scoreType.value === 'percentage') return true;
        
        const hasData = students.some(student => {
            const assessment = getLatestAssessmentById(student, assessmentId);
            if (!assessment?.evaluation_details) return false;
            
            const fieldName = scoreType.field as keyof typeof assessment.evaluation_details;
            const value = assessment.evaluation_details[fieldName];
            return value !== null && value !== undefined;
        });
        
        return hasData;
    });
}




