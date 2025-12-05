import React from 'react';
import { UnitPlanData, SubunitData } from '../../types/UnitPlanTypes';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import FormField from '../shared/FormField';

interface ReflectionSectionProps {
    unitPlan: UnitPlanData;
    updateUnitPlan: (field: keyof UnitPlanData, value: string | string[] | number | SubunitData[]) => void;
}

const ReflectionSection: React.FC<ReflectionSectionProps> = ({
    unitPlan,
    updateUnitPlan
}) => {
    const { t } = useFallbackTranslation();
    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <div className="flex items-center gap-3 pb-4 border-b-2 border-border-default mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center shadow-medium">
                        <span className="text-white text-xl font-bold">💭</span>
                    </div>
                    <h2 className="text-3xl font-bold text-text-primary">
                        {t('reflection')}: {t('reflection_subtitle')}
                    </h2>
                </div>
                <p className="text-text-secondary text-base bg-surface-button border-l-4 border-secondary-500 p-4 rounded-r-xl">
                    {t('reflection_description')}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <FormField
                    label={t('reflection_prior_to_teaching')}
                    value={unitPlan.reflectionPriorToTeaching}
                    onChange={(value) => updateUnitPlan('reflectionPriorToTeaching', value)}
                    type="textarea"
                    rows={6}
                    placeholder={t('reflection_prior_to_teaching_placeholder')}
                    info={t('reflection_prior_to_teaching_info')}
                    required={true}
                    useContextAI={true}
                    fieldName="reflectionPriorToTeaching"
                    unitPlanContext={unitPlan}
                />

                <FormField
                    label={t('reflection_during_teaching')}
                    value={unitPlan.reflectionDuringTeaching}
                    onChange={(value) => updateUnitPlan('reflectionDuringTeaching', value)}
                    type="textarea"
                    rows={6}
                    placeholder={t('reflection_during_teaching_placeholder')}
                    info={t('reflection_during_teaching_info')}
                    required={true}
                    useContextAI={true}
                    fieldName="reflectionDuringTeaching"
                    unitPlanContext={unitPlan}
                />

                <FormField
                    label={t('reflection_after_teaching')}
                    value={unitPlan.reflectionAfterTeaching}
                    onChange={(value) => updateUnitPlan('reflectionAfterTeaching', value)}
                    type="textarea"
                    rows={6}
                    placeholder={t('reflection_after_teaching_placeholder')}
                    info={t('reflection_after_teaching_info')}
                    required={true}
                    useContextAI={true}
                    fieldName="reflectionAfterTeaching"
                    unitPlanContext={unitPlan}
                />

                <FormField
                    label={t('reflection_future_planning')}
                    value={unitPlan.reflectionFuturePlanning}
                    onChange={(value) => updateUnitPlan('reflectionFuturePlanning', value)}
                    type="textarea"
                    rows={6}
                    placeholder={t('reflection_future_planning_placeholder')}
                    info={t('reflection_future_planning_info')}
                    required={true}
                    useContextAI={true}
                    fieldName="reflectionFuturePlanning"
                    unitPlanContext={unitPlan}
                />
            </div>
        </div>
    );
};

export default ReflectionSection;



