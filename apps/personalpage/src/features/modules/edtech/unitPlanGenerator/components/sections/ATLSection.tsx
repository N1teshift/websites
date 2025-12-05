import React from 'react';
import { UnitPlanData, SubunitData, ATLCard } from '../../types/UnitPlanTypes';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import FormField from '../shared/FormField';
import MultiSelector from '../ui/MultiSelector';
import ATLCardManager from '../shared/ATLCardManager';
import { getATLSkillsBySubject } from '../../data/atlSkills';

interface ATLSectionProps {
    unitPlan: UnitPlanData;
    updateUnitPlan: (field: keyof UnitPlanData, value: string | string[] | number | SubunitData[] | ATLCard[]) => void;
    subject: string;
}

const ATLSection: React.FC<ATLSectionProps> = ({
    unitPlan,
    updateUnitPlan,
    subject
}) => {
    const { t } = useFallbackTranslation();
    
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-border-default">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-medium">
                    <span className="text-white text-xl font-bold">🎯</span>
                </div>
                <h2 className="text-3xl font-bold text-text-primary">
                    {t('atl_skills_strategies')}
                </h2>
            </div>
            
            {unitPlan.outputMapping === 'current' ? (
                // Current mode - ATL card manager (kept last if other elements exist)
                <ATLCardManager
                    cards={Array.isArray(unitPlan.atlCards) ? unitPlan.atlCards : []}
                    onCardsChange={(cards) => updateUnitPlan('atlCards', cards)}
                />
            ) : unitPlan.outputMapping === 'enhanced' ? (
                // Enhanced mode - current ATL skills selector
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MultiSelector
                            label={t('atl_skills_title')}
                            selectedItems={unitPlan.atlSkills}
                            onItemsChange={(skills: string[]) => updateUnitPlan('atlSkills', skills)}
                            dataFetcher={(subject, t) => {
                                const availableSkills = getATLSkillsBySubject(subject);
                                return availableSkills.map(skill => {
                                    const category = t(`atl_category.${skill.category}`) || skill.category;
                                    const subcategory = skill.subcategory ? (t(`atl_subcategory.${skill.subcategory}`) || skill.subcategory) : null;
                                    const skillName = t(`atl_skill.${skill.id}`) || skill.name;
                                    return {
                                        id: skill.id,
                                        name: subcategory ? `${category} – ${subcategory}: ${skillName}` : `${category} – ${skillName}`
                                    };
                                });
                            }}
                            subject={subject}
                            helpText={t('atl_skills_help')}
                            emptyStateMessage={t('no_atl_skills_selected')}
                            placeholder={t('atl_skills_math_only')}
                            info={t('atl_skills_info')}
                            fieldName="atlSkills"
                        />
                        <FormField
                            label={t('atl_strategies')}
                            value={unitPlan.atlStrategies}
                            onChange={(value) => updateUnitPlan('atlStrategies', value)}
                            type="textarea"
                            rows={4}
                            info={t('atl_strategies_info')}
                            required={true}
                            useContextAI={true}
                            fieldName="atlStrategies"
                            unitPlanContext={unitPlan}
                        />
                    </div>
                    <ATLCardManager
                        cards={Array.isArray(unitPlan.atlCards) ? unitPlan.atlCards : []}
                        onCardsChange={(cards) => updateUnitPlan('atlCards', cards)}
                    />
                </>
            ) : (
                // Full mode - Both ATL systems (selector + strategies first, cards last)
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MultiSelector
                            label={t('atl_skills_title')}
                            selectedItems={unitPlan.atlSkills}
                            onItemsChange={(skills: string[]) => updateUnitPlan('atlSkills', skills)}
                            dataFetcher={(subject, t) => {
                                const availableSkills = getATLSkillsBySubject(subject);
                                return availableSkills.map(skill => {
                                    const category = t(`atl_category.${skill.category}`) || skill.category;
                                    const subcategory = skill.subcategory ? (t(`atl_subcategory.${skill.subcategory}`) || skill.subcategory) : null;
                                    const skillName = t(`atl_skill.${skill.id}`) || skill.name;
                                    return {
                                        id: skill.id,
                                        name: subcategory ? `${category} – ${subcategory}: ${skillName}` : `${category} – ${skillName}`
                                    };
                                });
                            }}
                            subject={subject}
                            helpText={t('atl_skills_help')}
                            emptyStateMessage={t('no_atl_skills_selected')}
                            placeholder={t('atl_skills_math_only')}
                            info={t('atl_skills_info')}
                            fieldName="atlSkills"
                        />
                        <FormField
                            label={t('atl_strategies')}
                            value={unitPlan.atlStrategies}
                            onChange={(value) => updateUnitPlan('atlStrategies', value)}
                            type="textarea"
                            rows={4}
                            info={t('atl_strategies_info')}
                            required={true}
                            useContextAI={true}
                            fieldName="atlStrategies"
                            unitPlanContext={unitPlan}
                        />
                    </div>
                    <ATLCardManager
                        cards={Array.isArray(unitPlan.atlCards) ? unitPlan.atlCards : []}
                        onCardsChange={(cards) => updateUnitPlan('atlCards', cards)}
                    />
                </>
            )}
        </div>
    );
};

export default ATLSection;



