import React from 'react';
import { UnitPlanData } from '../../../types/UnitPlanTypes';
import { previewStyles } from './previewTheme';

interface PreviewCommunitySectionProps {
    unitPlan: UnitPlanData;
}

const PreviewCommunitySection: React.FC<PreviewCommunitySectionProps> = ({ unitPlan }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2" style={previewStyles.sectionTitle}>
                Community Engagement
            </h2>
            <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
                <div className="text-gray-700">
                    {unitPlan.communityEngagement || (
                        <span className="text-gray-500 italic">No community engagement activities specified</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PreviewCommunitySection;



