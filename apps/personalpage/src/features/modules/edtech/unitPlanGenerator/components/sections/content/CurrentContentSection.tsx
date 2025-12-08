import React from "react";
import {
  UnitPlanData,
  SubunitData,
  AssessmentTask,
  ATLCard,
  ActivityCard,
  LearningExperienceCard,
  CurriculumConnection,
} from "../../../types/UnitPlanTypes";
import PriorKnowledgeSection from "./PriorKnowledgeSection";
import NewKnowledgeSection from "./NewKnowledgeSection";
import FormativeAssessmentSection from "./FormativeAssessmentSection";
import DifferentiationSection from "./DifferentiationSection";
import LearningExperienceCardManager from "../../shared/LearningExperienceCardManager";

interface CurrentContentSectionProps {
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

const CurrentContentSection: React.FC<CurrentContentSectionProps> = ({
  unitPlan,
  updateUnitPlan,
}) => {
  return (
    <div className="space-y-6">
      <PriorKnowledgeSection unitPlan={unitPlan} updateUnitPlan={updateUnitPlan} />

      <NewKnowledgeSection unitPlan={unitPlan} updateUnitPlan={updateUnitPlan} />

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-text-primary mb-4">Learning Process</h3>
        <LearningExperienceCardManager
          cards={
            Array.isArray(unitPlan.learningExperienceCards) ? unitPlan.learningExperienceCards : []
          }
          onCardsChange={(cards) => updateUnitPlan("learningExperienceCards", cards)}
        />
      </div>

      <FormativeAssessmentSection unitPlan={unitPlan} updateUnitPlan={updateUnitPlan} />

      <DifferentiationSection unitPlan={unitPlan} updateUnitPlan={updateUnitPlan} />
    </div>
  );
};

export default CurrentContentSection;
