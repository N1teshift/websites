import React from 'react';
import { UnitPlanData, AssessmentTask } from '../../types/UnitPlanTypes';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import FormField from '../shared/FormField';
import MultiSelector from '../ui/MultiSelector';
import AssessmentTaskManager from '../shared/AssessmentTaskManager';
import { ALL_STRANDS } from '../../data/objectives';
import { getCommandTermsBySubject } from '../../data/commandTerms';

interface PlanningSectionProps {
    unitPlan: UnitPlanData;
    updateUnitPlan: (field: keyof UnitPlanData, value: string | string[] | number | AssessmentTask[]) => void;
    subject: string;
}

const PlanningSection: React.FC<PlanningSectionProps> = ({
    unitPlan,
    updateUnitPlan,
    subject
}) => {
    const { t } = useFallbackTranslation();
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
                {t('assessment_context_planning')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MultiSelector
                    label={t('objectives_strands')}
                    selectedItems={unitPlan.objectives}
                    onItemsChange={(items) => updateUnitPlan('objectives', items)}
                    options={ALL_STRANDS.map(strand => {
                        const localizedStrand = t(`strand.${strand.fullId}`) || strand.description;
                        return {
                            id: strand.fullId,
                            name: `${strand.objectiveId}-${strand.id}. ${localizedStrand}`,
                            description: localizedStrand
                        };
                    })}
                    required={true}
                    helpText={t('objectives_help_text')}
                    emptyStateMessage={t('objectives_empty_state')}
                    info={t('objectives_strands_info')}
                    fieldName="objectives"
                    showDetailedTooltips={true}
                />
                
                {unitPlan.outputMapping !== 'current' && (
                    <FormField
                        label={t('assessment_title')}
                        value={unitPlan.assessmentTitle}
                        onChange={(value) => updateUnitPlan('assessmentTitle', value)}
                        placeholder={t('assessment_title_placeholder')}
                        info={t('assessment_title_info')}
                        useContextAI={true}
                        fieldName="assessmentTitle"
                        unitPlanContext={unitPlan}
                    />
                )}
            </div>

            {unitPlan.outputMapping !== 'current' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        label={t('assessment_type')}
                        value={unitPlan.assessmentType}
                        onChange={(value) => updateUnitPlan('assessmentType', value)}
                        placeholder={t('assessment_type_placeholder')}
                        info={t('assessment_type_info')}
                        useContextAI={true}
                        fieldName="assessmentType"
                        unitPlanContext={unitPlan}
                    />
                </div>
            )}

            {/* Conditional Assessment Section based on Output Mapping */}
            {unitPlan.outputMapping === 'current' ? (
                // Current Mode: Task-Based Assessment System
                <AssessmentTaskManager
                    tasks={unitPlan.assessmentTasks}
                    onTasksChange={(tasks) => updateUnitPlan('assessmentTasks', tasks)}
                />
            ) : unitPlan.outputMapping === 'enhanced' ? (
                // Enhanced Mode: Single Summative Assessment Field
                <FormField
                    label={t('summative_assessment')}
                    value={unitPlan.summativeAssessment}
                    onChange={(value) => updateUnitPlan('summativeAssessment', value)}
                    type="textarea"
                    rows={3}
                    info={t('summative_assessment_info')}
                    required={true}
                    useContextAI={true}
                    fieldName="summativeAssessment"
                    unitPlanContext={unitPlan}
                />
            ) : (
                // Full Mode: Both Assessment Systems
                <>
                    <AssessmentTaskManager
                        tasks={unitPlan.assessmentTasks}
                        onTasksChange={(tasks) => updateUnitPlan('assessmentTasks', tasks)}
                    />
                    <FormField
                        label={t('summative_assessment')}
                        value={unitPlan.summativeAssessment}
                        onChange={(value) => updateUnitPlan('summativeAssessment', value)}
                        type="textarea"
                        rows={3}
                        info={t('summative_assessment_info')}
                        required={true}
                        useContextAI={true}
                        fieldName="summativeAssessment"
                        unitPlanContext={unitPlan}
                    />
                </>
            )}

            {/* Summative Assessment Relationship Field */}
            <FormField
                label={t('summative_assessment_relationship')}
                value={unitPlan.summativeAssessmentRelationshipDescription}
                onChange={(value) => updateUnitPlan('summativeAssessmentRelationshipDescription', value)}
                type="textarea"
                rows={3}
                info={t('summative_assessment_relationship_info')}
                placeholder={t('summative_assessment_relationship_placeholder')}
                required={true}
                useContextAI={true}
                fieldName="summativeAssessmentRelationshipDescription"
                unitPlanContext={unitPlan}
            />

            {unitPlan.outputMapping !== 'current' && (
                <MultiSelector
                    label={t('command_terms_title')}
                    selectedItems={unitPlan.commandTerms}
                    onItemsChange={(terms: string[]) => updateUnitPlan('commandTerms', terms)}
                    dataFetcher={(subject, t) => {
                        const availableTerms = getCommandTermsBySubject(subject, t);
                        return availableTerms.map(term => ({
                            id: term.id,
                            name: term.name,
                            description: term.definition
                        }));
                    }}
                    subject={subject}
                    helpText={t('command_terms_help')}
                    emptyStateMessage={t('no_items_selected')}
                    placeholder={t('command_terms_math_only')}
                    info={t('command_terms_info')}
                    fieldName="commandTerms"
                />
            )}

            {unitPlan.outputMapping !== 'current' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        label={t('individual_context')}
                        value={unitPlan.individualContext}
                        onChange={(value) => updateUnitPlan('individualContext', value)}
                        type="textarea"
                        rows={3}
                        info={t('individual_context_info')}
                        required={true}
                        useContextAI={true}
                        fieldName="individualContext"
                        unitPlanContext={unitPlan}
                    />
                    <FormField
                        label={t('local_context')}
                        value={unitPlan.localContext}
                        onChange={(value) => updateUnitPlan('localContext', value)}
                        type="textarea"
                        rows={3}
                        info={t('local_context_info')}
                        required={true}
                        useContextAI={true}
                        fieldName="localContext"
                        unitPlanContext={unitPlan}
                    />
                    <FormField
                        label={t('global_context')}
                        value={unitPlan.globalContextLens}
                        onChange={(value) => updateUnitPlan('globalContextLens', value)}
                        type="textarea"
                        rows={3}
                        info={t('global_context_lens_info')}
                        required={true}
                        useContextAI={true}
                        fieldName="globalContextLens"
                        unitPlanContext={unitPlan}
                    />
                </div>
            )}
        </div>
    );
};

export default PlanningSection;



