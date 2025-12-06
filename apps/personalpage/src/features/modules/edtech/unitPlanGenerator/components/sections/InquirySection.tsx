import React from 'react';
import { UnitPlanData, QuestionType, Subject } from '../../types/UnitPlanTypes';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import FormField from '../shared/FormField';
import ConceptSelector from '../shared/ConceptSelector';
import QuestionSection from '../shared/QuestionSection';
import GlobalContextInfo from '../shared/GlobalContextInfo';
import LabelWithInfo from '../shared/LabelWithInfo';
import { Dropdown } from '@websites/ui';

interface InquirySectionProps {
    unitPlan: UnitPlanData;
    updateUnitPlan: (field: keyof UnitPlanData, value: string | string[]) => void;
    addQuestion: (type: QuestionType) => void;
    updateQuestion: (type: QuestionType, index: number, value: string) => void;
    removeQuestion: (type: QuestionType, index: number) => void;
    subjects: Subject[];
}

const InquirySection: React.FC<InquirySectionProps> = ({
    unitPlan,
    updateUnitPlan,
    addQuestion,
    updateQuestion,
    removeQuestion,
    subjects
}) => {
    const { t } = useFallbackTranslation();

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-border-default">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center shadow-medium">
                    <span className="text-white text-xl font-bold">🔍</span>
                </div>
                <h2 className="text-3xl font-bold text-text-primary">
                    {t('inquiry_establishing_purpose')}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ConceptSelector
                    selectedConcepts={unitPlan.specifiedConcepts}
                    onConceptsChange={(concepts) => updateUnitPlan('specifiedConcepts', concepts)}
                    selectedKeyConcepts={unitPlan.keyConcepts}
                    onKeyConceptsChange={(concepts) => updateUnitPlan('keyConcepts', concepts)}
                    selectedRelatedConcepts={unitPlan.relatedConcepts}
                    onRelatedConceptsChange={(concepts) => updateUnitPlan('relatedConcepts', concepts)}
                    subject={unitPlan.subject}
                    subjects={subjects}
                    conceptMode={unitPlan.outputMapping}
                />

                {unitPlan.outputMapping !== 'current' && (
                    <FormField
                        label={t('conceptual_understandings')}
                        value={unitPlan.conceptualUnderstandings}
                        onChange={(value) => updateUnitPlan('conceptualUnderstandings', value)}
                        type="textarea"
                        rows={3}
                        placeholder={t('conceptual_understandings_placeholder')}
                        info={t('conceptual_understandings_info')}
                        useContextAI={true}
                        fieldName="conceptualUnderstandings"
                        unitPlanContext={unitPlan}
                    />
                )}

                <div>
                    <LabelWithInfo
                        label={t('enhanced_global_context')}
                        info={t('enhanced_global_context_info')}
                        required
                    />
                    <div className="mt-2">
                        <Dropdown
                            label=""
                            value={unitPlan.globalContext || ''}
                            onChange={(value) => updateUnitPlan('globalContext', value)}
                            options={[
                                { label: 'select_global_context', value: '' },
                                { label: 'identities_and_relationships', value: 'Identities and Relationships' },
                                { label: 'orientation_in_space_and_time', value: 'Orientation in Space and Time' },
                                { label: 'personal_and_cultural_expression', value: 'Personal and Cultural Expression' },
                                { label: 'scientific_and_technical_innovation', value: 'Scientific and Technical Innovation' },
                                { label: 'globalization_and_sustainability', value: 'Globalization and Sustainability' },
                                { label: 'fairness_and_development', value: 'Fairness and Development' },
                            ]}
                        />
                    </div>

                    <GlobalContextInfo globalContext={unitPlan.globalContext} />
                </div>
            </div>

            <FormField
                label={t('global_context_explanation')}
                value={unitPlan.globalContextExplanation}
                onChange={(value) => updateUnitPlan('globalContextExplanation', value)}
                type="textarea"
                rows={3}
                placeholder={t('global_context_explanation_placeholder')}
                info={t('global_context_explanation_info')}
                useContextAI={true}
                fieldName="globalContextExplanation"
                unitPlanContext={unitPlan}
            />

            <FormField
                label={unitPlan.outputMapping === 'current' ? 'Statement of inquiry' : t('inquiry_statement')}
                value={unitPlan.inquiryStatement}
                onChange={(value) => updateUnitPlan('inquiryStatement', value)}
                type="textarea"
                rows={2}
                placeholder={t('inquiry_statement_placeholder')}
                info={t('inquiry_statement_info')}
                useContextAI={true}
                fieldName="inquiryStatement"
                unitPlanContext={unitPlan}
            />

            {/* Questions Section */}
            <QuestionSection
                unitPlan={unitPlan}
                addQuestion={addQuestion}
                updateQuestion={updateQuestion}
                removeQuestion={removeQuestion}
            />
        </div>
    );
};

export default InquirySection;



