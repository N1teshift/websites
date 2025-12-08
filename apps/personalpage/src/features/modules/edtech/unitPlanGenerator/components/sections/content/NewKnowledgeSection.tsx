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
import { useListManager } from "../../../hooks/useListManager";
import EditableListSection from "../../shared/EditableListSection";

interface NewKnowledgeSectionProps {
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
}

const NewKnowledgeSection: React.FC<NewKnowledgeSectionProps> = ({ unitPlan, updateUnitPlan }) => {
  const { t } = useFallbackTranslation();
  const { addItem, updateItem, removeItem, getList } = useListManager({ unitPlan, updateUnitPlan });

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-text-primary mb-4">{t("new_knowledge")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EditableListSection
          title={t("topics_terminology")}
          items={getList("topicsTerminology")}
          onAdd={() => addItem("topicsTerminology")}
          onUpdate={(index, value) => updateItem("topicsTerminology", index, value)}
          onRemove={(index) => removeItem("topicsTerminology", index)}
          placeholder={t("topics_terminology_placeholder")}
        />
        <EditableListSection
          title={t("conceptual_knowledge")}
          items={getList("conceptualKnowledge")}
          onAdd={() => addItem("conceptualKnowledge")}
          onUpdate={(index, value) => updateItem("conceptualKnowledge", index, value)}
          onRemove={(index) => removeItem("conceptualKnowledge", index)}
          placeholder={t("conceptual_knowledge_placeholder")}
        />
        <EditableListSection
          title={t("procedural_knowledge")}
          items={getList("proceduralKnowledge")}
          onAdd={() => addItem("proceduralKnowledge")}
          onUpdate={(index, value) => updateItem("proceduralKnowledge", index, value)}
          onRemove={(index) => removeItem("proceduralKnowledge", index)}
          placeholder={t("procedural_knowledge_placeholder")}
        />
      </div>
    </div>
  );
};

export default NewKnowledgeSection;
