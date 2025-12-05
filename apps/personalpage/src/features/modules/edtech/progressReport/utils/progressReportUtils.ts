import { StudentData, Assessment, StudentStats } from '../types/ProgressReportTypes';

export const calculateStudentStats = (student: StudentData): StudentStats => {
    const assessments = student.assessments || [];
    const totalAssessments = assessments.length;

    const numericScores = assessments
        .map(a => parseFloat(a.score))
        .filter(score => !isNaN(score));

    const averageScore = numericScores.length > 0
        ? numericScores.reduce((sum, score) => sum + score, 0) / numericScores.length
        : 0;

    const attendanceRecords = student.attendance_records || [];
    const totalMonths = attendanceRecords.length;
    
    let attendanceRate = 100;
    if (totalMonths > 0) {
        const totalAbsent = attendanceRecords.reduce((sum, r) => sum + r.absent_lessons, 0);
        const averageLessonsPerMonth = 20;
        const totalPossibleLessons = totalMonths * averageLessonsPerMonth;
        attendanceRate = totalPossibleLessons > 0
            ? ((totalPossibleLessons - totalAbsent) / totalPossibleLessons) * 100
            : 100;
    }

    const materialCompletion = student.material_completion || {};
    const completionValues = Object.values(materialCompletion).map(m => m.percentage);
    const completionRate = completionValues.length > 0
        ? completionValues.reduce((sum, p) => sum + p, 0) / completionValues.length
        : 0;

    const cambridgeTests = student.cambridge_tests || [];
    const latestCambridgeTest = cambridgeTests.length > 0
        ? cambridgeTests[cambridgeTests.length - 1]
        : undefined;

    return {
        totalAssessments,
        averageScore: Math.round(averageScore * 10) / 10,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
        completionRate: Math.round(completionRate * 10) / 10,
        latestCambridgeTest
    };
};

export const filterAssessmentsByType = (
    assessments: Assessment[],
    type: string
): Assessment[] => {
    if (type === 'all') return assessments;
    return assessments.filter(a => a.type === type);
};

export const filterAssessmentsByTypes = (
    assessments: Assessment[],
    types: string[]
): Assessment[] => {
    if (types.length === 0) return assessments;
    return assessments.filter(a => types.includes(a.type));
};

export const filterAssessmentsByDateRange = (
    assessments: Assessment[],
    startDate: string | null,
    endDate: string | null
): Assessment[] => {
    let filtered = assessments;

    if (startDate) {
        filtered = filtered.filter(a => a.date >= startDate);
    }

    if (endDate) {
        filtered = filtered.filter(a => a.date <= endDate);
    }

    return filtered;
};

export const sortAssessments = (
    assessments: Assessment[],
    sortBy: 'date_desc' | 'date_asc' | 'score_desc' | 'score_asc'
): Assessment[] => {
    const sorted = [...assessments];

    switch (sortBy) {
        case 'date_desc':
            return sorted.sort((a, b) => b.date.localeCompare(a.date));
        case 'date_asc':
            return sorted.sort((a, b) => a.date.localeCompare(b.date));
        case 'score_desc':
            return sorted.sort((a, b) => {
                const scoreA = parseFloat(a.score) || 0;
                const scoreB = parseFloat(b.score) || 0;
                return scoreB - scoreA;
            });
        case 'score_asc':
            return sorted.sort((a, b) => {
                const scoreA = parseFloat(a.score) || 0;
                const scoreB = parseFloat(b.score) || 0;
                return scoreA - scoreB;
            });
        default:
            return sorted;
    }
};

export const getAssessmentTypes = (assessments: Assessment[]): string[] => {
    const types = new Set(assessments.map(a => a.type).filter(Boolean));
    return Array.from(types).sort();
};

export const getProfileDisplayValue = (field: string, rawValue: string): string => {
    if (!rawValue || rawValue === '') return 'No data';

    const mappings: Record<string, Record<string, string>> = {
        writing_quality: { '1': 'Readable', '0': 'Needs improvement' },
        notebook_quality: { '1': 'Acceptable', '0': 'Needs improving' },
        is_reflective: { '1': 'Developed', '0': 'Needs support' },
        math_communication: { '0': 'Proficient', '1': 'Developing' },
        has_corepetitor: { '1': 'Yes', '0': 'No' }
    };

    if (field in mappings && rawValue in mappings[field]) {
        return mappings[field][rawValue];
    }

    return rawValue;
};

export const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch {
        return dateString;
    }
};

export const formatPercentage = (value: number): string => {
    return `${Math.round(value)}%`;
};

export const getStudentFullName = (student: StudentData): string => {
    return `${student.first_name} ${student.last_name}`;
};

/**
 * Calculate cumulative board solving score from all LNT assessments
 * Excludes LNT0 (experimental) and cumulative records
 */
export const calculateBoardSolvingCumulative = (student: StudentData): number => {
    if (!student.assessments) return 0;
    
    const boardSolvingAssessments = student.assessments.filter(assessment => {
        // Only include board_solving type
        if (assessment.type !== 'board_solving') return false;
        
        // Exclude LNT0 (experimental)
        if (assessment.column === 'LNT0') return false;
        
        // Exclude cumulative records (shouldn't be summed)
        if (assessment.task_name?.toLowerCase().includes('cumulative')) return false;
        
        return true;
    });
    
    // Sum all the scores
    const total = boardSolvingAssessments.reduce((sum, assessment) => {
        const score = parseFloat(assessment.score);
        return sum + (isNaN(score) ? 0 : score);
    }, 0);
    
    return total;
};




