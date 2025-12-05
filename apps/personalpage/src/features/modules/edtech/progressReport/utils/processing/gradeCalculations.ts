import { StudentData } from '../../types/ProgressReportTypes';
import { getLatestAssessmentById } from '../assessmentColumnUtils';

export type SDGroup = 'SD1+SD2+SD3' | 'SD4+SD5+SD6';

export interface TestScores {
    sd1: number | null;
    sd2: number | null;
    sd3: number | null;
}

export interface SDGroupConfig {
    maxPoints: number;
    breakdown: { test: string; points: number }[];
}

// Configuration for different SD test groups
export const SD_GROUP_CONFIGS: Record<SDGroup, SDGroupConfig> = {
    'SD1+SD2+SD3': {
        maxPoints: 32, // SD1(8) + SD2(6) + SD3(18)
        breakdown: [
            { test: 'SD1', points: 8 },
            { test: 'SD2', points: 6 },
            { test: 'SD3', points: 18 }
        ]
    },
    'SD4+SD5+SD6': {
        maxPoints: 35, // SD4(16) + SD5(8) + SD6(11)
        breakdown: [
            { test: 'SD4', points: 16 },
            { test: 'SD5', points: 8 },
            { test: 'SD6', points: 11 }
        ]
    }
};

export function getMaxPointsForGroup(sdGroup: SDGroup): number {
    return SD_GROUP_CONFIGS[sdGroup].maxPoints;
}

export interface GradeCalculationResult {
    sum: number | null;
    grade: number | null;
    testScores: TestScores;
}

export function getTestScores(student: StudentData, sdGroup: SDGroup = 'SD1+SD2+SD3'): TestScores {
    let sd1Id: string, sd2Id: string, sd3Id: string;
    
    if (sdGroup === 'SD4+SD5+SD6') {
        sd1Id = 'sd4';
        sd2Id = 'sd5';
        sd3Id = 'sd6';
    } else {
        sd1Id = 'sd1';
        sd2Id = 'sd2';
        sd3Id = 'sd3';
    }
    
    // Try to get assessments, falling back to 'test-' prefix if not found
    // This handles inconsistency where SD1-5 use "sd1" but SD6+ use "test-sd6"
    let sd1 = getLatestAssessmentById(student, sd1Id);
    if (!sd1) sd1 = getLatestAssessmentById(student, `test-${sd1Id}`);
    
    let sd2 = getLatestAssessmentById(student, sd2Id);
    if (!sd2) sd2 = getLatestAssessmentById(student, `test-${sd2Id}`);
    
    let sd3 = getLatestAssessmentById(student, sd3Id);
    if (!sd3) sd3 = getLatestAssessmentById(student, `test-${sd3Id}`);

    return {
        sd1: sd1?.evaluation_details?.percentage_score ?? null,
        sd2: sd2?.evaluation_details?.percentage_score ?? null,
        sd3: sd3?.evaluation_details?.percentage_score ?? null
    };
}

export function calculateTestSum(testScores: TestScores): number | null {
    const { sd1, sd2, sd3 } = testScores;
    
    if (sd1 === null || sd2 === null || sd3 === null) {
        return null;
    }

    return sd1 + sd2 + sd3;
}

export function calculateGradeFromSum(sum: number | null, maxPointsFor10: number = 16): number | null {
    if (sum === null) {
        return null;
    }

    // Formula: (total_points / maxPointsFor10) * 10, capped at 10
    // This means if a student gets maxPointsFor10 points, they get grade 10
    // Round up if .5 or higher
    const calculated = (sum / maxPointsFor10) * 10;
    const rounded = Math.ceil(calculated);
    return Math.min(rounded, 10);
}

export function calculateGrade(student: StudentData, maxPointsFor10: number = 16, sdGroup: SDGroup = 'SD1+SD2+SD3'): GradeCalculationResult {
    const testScores = getTestScores(student, sdGroup);
    const sum = calculateTestSum(testScores);
    const grade = calculateGradeFromSum(sum, maxPointsFor10);

    return {
        sum,
        grade,
        testScores
    };
}

export function hasAllTestScores(testScores: TestScores): boolean {
    return testScores.sd1 !== null && testScores.sd2 !== null && testScores.sd3 !== null;
}

export function getMissingTests(testScores: TestScores, sdGroup: SDGroup = 'SD1+SD2+SD3'): string[] {
    const missing: string[] = [];
    const labels = sdGroup === 'SD4+SD5+SD6' ? ['SD4', 'SD5', 'SD6'] : ['SD1', 'SD2', 'SD3'];
    
    if (testScores.sd1 === null) missing.push(labels[0]);
    if (testScores.sd2 === null) missing.push(labels[1]);
    if (testScores.sd3 === null) missing.push(labels[2]);
    
    return missing;
}

export function calculateOptimalMaxPoints(students: StudentData[], targetAverage: number, sdGroup: SDGroup = 'SD1+SD2+SD3'): number {
    // Filter students with all three tests
    const studentsWithAllTests = students.filter(student => {
        const testScores = getTestScores(student, sdGroup);
        return hasAllTestScores(testScores);
    });

    const maxAvailablePoints = getMaxPointsForGroup(sdGroup);
    const defaultThreshold = Math.round(maxAvailablePoints * 0.5);

    if (studentsWithAllTests.length === 0) {
        return defaultThreshold;
    }

    // We need to solve for maxPointsFor10 where:
    // average = sum(min(ceil((sum_i / maxPointsFor10) * 10), 10)) / count
    // This requires iterative search since ceil and min make it non-linear

    let bestMaxPoints = defaultThreshold;
    let bestDiff = Infinity;

    // Search from 10 to max available points (10 = very generous, maxAvailablePoints = maximum possible)
    // Use 1 point increments for simplicity
    for (let maxPts = 10; maxPts <= maxAvailablePoints; maxPts += 1) {
        const grades = studentsWithAllTests.map(student => {
            const testScores = getTestScores(student, sdGroup);
            const sum = calculateTestSum(testScores);
            return calculateGradeFromSum(sum, maxPts);
        }).filter(g => g !== null) as number[];

        if (grades.length > 0) {
            const avg = grades.reduce((sum, g) => sum + g, 0) / grades.length;
            const diff = Math.abs(avg - targetAverage);
            
            if (diff < bestDiff) {
                bestDiff = diff;
                bestMaxPoints = maxPts;
            }
        }
    }

    return Math.round(bestMaxPoints); // Round to integer
}




