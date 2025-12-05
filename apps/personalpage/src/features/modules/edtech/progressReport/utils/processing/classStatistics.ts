import { StudentData } from '../../types/ProgressReportTypes';
import { calculateStudentStats } from '../progressReportUtils';

export interface ClassStatistics {
    studentCount: number;
    averageScore: number;
    averageAttendance: number;
    averageCompletion: number;
    minScore: number;
    maxScore: number;
}

export function calculateClassStatistics(students: StudentData[]): ClassStatistics | null {
    if (students.length === 0) {
        return null;
    }

    const allStats = students.map(calculateStudentStats);
    const scores = allStats.map(s => s.averageScore).filter(score => !isNaN(score));

    const avgScore = scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : 0;

    const avgAttendance = allStats.reduce((sum, s) => sum + s.attendanceRate, 0) / allStats.length;
    const avgCompletion = allStats.reduce((sum, s) => sum + s.completionRate, 0) / allStats.length;

    return {
        studentCount: students.length,
        averageScore: Math.round(avgScore * 10) / 10,
        averageAttendance: Math.round(avgAttendance * 10) / 10,
        averageCompletion: Math.round(avgCompletion * 10) / 10,
        minScore: scores.length > 0 ? Math.min(...scores) : 0,
        maxScore: scores.length > 0 ? Math.max(...scores) : 0
    };
}

export function calculateAverageScore(students: StudentData[]): number {
    if (students.length === 0) return 0;
    
    const allStats = students.map(calculateStudentStats);
    const scores = allStats.map(s => s.averageScore).filter(score => !isNaN(score));
    
    if (scores.length === 0) return 0;
    
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    return Math.round(avg * 10) / 10;
}

export function calculateAverageAttendance(students: StudentData[]): number {
    if (students.length === 0) return 0;
    
    const allStats = students.map(calculateStudentStats);
    const avg = allStats.reduce((sum, s) => sum + s.attendanceRate, 0) / allStats.length;
    return Math.round(avg * 10) / 10;
}

export function calculateAverageCompletion(students: StudentData[]): number {
    if (students.length === 0) return 0;
    
    const allStats = students.map(calculateStudentStats);
    const avg = allStats.reduce((sum, s) => sum + s.completionRate, 0) / allStats.length;
    return Math.round(avg * 10) / 10;
}




