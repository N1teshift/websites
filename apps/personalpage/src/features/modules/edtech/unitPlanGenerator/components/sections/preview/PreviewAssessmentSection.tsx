import React from 'react';
import { UnitPlanData } from '../../../types/UnitPlanTypes';
import { previewStyles } from './previewTheme';

interface PreviewAssessmentSectionProps {
    unitPlan: UnitPlanData;
}

const PreviewAssessmentSection: React.FC<PreviewAssessmentSectionProps> = ({ unitPlan }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2" style={previewStyles.sectionTitle}>
                Assessment & Context Planning
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
                    <div className="font-semibold text-sm uppercase tracking-wide mb-2" style={previewStyles.fieldLabel}>Assessment Title</div>
                    <div className="text-gray-700">{unitPlan.assessmentTitle || 'No assessment title specified'}</div>
                </div>
                {unitPlan.outputMapping !== 'current' && unitPlan.assessmentType && (
                    <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
                        <div className="font-semibold text-sm uppercase tracking-wide mb-2" style={previewStyles.fieldLabel}>Assessment Type</div>
                        <div className="text-gray-700">{unitPlan.assessmentType}</div>
                    </div>
                )}
                <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
                    <div className="font-semibold text-sm uppercase tracking-wide mb-2" style={previewStyles.fieldLabel}>Objectives/Strand(s)</div>
                    <div className="text-gray-700">{unitPlan.objectives.join(', ') || 'No objectives specified'}</div>
                </div>
                <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
                    <div className="font-semibold text-sm uppercase tracking-wide mb-2" style={previewStyles.fieldLabel}>Command Terms</div>
                    <div className="text-gray-700">{unitPlan.commandTerms.join(', ') || 'No command terms specified'}</div>
                </div>
            </div>
            
            <div className="space-y-4 mb-6">
                
                {/* Assessment Tasks - shown in "current" and "custom" modes */}
                {(unitPlan.outputMapping === 'current' || unitPlan.outputMapping === 'custom') && unitPlan.assessmentTasks && unitPlan.assessmentTasks.length > 0 && (
                    <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
                        <div className="font-semibold text-sm uppercase tracking-wide mb-2" style={previewStyles.fieldLabel}>Assessment Tasks</div>
                        <div className="text-gray-700 space-y-3">
                            {unitPlan.assessmentTasks.map((task, index) => (
                                <div key={index} className="border-l-2 pl-3" style={previewStyles.border}>
                                    <div className="font-semibold">TASK {index + 1}: {task.taskTitle}</div>
                                    <div>{task.taskDescription}</div>
                                    <div className="text-sm mt-1 text-gray-600">
                                        <strong>{task.criterionID}</strong>: {task.criterionDescription}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Summative Assessment - shown in "enhanced" and "custom" modes */}
                {(unitPlan.outputMapping === 'enhanced' || unitPlan.outputMapping === 'custom') && unitPlan.summativeAssessment && (
                    <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
                        <div className="font-semibold text-sm uppercase tracking-wide mb-2" style={previewStyles.fieldLabel}>Summative Assessment</div>
                        <div className="text-gray-700">{unitPlan.summativeAssessment}</div>
                    </div>
                )}
                
                {unitPlan.summativeAssessmentRelationshipDescription && (
                    <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
                        <div className="font-semibold text-sm uppercase tracking-wide mb-2" style={previewStyles.fieldLabel}>Summative Assessment Relationship</div>
                        <div className="text-gray-700">{unitPlan.summativeAssessmentRelationshipDescription}</div>
                    </div>
                )}
            </div>

            {/* Contexts - shown in "enhanced" and "custom" modes */}
            {unitPlan.outputMapping !== 'current' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
                        <div className="font-semibold text-sm uppercase tracking-wide mb-2" style={previewStyles.fieldLabel}>Individual Context/Lens</div>
                        <div className="text-gray-700">{unitPlan.individualContext || 'No individual context specified'}</div>
                    </div>
                    <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
                        <div className="font-semibold text-sm uppercase tracking-wide mb-2" style={previewStyles.fieldLabel}>Local Context/Lens</div>
                        <div className="text-gray-700">{unitPlan.localContext || 'No local context specified'}</div>
                    </div>
                    <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
                        <div className="font-semibold text-sm uppercase tracking-wide mb-2" style={previewStyles.fieldLabel}>Global Context/Lens</div>
                        <div className="text-gray-700">{unitPlan.globalContextLens || 'No global context lens specified'}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PreviewAssessmentSection;



