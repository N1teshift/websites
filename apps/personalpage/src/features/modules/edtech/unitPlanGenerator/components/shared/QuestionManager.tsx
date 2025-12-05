import React from 'react';
import { isFeatureEnabled } from '@/config/features';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import LabelWithInfo from './LabelWithInfo';
import { FiTrash2 } from 'react-icons/fi';
import IconButton from '@/features/infrastructure/shared/components/ui/IconButton';
import FieldCompletionIndicator from '../ui/FieldCompletionIndicator';
import { UnitPlanData } from '../../types/UnitPlanTypes';

interface QuestionManagerProps {
    title: string;
    questions: string[];
    onAdd: () => void;
    onUpdate: (index: number, value: string) => void;
    onRemove: (index: number) => void;
    placeholder?: string;
    addButtonText?: string;
    info?: string;
    fieldName?: keyof UnitPlanData;
}

const QuestionManager: React.FC<QuestionManagerProps> = ({
    title,
    questions,
    onAdd,
    onUpdate,
    onRemove,
    placeholder = "Enter question...",
    addButtonText,
    info,
    fieldName
}) => {
    const { t } = useFallbackTranslation();
    const defaultAddButtonText = t('add_question');

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                {info ? (
                    <LabelWithInfo 
                        label={title} 
                        info={info}
                        className="block text-sm font-medium text-text-primary"
                    />
                ) : (
                    <h5 className="text-md font-medium text-text-primary">
                        {title}
                    </h5>
                )}
                <button
                    type="button"
                    onClick={onAdd}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-brand"
                >
                    {addButtonText || defaultAddButtonText}
                </button>
            </div>
            
            <div className="space-y-2">
                {questions.map((question, index) => (
                    <div key={index} className="flex items-start space-x-2">
                        <textarea
                            value={question}
                            onChange={(e) => onUpdate(index, e.target.value)}
                            rows={2}
                            placeholder={placeholder}
                            className="flex-1 px-4 py-2.5 border-2 border-border-default rounded-xl bg-surface-card text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-light focus:border-brand hover:border-border-accent resize-y"
                        />
                        <IconButton
                            icon={<FiTrash2 size={16} />}
                            onClick={() => onRemove(index)}
                            color="red"
                            size="medium"
                            title={t('remove')}
                        />
                    </div>
                ))}
            </div>
            
            {/* Field completion indicator */}
            {fieldName && isFeatureEnabled('fieldCompletion') && (
                <FieldCompletionIndicator
                    fieldName={fieldName}
                    value={questions}
                />
            )}
        </div>
    );
};

export default QuestionManager;



