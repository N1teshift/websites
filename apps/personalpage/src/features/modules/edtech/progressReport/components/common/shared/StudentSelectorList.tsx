import React from 'react';
import { StudentData } from '../../../types/ProgressReportTypes';
import { getStudentFullName } from '../../../utils/progressReportUtils';

interface StudentSelectorListProps {
    students: StudentData[];
    selectedStudent: StudentData | null;
    onSelectStudent: (student: StudentData) => void;
    maxHeight?: string;
    showClass?: boolean;
}

const StudentSelectorList: React.FC<StudentSelectorListProps> = ({
    students,
    selectedStudent,
    onSelectStudent,
    maxHeight = 'max-h-48',
    showClass = true
}) => {
    return (
        <div className={`${maxHeight} overflow-y-auto border border-gray-200 rounded-md`}>
            {students.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                    No students found
                </div>
            ) : (
                students.map(student => {
                    const isSelected = selectedStudent?.first_name === student.first_name &&
                                     selectedStudent?.last_name === student.last_name &&
                                     selectedStudent?.class_name === student.class_name;
                    
                    return (
                        <button
                            key={`${student.first_name}-${student.last_name}-${student.class_name}`}
                            onClick={() => onSelectStudent(student)}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                                isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                        >
                            <div className="font-medium text-gray-900">
                                {getStudentFullName(student)}
                            </div>
                            {showClass && (
                                <div className="text-sm text-gray-500">
                                    {student.class_name}
                                </div>
                            )}
                        </button>
                    );
                })
            )}
        </div>
    );
};

export default StudentSelectorList;




