import React from 'react';
import { UnitPlanData } from '../../../types/UnitPlanTypes';
import { previewStyles } from './previewTheme';

interface PreviewHeaderProps {
    unitPlan: UnitPlanData;
}

const PreviewHeader: React.FC<PreviewHeaderProps> = ({ unitPlan }) => {
    return (
        <div style={previewStyles.header} className="text-white p-8 rounded-t-lg">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{unitPlan.schoolName}</h1>
                <div className="space-y-1" style={previewStyles.headerText}>
                    <div><span className="font-semibold">Teacher(s):</span> {unitPlan.contributingTeachers.length > 0 ? unitPlan.contributingTeachers.join(', ') : 'Not specified'}</div>
                    <div><span className="font-semibold">Subject:</span> {unitPlan.subject || 'Not specified'}</div>
                    <div><span className="font-semibold">MYP Year:</span> {unitPlan.mypYear ? `MYP Year ${unitPlan.mypYear}` : 'Not specified'}</div>
                    <div><span className="font-semibold">Academic Year:</span> {unitPlan.academicYear || 'Not specified'}</div>
                    <div><span className="font-semibold">Lessons:</span> {unitPlan.lessonCount || 'Not specified'}</div>
                </div>
            </div>
            <div style={previewStyles.headerBorder} className="border-t pt-4">
                <h2 className="text-2xl font-bold mb-2">{unitPlan.unitTitle}</h2>
            </div>
        </div>
    );
};

export default PreviewHeader;




