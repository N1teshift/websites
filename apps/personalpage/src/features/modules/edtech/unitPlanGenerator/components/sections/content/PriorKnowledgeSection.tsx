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

interface PriorKnowledgeSectionProps {
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

const PriorKnowledgeSection: React.FC<PriorKnowledgeSectionProps> = ({
  unitPlan,
  updateUnitPlan,
}) => {
  const { t } = useFallbackTranslation();
  const { addItem, updateItem, removeItem, getList } = useListManager({ unitPlan, updateUnitPlan });

  return (
    <div>
      <h3 className="text-xl font-semibold text-text-primary mb-4">{t("prior_knowledge")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EditableListSection
          title={t("prior_knowledge_subject_specific")}
          items={getList("priorKnowledgeSubjectSpecific")}
          onAdd={() => addItem("priorKnowledgeSubjectSpecific")}
          onUpdate={(index, value) => updateItem("priorKnowledgeSubjectSpecific", index, value)}
          onRemove={(index) => removeItem("priorKnowledgeSubjectSpecific", index)}
          placeholder={t("prior_knowledge_subject_specific_placeholder")}
        />
        <EditableListSection
          title={t("prior_knowledge_learning_skills")}
          items={getList("priorKnowledgeLearningSkills")}
          onAdd={() => addItem("priorKnowledgeLearningSkills")}
          onUpdate={(index, value) => updateItem("priorKnowledgeLearningSkills", index, value)}
          onRemove={(index) => removeItem("priorKnowledgeLearningSkills", index)}
          placeholder={t("prior_knowledge_learning_skills_placeholder")}
        />
      </div>
    </div>
  );
};

export default PriorKnowledgeSection;
