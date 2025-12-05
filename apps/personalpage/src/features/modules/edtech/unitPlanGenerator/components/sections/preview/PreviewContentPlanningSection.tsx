import React from 'react';
import { UnitPlanData } from '../../../types/UnitPlanTypes';

interface PreviewContentPlanningSectionProps {
    unitPlan: UnitPlanData;
}

const PreviewContentPlanningSection: React.FC<PreviewContentPlanningSectionProps> = ({ unitPlan }) => {
    const isCurrent = unitPlan.outputMapping === 'current';
    const isFull = unitPlan.outputMapping === 'custom';
    const isEnhanced = unitPlan.outputMapping === 'enhanced';
    
    const hasPriorKnowledge = (isCurrent || isFull) && (
        (unitPlan.priorKnowledgeSubjectSpecific && unitPlan.priorKnowledgeSubjectSpecific.length > 0) ||
        (unitPlan.priorKnowledgeLearningSkills && unitPlan.priorKnowledgeLearningSkills.length > 0) ||
        (unitPlan.topicsTerminology && unitPlan.topicsTerminology.length > 0) ||
        (unitPlan.conceptualKnowledge && unitPlan.conceptualKnowledge.length > 0) ||
        (unitPlan.proceduralKnowledge && unitPlan.proceduralKnowledge.length > 0) ||
        (unitPlan.informalFormativeAssessment && unitPlan.informalFormativeAssessment.length > 0) ||
        (unitPlan.formalFormativeAssessment && unitPlan.formalFormativeAssessment.length > 0) ||
        (unitPlan.differentiationByAccess && unitPlan.differentiationByAccess.length > 0) ||
        (unitPlan.differentiationByProcess && unitPlan.differentiationByProcess.length > 0) ||
        (unitPlan.differentiationByProduct && unitPlan.differentiationByProduct.length > 0)
    );
    
    const hasLearningExperiences = (isEnhanced || isFull) &&
        unitPlan.learningExperienceCards && unitPlan.learningExperienceCards.length > 0;
    
    if (!hasPriorKnowledge && !hasLearningExperiences) {
        return null;
    }
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-6 pb-2 border-b-2 border-blue-900">
                Content Planning & Knowledge
            </h2>

            {/* Prior Knowledge - shown in "current" and "custom" modes */}
            {(unitPlan.outputMapping === 'current' || unitPlan.outputMapping === 'custom') && (
                <>
                    {(
                        (unitPlan.priorKnowledgeSubjectSpecific && unitPlan.priorKnowledgeSubjectSpecific.length > 0) ||
                        (unitPlan.priorKnowledgeLearningSkills && unitPlan.priorKnowledgeLearningSkills.length > 0) ||
                        (unitPlan.topicsTerminology && unitPlan.topicsTerminology.length > 0) ||
                        (unitPlan.conceptualKnowledge && unitPlan.conceptualKnowledge.length > 0) ||
                        (unitPlan.proceduralKnowledge && unitPlan.proceduralKnowledge.length > 0)
                    ) && (
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-blue-800 mb-4">Prior Knowledge</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {unitPlan.priorKnowledgeSubjectSpecific && unitPlan.priorKnowledgeSubjectSpecific.length > 0 && (
                                    <div className="bg-surface-button p-4 rounded-lg border-l-4 border-blue-900">
                                        <div className="font-semibold text-blue-900 text-sm uppercase tracking-wide mb-2">Subject-Specific Prior Knowledge</div>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                                            {unitPlan.priorKnowledgeSubjectSpecific.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {unitPlan.priorKnowledgeLearningSkills && unitPlan.priorKnowledgeLearningSkills.length > 0 && (
                                    <div className="bg-surface-button p-4 rounded-lg border-l-4 border-blue-900">
                                        <div className="font-semibold text-blue-900 text-sm uppercase tracking-wide mb-2">Learning Skills Prior Knowledge</div>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                                            {unitPlan.priorKnowledgeLearningSkills.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {unitPlan.topicsTerminology && unitPlan.topicsTerminology.length > 0 && (
                                    <div className="bg-surface-button p-4 rounded-lg border-l-4 border-blue-900">
                                        <div className="font-semibold text-blue-900 text-sm uppercase tracking-wide mb-2">Topics/Terminology</div>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                                            {unitPlan.topicsTerminology.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {unitPlan.conceptualKnowledge && unitPlan.conceptualKnowledge.length > 0 && (
                                    <div className="bg-surface-button p-4 rounded-lg border-l-4 border-blue-900">
                                        <div className="font-semibold text-blue-900 text-sm uppercase tracking-wide mb-2">Conceptual Knowledge</div>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                                            {unitPlan.conceptualKnowledge.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {unitPlan.proceduralKnowledge && unitPlan.proceduralKnowledge.length > 0 && (
                                    <div className="bg-surface-button p-4 rounded-lg border-l-4 border-blue-900">
                                        <div className="font-semibold text-blue-900 text-sm uppercase tracking-wide mb-2">Procedural Knowledge</div>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                                            {unitPlan.proceduralKnowledge.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Formative Assessment */}
                    {(
                        (unitPlan.informalFormativeAssessment && unitPlan.informalFormativeAssessment.length > 0) ||
                        (unitPlan.formalFormativeAssessment && unitPlan.formalFormativeAssessment.length > 0)
                    ) && (
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-blue-800 mb-4">Formative Assessment</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {unitPlan.informalFormativeAssessment && unitPlan.informalFormativeAssessment.length > 0 && (
                                    <div className="bg-surface-button p-4 rounded-lg border-l-4 border-blue-900">
                                        <div className="font-semibold text-blue-900 text-sm uppercase tracking-wide mb-2">Informal Formative Assessment</div>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                                            {unitPlan.informalFormativeAssessment.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {unitPlan.formalFormativeAssessment && unitPlan.formalFormativeAssessment.length > 0 && (
                                    <div className="bg-surface-button p-4 rounded-lg border-l-4 border-blue-900">
                                        <div className="font-semibold text-blue-900 text-sm uppercase tracking-wide mb-2">Formal Formative Assessment</div>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                                            {unitPlan.formalFormativeAssessment.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Differentiation Strategies */}
                    {(
                        (unitPlan.differentiationByAccess && unitPlan.differentiationByAccess.length > 0) ||
                        (unitPlan.differentiationByProcess && unitPlan.differentiationByProcess.length > 0) ||
                        (unitPlan.differentiationByProduct && unitPlan.differentiationByProduct.length > 0)
                    ) && (
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-blue-800 mb-4">Differentiation Strategies</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {unitPlan.differentiationByAccess && unitPlan.differentiationByAccess.length > 0 && (
                                    <div className="bg-surface-button p-4 rounded-lg border-l-4 border-blue-900">
                                        <div className="font-semibold text-blue-900 text-sm uppercase tracking-wide mb-2">By Access</div>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                                            {unitPlan.differentiationByAccess.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {unitPlan.differentiationByProcess && unitPlan.differentiationByProcess.length > 0 && (
                                    <div className="bg-surface-button p-4 rounded-lg border-l-4 border-blue-900">
                                        <div className="font-semibold text-blue-900 text-sm uppercase tracking-wide mb-2">By Process</div>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                                            {unitPlan.differentiationByProcess.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {unitPlan.differentiationByProduct && unitPlan.differentiationByProduct.length > 0 && (
                                    <div className="bg-surface-button p-4 rounded-lg border-l-4 border-blue-900">
                                        <div className="font-semibold text-blue-900 text-sm uppercase tracking-wide mb-2">By Product</div>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                                            {unitPlan.differentiationByProduct.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Learning Experience Cards - shown in "enhanced" and "custom" modes */}
            {(unitPlan.outputMapping === 'enhanced' || unitPlan.outputMapping === 'custom') && 
             unitPlan.learningExperienceCards && unitPlan.learningExperienceCards.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-blue-800 mb-4">Learning Experience Cards</h3>
                    <div className="space-y-4">
                        {unitPlan.learningExperienceCards.map((card, index) => (
                            <div key={index} className="bg-surface-button p-4 rounded-lg border-l-4 border-blue-900">
                                <div className="font-semibold text-blue-900 mb-2">Learning Experience {index + 1}: {card.learningExperienceName || 'Not specified'}</div>
                                <div className="text-gray-700 space-y-2">
                                    <div><strong>Duration:</strong> Day(s) {card.learningExperienceDayRange || 'Not specified'} ({card.learningExperienceHoursCount || 'N/A'} hours)</div>
                                    <div><strong>Description:</strong> {card.learningExperienceDescription || 'Not specified'}</div>
                                    <div><strong>Formative Assessment:</strong> {card.learningExperienceFormativeAssessment || 'Not specified'}</div>
                                    {card.activities && card.activities.length > 0 && (
                                        <div>
                                            <strong>Activities:</strong>
                                            <div className="ml-4 mt-2 space-y-2">
                                                {card.activities.map((activity, actIdx) => (
                                                    <div key={actIdx} className="bg-white p-2 rounded border-l-2 border-blue-300">
                                                        <div className="font-semibold text-sm">{activity.activityName}</div>
                                                        <div className="text-sm">{activity.activityDescription}</div>
                                                        {activity.activityFormativeAssessmentTitle && (
                                                            <div className="text-xs italic text-gray-600 mt-1">
                                                                Assessment: {activity.activityFormativeAssessmentTitle}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PreviewContentPlanningSection;




