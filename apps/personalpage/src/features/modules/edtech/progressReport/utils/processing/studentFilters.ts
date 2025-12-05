import { StudentData } from '../../types/ProgressReportTypes';
import { getStudentFullName } from '../progressReportUtils';

export function filterStudentsBySearch(students: StudentData[], query: string): StudentData[] {
    if (!query) return students;
    
    const lowerQuery = query.toLowerCase();
    return students.filter(s =>
        s.first_name.toLowerCase().includes(lowerQuery) ||
        s.last_name.toLowerCase().includes(lowerQuery) ||
        getStudentFullName(s).toLowerCase().includes(lowerQuery)
    );
}

export function filterStudentsByClass(students: StudentData[], className: string): StudentData[] {
    if (className === 'all') return students;
    return students.filter(s => s.class_name === className);
}

export function sortStudentsByName(students: StudentData[], direction: 'asc' | 'desc' = 'asc'): StudentData[] {
    const sorted = [...students].sort((a, b) => {
        const comparison = getStudentFullName(a).localeCompare(getStudentFullName(b));
        return direction === 'asc' ? comparison : -comparison;
    });
    return sorted;
}

export function sortStudentsByLastName(students: StudentData[], direction: 'asc' | 'desc' = 'asc'): StudentData[] {
    const sorted = [...students].sort((a, b) => {
        let comparison = a.last_name.localeCompare(b.last_name);
        if (comparison === 0) {
            comparison = a.first_name.localeCompare(b.first_name);
        }
        return direction === 'asc' ? comparison : -comparison;
    });
    return sorted;
}




