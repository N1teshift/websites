import React from "react";
import { UnitPlanData, SubunitData } from "../../types/UnitPlanTypes";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";

interface SummativeAssessmentSectionProps {
  unitPlan: UnitPlanData;
  updateUnitPlan: (
    field: keyof UnitPlanData,
    value: string | string[] | number | SubunitData[]
  ) => void;
}

const SummativeAssessmentSection: React.FC<SummativeAssessmentSectionProps> = ({
  unitPlan: _unitPlan,
  updateUnitPlan: _updateUnitPlan,
}) => {
  const { t } = useFallbackTranslation();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-surface-card rounded-2xl shadow-soft border-2 border-border-default p-8 hover:shadow-medium transition-shadow">
        <div className="flex items-center gap-3 pb-4 border-b-2 border-border-default mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning-500 to-warning-600 flex items-center justify-center shadow-medium">
            <span className="text-white text-xl font-bold">📝</span>
          </div>
          <h2 className="text-3xl font-bold text-text-primary">{t("summative_assessment")}</h2>
        </div>
        <p className="text-text-secondary text-base mb-6">
          {t("summative_assessment_description")}
        </p>

        {/* This section can be expanded later with assessment-specific tools */}
        <div className="mt-6 p-5 bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 rounded-xl shadow-soft">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <p className="text-sm font-medium text-primary-900">
              This section is currently being developed and will include tools for managing
              summative assessments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummativeAssessmentSection;
