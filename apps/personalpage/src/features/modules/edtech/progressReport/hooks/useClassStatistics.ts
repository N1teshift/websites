import { useMemo } from "react";
import { StudentData } from "../types/ProgressReportTypes";
import { calculateStudentStats } from "../utils/progressReportUtils";

export interface ClassStats {
  studentCount: number;
  averageScore: number;
  averageAttendance: number;
  averageCompletion: number;
}

export function useClassStatistics(students: StudentData[]): ClassStats | null {
  return useMemo(() => {
    if (students.length === 0) return null;

    const allStats = students.map(calculateStudentStats);
    const avgScore = allStats.reduce((sum, s) => sum + s.averageScore, 0) / allStats.length;
    const avgAttendance = allStats.reduce((sum, s) => sum + s.attendanceRate, 0) / allStats.length;
    const avgCompletion = allStats.reduce((sum, s) => sum + s.completionRate, 0) / allStats.length;

    return {
      studentCount: students.length,
      averageScore: Math.round(avgScore * 10) / 10,
      averageAttendance: Math.round(avgAttendance * 10) / 10,
      averageCompletion: Math.round(avgCompletion * 10) / 10,
    };
  }, [students]);
}
