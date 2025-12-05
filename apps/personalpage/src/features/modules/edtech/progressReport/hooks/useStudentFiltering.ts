import { useMemo } from 'react';
import { StudentData } from '../types/ProgressReportTypes';
import { getStudentFullName } from '../utils/progressReportUtils';

export interface StudentFilterConfig {
    searchQuery?: string;
    selectedClass?: string;
    showAllClasses?: boolean;
}

interface UseStudentFilteringOptions {
    students: StudentData[];
    filters: StudentFilterConfig;
}

export function useStudentFiltering({ students, filters }: UseStudentFilteringOptions): StudentData[] {
    return useMemo(() => {
        let filtered = students;

        // Filter by class
        if (filters.selectedClass && !filters.showAllClasses) {
            filtered = filtered.filter(s => s.class_name === filters.selectedClass);
        }

        // Filter by search query
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.first_name.toLowerCase().includes(query) ||
                s.last_name.toLowerCase().includes(query) ||
                getStudentFullName(s).toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [students, filters.searchQuery, filters.selectedClass, filters.showAllClasses]);
}




