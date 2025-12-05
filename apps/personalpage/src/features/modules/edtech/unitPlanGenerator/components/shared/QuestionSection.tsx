import React from 'react';
import { UnitPlanData, QuestionType } from '../../types/UnitPlanTypes';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import QuestionManager from './QuestionManager';

interface QuestionSectionProps {
    unitPlan: UnitPlanData;
    addQuestion: (type: QuestionType) => void;
    updateQuestion: (type: QuestionType, index: number, value: string) => void;
    removeQuestion: (type: QuestionType, index: number) => void;
}

const QuestionSection: React.FC<QuestionSectionProps> = ({
    unitPlan,
    addQuestion,
    updateQuestion,
    removeQuestion
}) => {
    const { t } = useFallbackTranslation();

    return (
        <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
                {t('inquiry_questions')}
            </h3>
            <p className="text-sm text-text-secondary mb-6">
                {t('inquiry_questions_description')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <QuestionManager
                    title={t('factual_knowledge_questions')}
                    questions={unitPlan.factualQuestions}
                    onAdd={() => addQuestion('factualQuestions')}
                    onUpdate={(index, value) => updateQuestion('factualQuestions', index, value)}
                    onRemove={(index) => removeQuestion('factualQuestions', index)}
                    placeholder={t('factual_knowledge_placeholder')}
                    info={t('factual_knowledge_info')}
                    fieldName="factualQuestions"
                />
                
                <QuestionManager
                    title={t('conceptual_questions_title')}
                    questions={unitPlan.conceptualQuestions}
                    onAdd={() => addQuestion('conceptualQuestions')}
                    onUpdate={(index, value) => updateQuestion('conceptualQuestions', index, value)}
                    onRemove={(index) => removeQuestion('conceptualQuestions', index)}
                    placeholder={t('conceptual_questions_placeholder')}
                    info={t('conceptual_questions_info')}
                    fieldName="conceptualQuestions"
                />
                
                <QuestionManager
                    title={t('debatable_questions_title')}
                    questions={unitPlan.debatableQuestions}
                    onAdd={() => addQuestion('debatableQuestions')}
                    onUpdate={(index, value) => updateQuestion('debatableQuestions', index, value)}
                    onRemove={(index) => removeQuestion('debatableQuestions', index)}
                    placeholder={t('debatable_questions_placeholder')}
                    info={t('debatable_questions_info')}
                    fieldName="debatableQuestions"
                />
            </div>
        </div>
    );
};

export default QuestionSection;



