import React from 'react';
import { StudentCommentData } from '../../hooks/useStudentCommentData';

interface MissingDataWarningProps {
    studentsWithMissingData: StudentCommentData[];
}

export const MissingDataWarning: React.FC<MissingDataWarningProps> = ({
    studentsWithMissingData
}) => {
    if (studentsWithMissingData.length === 0) return null;

    return (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-yellow-800">
                        Missing Assessment Data ({studentsWithMissingData.length} student{studentsWithMissingData.length !== 1 ? 's' : ''})
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                        <p className="mb-2">
                            The following students are missing required assessment data and won&apos;t have comments generated:
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                            {studentsWithMissingData.map((data) => (
                                <li key={data.student.id || `${data.student.first_name}-${data.student.last_name}`}>
                                    <strong>{data.student.first_name} {data.student.last_name}</strong>
                                    {data.missingFields.length > 0 && (
                                        <span className="text-yellow-600 ml-2">
                                            (Missing: {data.missingFields.join(', ')})
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};




