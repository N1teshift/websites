import React from 'react';
import { Subject } from '../../types/UnitPlanTypes';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import MultiSelector from '../ui/MultiSelector';
import { getTranslatedSubjectName } from '../../utils/subjectTranslationUtils';

interface ConceptSelectorProps {
    selectedConcepts: string[];
    onConceptsChange: (concepts: string[]) => void;
    selectedKeyConcepts?: string[];
    onKeyConceptsChange?: (concepts: string[]) => void;
    selectedRelatedConcepts?: string[];
    onRelatedConceptsChange?: (concepts: string[]) => void;
    subject: string;
    subjects: Subject[];
    conceptMode: 'current' | 'enhanced' | 'custom';
}

const ConceptSelector: React.FC<ConceptSelectorProps> = ({
    selectedConcepts,
    onConceptsChange,
    selectedKeyConcepts = [],
    onKeyConceptsChange,
    selectedRelatedConcepts = [],
    onRelatedConceptsChange,
    subject,
    subjects,
    conceptMode
}) => {
    const { t } = useFallbackTranslation();
    
    const currentSubject = subjects.find(s => s.id === subject);
    const availableConcepts = currentSubject?.specifiedConcepts || [];
    const availableKeyConcepts = currentSubject?.keyConcepts || [];
    const availableRelatedConcepts = currentSubject?.relatedConcepts || [];

    const conceptOptions = availableConcepts.map(concept => ({
        id: concept,
        name: t(`concepts.${concept}`, concept),
        description: t(`concept_definitions.${concept}`, '')
    }));

    const keyConceptOptions = availableKeyConcepts.map(concept => ({
        id: concept,
        name: t(`concepts.${concept}`, concept),
        description: t(`concept_definitions.${concept}`, '')
    }));

    const relatedConceptOptions = availableRelatedConcepts.map(concept => ({
        id: concept,
        name: t(`concepts.${concept}`, concept),
        description: t(`concept_definitions.${concept}`, '')
    }));

    // When switching to enhanced or full mode, combine key and related concepts into specified concepts
    // Only run this when mode changes, not when concepts are selected
    React.useEffect(() => {
        if ((conceptMode === 'enhanced' || conceptMode === 'custom') && onConceptsChange) {
            const combinedConcepts = [...selectedKeyConcepts, ...selectedRelatedConcepts];
            
            // Only combine on initial mount or mode change if there are key/related concepts to combine
            if (combinedConcepts.length > 0 && selectedConcepts.length === 0) {
                onConceptsChange(combinedConcepts);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conceptMode]);

    return (
        <div className="space-y-4">
            {/* Concept Selectors */}
            {conceptMode === 'current' ? (
                // Current Mode: Separate Key Concepts and Related Concepts
                <div className="space-y-4">
                    <MultiSelector
                        label="Key Concepts"
                        selectedItems={selectedKeyConcepts}
                        onItemsChange={onKeyConceptsChange || (() => {})}
                        options={keyConceptOptions}
                        required={true}
                        helpText={subject ? t('select_key_concepts_for_subject').replace('{subject}', getTranslatedSubjectName(subject, t)) : undefined}
                        emptyStateMessage={t('no_key_concepts_selected')}
                        placeholder={t('select_subject_first')}
                        info="Key concepts are the fundamental, cross-cutting concepts that are essential to this subject."
                    />
                    
                    <MultiSelector
                        label="Related Concepts"
                        selectedItems={selectedRelatedConcepts}
                        onItemsChange={onRelatedConceptsChange || (() => {})}
                        options={relatedConceptOptions}
                        required={false}
                        helpText={subject ? t('select_related_concepts_for_subject').replace('{subject}', getTranslatedSubjectName(subject, t)) : undefined}
                        emptyStateMessage={t('no_related_concepts_selected')}
                        placeholder={t('select_subject_first')}
                        info="Related concepts are more specific concepts that support and expand upon the key concepts."
                    />
                </div>
            ) : (
                // Enhanced & Full Mode: Single Specified Concepts Selector
                <MultiSelector
                    label={t('specified_concepts_title')}
                    selectedItems={selectedConcepts}
                    onItemsChange={onConceptsChange}
                    options={conceptOptions}
                    required={true}
                    helpText={subject ? t('select_key_concepts_for_subject').replace('{subject}', getTranslatedSubjectName(subject, t)) : undefined}
                    emptyStateMessage={t('no_concepts_selected')}
                    placeholder={t('select_subject_first')}
                    info={t('specified_concepts_info')}
                    fieldName="specifiedConcepts"
                />
            )}
        </div>
    );
};

export default ConceptSelector;



