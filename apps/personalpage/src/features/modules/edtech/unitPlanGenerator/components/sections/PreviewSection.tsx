import React from 'react';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import { UnitPlanData } from '../../types/UnitPlanTypes';
import PreviewHeader from './preview/PreviewHeader';
import PreviewInquirySection from './preview/PreviewInquirySection';
import PreviewAssessmentSection from './preview/PreviewAssessmentSection';
import PreviewATLSection from './preview/PreviewATLSection';
import PreviewActionSection from './preview/PreviewActionSection';
import PreviewResourcesSection from './preview/PreviewResourcesSection';
import PreviewCommunitySection from './preview/PreviewCommunitySection';
import PreviewReflectionSection from './preview/PreviewReflectionSection';

interface PreviewSectionProps {
    unitPlan: UnitPlanData;
}

const PreviewSection: React.FC<PreviewSectionProps> = React.memo(({ unitPlan }) => {
    const { t } = useFallbackTranslation();
    
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-text-primary">{t('unit_plan_preview_title')}</h2>
            </div>

            <div className="max-w-6xl mx-auto bg-surface-card rounded-lg shadow-lg overflow-hidden">
                <PreviewHeader unitPlan={unitPlan} />

                <div className="p-8 space-y-8">
                    <PreviewInquirySection unitPlan={unitPlan} />
                    <PreviewAssessmentSection unitPlan={unitPlan} />
                    <PreviewATLSection unitPlan={unitPlan} />
                    <PreviewActionSection unitPlan={unitPlan} />
                    <PreviewResourcesSection unitPlan={unitPlan} />
                    <PreviewCommunitySection unitPlan={unitPlan} />
                    <PreviewReflectionSection unitPlan={unitPlan} />
                </div>
            </div>
        </div>
    );
});

PreviewSection.displayName = 'PreviewSection';

export default PreviewSection;



