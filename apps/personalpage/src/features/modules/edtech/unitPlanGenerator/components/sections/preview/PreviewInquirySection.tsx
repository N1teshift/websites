import React from 'react';
import { UnitPlanData } from '../../../types/UnitPlanTypes';
import { previewStyles } from './previewTheme';

interface PreviewInquirySectionProps {
    unitPlan: UnitPlanData;
}

const PreviewInquirySection: React.FC<PreviewInquirySectionProps> = ({ unitPlan }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2" style={previewStyles.sectionTitle}>
                Inquiry: Establishing the purpose of the unit
            </h2>
            
            <div className="space-y-4 mb-6">
                {/* Unit Content - Enhanced and Custom modes */}
                {unitPlan.outputMapping !== 'current' && unitPlan.unitContent && (
                    <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
                        <div className="font-semibold text-sm uppercase tracking-wide mb-2" style={previewStyles.fieldLabel}>Unit Content</div>
                        <div className="text-text-secondary">{unitPlan.unitContent}</div>
                    </div>
                )}
                
                <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
                    <div className="font-semibold text-sm uppercase tracking-wide mb-2" style={previewStyles.fieldLabel}>Specified Concept(s)</div>
                    <div className="text-text-secondary">{unitPlan.specifiedConcepts.join(', ') || 'No concepts specified'}</div>
                </div>
                
                <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
                    <div className="font-semibold text-sm uppercase tracking-wide mb-2" style={previewStyles.fieldLabel}>Conceptual Understandings</div>
                    <div className="text-text-secondary">{unitPlan.conceptualUnderstandings || 'No conceptual understandings specified'}</div>
                </div>
                
                <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
                    <div className="font-semibold text-sm uppercase tracking-wide mb-2" style={previewStyles.fieldLabel}>Enhanced Global Context</div>
                    <div className="text-text-secondary">{unitPlan.globalContext || 'No global context specified'}</div>
                </div>
                
                <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
                    <div className="font-semibold text-sm uppercase tracking-wide mb-2" style={previewStyles.fieldLabel}>Global Context Explanation</div>
                    <div className="text-text-secondary">{unitPlan.globalContextExplanation || 'No explanation provided'}</div>
                </div>
                
                <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
                    <div className="font-semibold text-sm uppercase tracking-wide mb-2" style={previewStyles.fieldLabel}>Inquiry Statement/Question</div>
                    <div className="text-text-secondary">{unitPlan.inquiryStatement || 'No inquiry statement provided'}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border-l-4" style={previewStyles.secondaryBlock}>
                    <h4 className="font-semibold mb-3" style={previewStyles.fieldLabel}>Factual Questions</h4>
                    <div className="text-sm text-text-secondary">
                        {unitPlan.factualQuestions.length > 0 ? (
                            <ul className="space-y-1">
                                {unitPlan.factualQuestions.map((q, i) => (
                                    <li key={i} className="flex items-start">
                                        <span className="mr-2" style={previewStyles.bulletColor}>•</span>
                                        <span>{q}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <span className="text-gray-500 italic">No factual questions specified</span>
                        )}
                    </div>
                </div>
                <div className="p-4 rounded-lg border-l-4" style={previewStyles.secondaryBlock}>
                    <h4 className="font-semibold mb-3" style={previewStyles.fieldLabel}>Conceptual Questions</h4>
                    <div className="text-sm text-text-secondary">
                        {unitPlan.conceptualQuestions.length > 0 ? (
                            <ul className="space-y-1">
                                {unitPlan.conceptualQuestions.map((q, i) => (
                                    <li key={i} className="flex items-start">
                                        <span className="mr-2" style={previewStyles.bulletColor}>•</span>
                                        <span>{q}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <span className="text-gray-500 italic">No conceptual questions specified</span>
                        )}
                    </div>
                </div>
                <div className="p-4 rounded-lg border-l-4" style={previewStyles.secondaryBlock}>
                    <h4 className="font-semibold mb-3" style={previewStyles.fieldLabel}>Debatable Questions</h4>
                    <div className="text-sm text-text-secondary">
                        {unitPlan.debatableQuestions.length > 0 ? (
                            <ul className="space-y-1">
                                {unitPlan.debatableQuestions.map((q, i) => (
                                    <li key={i} className="flex items-start">
                                        <span className="mr-2" style={previewStyles.bulletColor}>•</span>
                                        <span>{q}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <span className="text-gray-500 italic">No debatable questions specified</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreviewInquirySection;




