import { useMemo } from 'react';
import { StudentData } from '../types/ProgressReportTypes';
import { getLatestAssessmentById } from '../utils/assessmentColumnUtils';
import { AllScoreTypes, EnglishTestScoreType } from '../components/common/ClassPerformanceChartEnhanced';
import {
    calculateChartDataForEnglishTest,
    calculateChartDataForCambridge,
    calculateChartDataForBinaryHomework,
    calculateChartDataForMYP,
    calculateChartDataForPercentage,
    calculateChartDataWithMaxPoints
} from '../utils/processing/chartDataCalculator';
import { getScaleConfig, generateChartBars, assignScoreToBar } from '../utils/chartScaleConfig';

export interface ChartDataPoint {
    range: string;
    score?: number;
    count: number;
    color: string;
}

interface UseChartDataProps {
    students: StudentData[];
    assessmentId: string;
    assessmentType: string;
    scoreType: AllScoreTypes;
    currentOptionType?: string;
    homeworkHasScores: boolean;
    homeworkViewMode: 'completion' | 'scores';
    assessmentMaxPoints: number | null;
    supportsMultipleScores: boolean;
    t: (key: string) => string;
}

/**
 * Hook to calculate chart data based on assessment type and score type
 */
export function useChartData({
    students,
    assessmentId,
    assessmentType,
    scoreType,
    currentOptionType,
    homeworkHasScores,
    homeworkViewMode,
    assessmentMaxPoints,
    supportsMultipleScores,
    t
}: UseChartDataProps): ChartDataPoint[] {
    return useMemo(() => {
        // Legacy English test type
        if (currentOptionType === 'english_test') {
            return calculateChartDataForEnglishTest(students, assessmentId);
        }
        
        // Handle English test component score types
        const englishScoreTypes: EnglishTestScoreType[] = [
            'lis1', 'lis2', 'read', 'voc1', 'voc2', 'gr1', 'gr2', 'gr3', 
            'paper1', 'paper2', 'paper3', 'paper1_percent', 'paper2_percent', 'paper3_percent', 'total_percent'
        ];
        
        if (englishScoreTypes.includes(scoreType as EnglishTestScoreType)) {
            return calculateEnglishComponentData(students, assessmentId, scoreType);
        }
        
        // Cambridge score types
        if (supportsMultipleScores && scoreType === 'cambridge') {
            return calculateChartDataForCambridge(students, assessmentId, 'cambridge_score');
        }
        if (supportsMultipleScores && scoreType === 'cambridge_1') {
            return calculateChartDataForCambridge(students, assessmentId, 'cambridge_score_1');
        }
        if (supportsMultipleScores && scoreType === 'cambridge_2') {
            return calculateChartDataForCambridge(students, assessmentId, 'cambridge_score_2');
        }
        
        // Homework handling
        if (assessmentType === 'homework') {
            if (homeworkHasScores && homeworkViewMode === 'scores') {
                if (assessmentMaxPoints !== null && assessmentMaxPoints > 0) {
                    return calculateChartDataWithMaxPoints(students, assessmentId, assessmentMaxPoints);
                }
                return calculateChartDataForPercentage(students, assessmentId);
            }
            return calculateChartDataForBinaryHomework(students, assessmentId, t('not_done'), t('done'));
        }
        
        // Regular assessment handling
        if (supportsMultipleScores && scoreType === 'myp') {
            return calculateChartDataForMYP(students, assessmentId);
        }
        
        if (assessmentMaxPoints !== null && assessmentMaxPoints > 0) {
            return calculateChartDataWithMaxPoints(students, assessmentId, assessmentMaxPoints);
        }
        
        return calculateChartDataForPercentage(students, assessmentId);
    }, [
        students, 
        assessmentId, 
        currentOptionType, 
        assessmentType, 
        supportsMultipleScores, 
        scoreType, 
        homeworkHasScores, 
        homeworkViewMode, 
        assessmentMaxPoints, 
        t
    ]);
}

/**
 * Calculate chart data for English test components (lis1, read, paper1, etc.)
 * Uses appropriate scale configuration for each score type
 */
function calculateEnglishComponentData(
    students: StudentData[], 
    assessmentId: string, 
    scoreType: string
): ChartDataPoint[] {
    // Get the scale configuration for this score type
    const scaleConfig = getScaleConfig(scoreType as AllScoreTypes);
    
    // Generate bars based on scale configuration
    const bars = generateChartBars(scaleConfig);
    
    console.log(`📊 Calculating data for ${scoreType}:`, {
        assessmentId,
        scoreType,
        fieldName: scaleConfig.fieldName || scoreType,
        scaleConfig,
        barCount: bars.length,
        barRanges: bars.map(b => b.range)
    });
    
    // Collect scores for debugging
    const scores: number[] = [];
    
    // Populate bars with student scores
    students.forEach(student => {
        const assessment = getLatestAssessmentById(student, assessmentId);
        if (!assessment) return;
        
        // Use the fieldName from config if specified, otherwise use scoreType
        const fieldName = scaleConfig.fieldName || scoreType;
        const value = (assessment as unknown as Record<string, unknown>)[fieldName];
        
        if (typeof value !== 'number' || isNaN(value)) return;
        
        scores.push(value);
        
        // Assign score to appropriate bar
        assignScoreToBar(value, bars, scaleConfig);
    });
    
    console.log(`📊 Scores found for ${scoreType}:`, scores);
    console.log(`📊 Bar counts:`, bars.map(b => ({ range: b.range, count: b.count })));
    
    return bars;
}




