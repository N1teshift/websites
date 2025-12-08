import React from "react";
import { UnitPlanData, SubunitData } from "../../types/UnitPlanTypes";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";
import FormField from "../shared/FormField";

interface CommunityEngagementSectionProps {
  unitPlan: UnitPlanData;
  updateUnitPlan: (
    field: keyof UnitPlanData,
    value: string | string[] | number | SubunitData[]
  ) => void;
}

const CommunityEngagementSection: React.FC<CommunityEngagementSectionProps> = ({
  unitPlan,
  updateUnitPlan,
}) => {
  const { t } = useFallbackTranslation();
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-3 pb-4 border-b-2 border-border-default mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center shadow-medium">
            <span className="text-white text-xl font-bold">🤝</span>
          </div>
          <h2 className="text-3xl font-bold text-text-primary">{t("community_engagement")}</h2>
        </div>
        <p className="text-text-secondary text-base bg-surface-button border-l-4 border-success-500 p-4 rounded-r-xl">
          {t("community_engagement_description")}
        </p>
      </div>

      <FormField
        label={t("community_engagement_activities")}
        value={unitPlan.communityEngagement}
        onChange={(value) => updateUnitPlan("communityEngagement", value)}
        type="textarea"
        rows={12}
        placeholder={t("community_engagement_placeholder")}
        info={t("community_engagement_activities_info")}
        required={true}
        useContextAI={true}
        fieldName="communityEngagement"
        unitPlanContext={unitPlan}
      />
    </div>
  );
};

export default CommunityEngagementSection;
