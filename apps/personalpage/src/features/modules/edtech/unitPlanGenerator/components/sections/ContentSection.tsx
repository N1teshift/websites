import React from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";
import {
  UnitPlanData,
  SubunitData,
  AssessmentTask,
  ATLCard,
  ActivityCard,
  LearningExperienceCard,
  CurriculumConnection,
} from "../../types/UnitPlanTypes";
import CurriculumLinksSection from "./content/CurriculumLinksSection";
import EnhancedContentSection from "./content/EnhancedContentSection";
import CurrentContentSection from "./content/CurrentContentSection";

type UpdateUnitPlanFn = (
  field: keyof UnitPlanData,
  value:
    | string
    | string[]
    | number
    | SubunitData[]
    | AssessmentTask[]
    | ATLCard[]
    | ActivityCard[]
    | LearningExperienceCard[]
    | CurriculumConnection[]
    | undefined
) => void;
type UpdateSubunitFn = (
  subunitIndex: number,
  field: keyof SubunitData,
  value: string | number | string[]
) => void;

interface ContentSectionProps {
  unitPlan: UnitPlanData;
  updateUnitPlan: UpdateUnitPlanFn;
  updateSubunit: UpdateSubunitFn;
  addSubunit: () => void;
  removeSubunit: (subunitIndex: number) => void;
}

const ContentSection: React.FC<ContentSectionProps> = ({
  unitPlan,
  updateUnitPlan,
  updateSubunit,
  addSubunit,
  removeSubunit,
}) => {
  const { t } = useFallbackTranslation();

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 pb-4 border-b-2 border-border-default">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center shadow-medium">
          <span className="text-white text-xl font-bold">📚</span>
        </div>
        <h2 className="text-3xl font-bold text-text-primary">{t("content")}</h2>
      </div>

      <CurriculumLinksSection mypYear={unitPlan.mypYear} />

      {unitPlan.outputMapping !== "current" && (
        <EnhancedContentSection
          unitPlan={unitPlan}
          updateUnitPlan={updateUnitPlan}
          updateSubunit={updateSubunit}
          addSubunit={addSubunit}
          removeSubunit={removeSubunit}
        />
      )}

      {unitPlan.outputMapping === "current" && (
        <CurrentContentSection unitPlan={unitPlan} updateUnitPlan={updateUnitPlan} />
      )}
    </div>
  );
};

export default ContentSection;
