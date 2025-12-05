import { StudentData } from '../../types/ProgressReportTypes';
import { getLatestAssessmentById } from '../assessmentColumnUtils';

export interface ChartDataPoint {
    range: string;
    count: number;
    color: string;
    score?: number;
    min?: number;
    max?: number;
}

export function getScoreColor(score: number): string {
    if (score <= 2) return '#EF4444'; // Red
    if (score <= 4) return '#F59E0B'; // Orange
    if (score <= 6) return '#FCD34D'; // Yellow
    if (score <= 8) return '#10B981'; // Green
    return '#059669'; // Dark green
}

export function calculateChartDataForEnglishTest(
    students: StudentData[],
    testId: string
): ChartDataPoint[] {
    const bars = Array.from({ length: 10 }, (_, i) => ({
        range: (i + 1).toString(),
        score: i + 1,
        count: 0,
        color: getScoreColor(i + 1)
    }));

    students.forEach(student => {
        const assessment = getLatestAssessmentById(student, testId);
        if (!assessment) return;
        
        // English tests now store percentage in total_percent field
        const percentage = assessment.total_percent;
        if (percentage === null || percentage === undefined) return;
        
        const roundedScore = Math.round(percentage / 10);
        if (roundedScore >= 1 && roundedScore <= 10) {
            bars[roundedScore - 1].count++;
        }
    });

    return bars;
}

export function calculateChartDataForCambridge(
    students: StudentData[],
    assessmentId: string,
    scoreField: 'cambridge_score' | 'cambridge_score_1' | 'cambridge_score_2' = 'cambridge_score'
): ChartDataPoint[] {
    const ranges = [
        { range: '0 (Incorrect)', score: 0, count: 0, color: '#EF4444' },
        { range: '0.5 (Partial)', score: 0.5, count: 0, color: '#F59E0B' },
        { range: '1 (Correct)', score: 1, count: 0, color: '#10B981' }
    ];

    students.forEach(student => {
        const assessment = getLatestAssessmentById(student, assessmentId);
        if (!assessment?.evaluation_details) return;
        
        const score = assessment.evaluation_details[scoreField];
        if (score === null || score === undefined) return;
        
        if (score === 0) {
            ranges[0].count++;
        } else if (score === 0.5) {
            ranges[1].count++;
        } else if (score === 1) {
            ranges[2].count++;
        }
    });

    return ranges;
}

export function calculateChartDataForBinaryHomework(
    students: StudentData[],
    assessmentId: string,
    notDoneLabel: string = 'Not Done',
    doneLabel: string = 'Done'
): ChartDataPoint[] {
    const ranges = [
        { range: notDoneLabel, min: 0, max: 0, count: 0, color: '#EF4444' },
        { range: doneLabel, min: 1, max: 1, count: 0, color: '#10B981' }
    ];

    students.forEach(student => {
        const assessment = getLatestAssessmentById(student, assessmentId);
        if (!assessment) return;
        
        // For homework, check completed_on_time instead of score
        let completionStatus: number;
        if (assessment.completed_on_time !== undefined && assessment.completed_on_time !== null) {
            completionStatus = assessment.completed_on_time;
        } else if (assessment.score && assessment.score !== '') {
            // Fallback to score if completed_on_time is not available
            completionStatus = parseFloat(assessment.score);
            if (isNaN(completionStatus)) return;
        } else {
            return;
        }
        
        if (completionStatus === 0) {
            ranges[0].count++;
        } else if (completionStatus === 1) {
            ranges[1].count++;
        }
    });

    return ranges;
}

export function calculateChartDataForMYP(
    students: StudentData[],
    assessmentId: string
): ChartDataPoint[] {
    const bars = Array.from({ length: 9 }, (_, i) => ({
        range: i.toString(),
        score: i,
        count: 0,
        color: getScoreColor(i)
    }));

    students.forEach(student => {
        const assessment = getLatestAssessmentById(student, assessmentId);
        if (!assessment?.evaluation_details) return;
        
        const score = assessment.evaluation_details.myp_score;
        if (score === null || score === undefined) return;
        
        const roundedScore = Math.round(score);
        if (roundedScore >= 0 && roundedScore <= 8) {
            bars[roundedScore].count++;
        }
    });

    return bars;
}

export function calculateChartDataForPercentage(
    students: StudentData[],
    assessmentId: string
): ChartDataPoint[] {
    const bars = Array.from({ length: 10 }, (_, i) => ({
        range: (i + 1).toString(),
        score: i + 1,
        count: 0,
        color: getScoreColor(i + 1)
    }));

    students.forEach(student => {
        const assessment = getLatestAssessmentById(student, assessmentId);
        if (!assessment) return;
        
        let score: number | null = null;
        
        if (assessment.evaluation_details?.percentage_score !== undefined && 
            assessment.evaluation_details?.percentage_score !== null) {
            score = assessment.evaluation_details.percentage_score;
        } else {
            // Skip if score is empty/blank (no data)
            if (!assessment.score || assessment.score.trim() === '') return;
            
            score = parseFloat(assessment.score);
            if (isNaN(score)) return;
        }
        
        const roundedScore = Math.round(score);
        if (roundedScore >= 1 && roundedScore <= 10) {
            bars[roundedScore - 1].count++;
        }
    });

    return bars;
}

export function calculateChartDataWithMaxPoints(
    students: StudentData[],
    assessmentId: string,
    maxPoints: number
): ChartDataPoint[] {
    const bars = Array.from({ length: maxPoints + 1 }, (_, i) => ({
        range: i.toString(),
        score: i,
        count: 0,
        color: getScoreColor(Math.round((i / maxPoints) * 10))
    }));

    students.forEach(student => {
        const assessment = getLatestAssessmentById(student, assessmentId);
        if (!assessment) return;
        
        // Skip if score is empty/blank (no data)
        if (!assessment.score || assessment.score.trim() === '') return;
        
        const score = parseFloat(assessment.score);
        if (isNaN(score)) return;
        
        const roundedScore = Math.round(score);
        if (roundedScore >= 0 && roundedScore <= maxPoints) {
            bars[roundedScore].count++;
        }
    });

    return bars;
}




