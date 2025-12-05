import React from 'react';
import { UnitPlanData } from '../../../types/UnitPlanTypes';
import { previewStyles } from './previewTheme';

interface PreviewActionSectionProps {
    unitPlan: UnitPlanData;
}

const PreviewActionSection: React.FC<PreviewActionSectionProps> = ({ unitPlan }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2" style={previewStyles.sectionTitle}>
                Action: Teaching and Learning through Inquiry
            </h2>
            
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow-sm">
                    <thead>
                        <tr style={previewStyles.tableHeader}>
                            <th className="px-4 py-3 text-center text-sm font-semibold">Subunit</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Content</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Success Criteria</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Activities</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Learning Experiences</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Differentiation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {unitPlan.subunits.map((subunit, index) => {
                            const hasPriorKnowledge = 
                                (subunit.priorKnowledgeSubjectSpecific && subunit.priorKnowledgeSubjectSpecific.length > 0) ||
                                (subunit.priorKnowledgeLearningSkills && subunit.priorKnowledgeLearningSkills.length > 0);
                            
                            const hasNewKnowledge = 
                                (subunit.topicsTerminology && subunit.topicsTerminology.length > 0) ||
                                (subunit.conceptualKnowledge && subunit.conceptualKnowledge.length > 0) ||
                                (subunit.proceduralKnowledge && subunit.proceduralKnowledge.length > 0);
                            
                            // Split subunit name into words for multi-line display
                            const subunitWords = subunit.subunitName ? subunit.subunitName.split(' ') : [];
                            const lessonText = subunit.lessonsPerSubunit === 1 ? '1 lesson' : `${subunit.lessonsPerSubunit} lessons`;
                            
                            return (
                                <React.Fragment key={index}>
                                    <tr style={index % 2 === 0 ? previewStyles.tableRowEven : previewStyles.tableRowOdd}>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex flex-col items-center text-sm font-semibold" style={{color: previewStyles.badge.backgroundColor}}>
                                                {subunitWords.map((word, wordIdx) => (
                                                    <div key={wordIdx}>{word}</div>
                                                ))}
                                                <div className="text-white px-3 py-1 rounded-full text-xs font-semibold mt-2" style={previewStyles.badge}>
                                                    {lessonText}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{subunit.content || 'No content specified'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {subunit.successCriteria && subunit.successCriteria.length > 0 ? (
                                                <ul className="list-disc list-inside space-y-1">
                                                    {subunit.successCriteria.map((sc, scIdx) => (
                                                        <li key={scIdx}>{sc}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                'No success criteria specified'
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{subunit.activities || 'No activities specified'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{subunit.learningExperiences || 'No learning experiences specified'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{subunit.differentiation || 'No differentiation specified'}</td>
                                    </tr>
                                    
                                    {/* Knowledge Row */}
                                    {(hasPriorKnowledge || hasNewKnowledge) && (
                                        <tr style={previewStyles.knowledgeRowBg}>
                                            <td colSpan={6} className="px-4 py-5">
                                                <div className="space-y-4">
                                                    {/* Prior Knowledge */}
                                                    {hasPriorKnowledge && (
                                                        <div className="p-4 rounded-lg border-l-4" style={previewStyles.knowledgeBlock}>
                                                            <h4 className="font-semibold mb-3 text-base" style={previewStyles.subheading}>Prior Knowledge</h4>
                                                            
                                                            {subunit.priorKnowledgeSubjectSpecific && subunit.priorKnowledgeSubjectSpecific.length > 0 && (
                                                                <div className="mb-3">
                                                                    <strong className="block mb-1 text-sm" style={previewStyles.fieldLabel}>Subject-Specific:</strong>
                                                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                                                                        {subunit.priorKnowledgeSubjectSpecific.map((item, idx) => (
                                                                            <li key={idx}>{item}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            
                                                            {subunit.priorKnowledgeLearningSkills && subunit.priorKnowledgeLearningSkills.length > 0 && (
                                                                <div>
                                                                    <strong className="block mb-1 text-sm" style={previewStyles.fieldLabel}>Learning Skills:</strong>
                                                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                                                                        {subunit.priorKnowledgeLearningSkills.map((item, idx) => (
                                                                            <li key={idx}>{item}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    {/* New Knowledge */}
                                                    {hasNewKnowledge && (
                                                        <div className="p-4 rounded-lg border-l-4" style={previewStyles.knowledgeBlock}>
                                                            <h4 className="font-semibold mb-3 text-base" style={previewStyles.subheading}>New Knowledge</h4>
                                                            
                                                            {subunit.topicsTerminology && subunit.topicsTerminology.length > 0 && (
                                                                <div className="mb-3">
                                                                    <strong className="block mb-1 text-sm" style={previewStyles.fieldLabel}>Topics/Terminology:</strong>
                                                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                                                                        {subunit.topicsTerminology.map((item, idx) => (
                                                                            <li key={idx}>{item}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            
                                                            {subunit.conceptualKnowledge && subunit.conceptualKnowledge.length > 0 && (
                                                                <div className="mb-3">
                                                                    <strong className="block mb-1 text-sm" style={previewStyles.fieldLabel}>Conceptual Knowledge:</strong>
                                                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                                                                        {subunit.conceptualKnowledge.map((item, idx) => (
                                                                            <li key={idx}>{item}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            
                                                            {subunit.proceduralKnowledge && subunit.proceduralKnowledge.length > 0 && (
                                                                <div>
                                                                    <strong className="block mb-1 text-sm" style={previewStyles.fieldLabel}>Procedural Knowledge:</strong>
                                                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                                                                        {subunit.proceduralKnowledge.map((item, idx) => (
                                                                            <li key={idx}>{item}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PreviewActionSection;



