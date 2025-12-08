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
} from "../../../types/UnitPlanTypes";
import SubunitCard from "../../shared/SubunitCard";
import FormField from "../../shared/FormField";
import CurriculumContentSelector from "../../shared/CurriculumContentSelector";

interface EnhancedContentSectionProps {
  unitPlan: UnitPlanData;
  updateUnitPlan: (
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
  updateSubunit: (
    subunitIndex: number,
    field: keyof SubunitData,
    value: string | number | string[]
  ) => void;
  addSubunit: () => void;
  removeSubunit: (subunitIndex: number) => void;
}

const EnhancedContentSection: React.FC<EnhancedContentSectionProps> = ({
  unitPlan,
  updateUnitPlan,
  updateSubunit,
  addSubunit,
  removeSubunit,
}) => {
  const { t } = useFallbackTranslation();

  return (
    <>
      <CurriculumContentSelector
        mypYear={unitPlan.mypYear}
        subject={unitPlan.subject}
        existingConnections={unitPlan.curriculumConnections || []}
        onAddContent={(content) => {
          const currentContent = unitPlan.unitContent || "";
          const newContent = currentContent + content;
          updateUnitPlan("unitContent", newContent);
        }}
        onAddConnection={(connection) => {
          const existing = unitPlan.curriculumConnections || [];
          if (!existing.some((conn) => conn.id === connection.id)) {
            updateUnitPlan("curriculumConnections", [...existing, connection]);
          }
        }}
      />

      <div className="mb-6">
        <FormField
          label={t("unit_content")}
          value={unitPlan.unitContent}
          onChange={(value) => updateUnitPlan("unitContent", value)}
          type="textarea"
          rows={4}
          placeholder={t("unit_content_placeholder")}
          info={t("unit_content_info")}
        />
      </div>

      <div className="w-full mt-8 pt-6 border-t-2 border-border-default">
        <h3 className="text-xl font-bold text-text-primary mb-6">📝 {t("lessons")}</h3>
        <div className="space-y-0">
          {unitPlan.subunits.map((subunit, index) => (
            <SubunitCard
              key={index}
              subunit={subunit}
              onUpdate={(field, value) => updateSubunit(index, field, value)}
              onRemove={() => removeSubunit(index)}
              canRemove={unitPlan.subunits.length > 1}
              unitPlanContext={unitPlan}
              subunitIndex={index}
              displayMode={unitPlan.outputMapping}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={addSubunit}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
        >
          {t("add_lesson")}
        </button>
      </div>
    </>
  );
};

export default EnhancedContentSection;
