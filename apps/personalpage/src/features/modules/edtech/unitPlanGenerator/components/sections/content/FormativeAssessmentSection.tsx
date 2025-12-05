import React from 'react';
import { UnitPlanData, SubunitData, AssessmentTask, ATLCard, ActivityCard, LearningExperienceCard, CurriculumConnection } from '../../../types/UnitPlanTypes';
import { useListManager } from '../../../hooks/useListManager';
import EditableListSection from '../../shared/EditableListSection';

interface FormativeAssessmentSectionProps {
  unitPlan: UnitPlanData;
  updateUnitPlan: (field: keyof UnitPlanData, value: string | string[] | number | SubunitData[] | AssessmentTask[] | ATLCard[] | ActivityCard[] | LearningExperienceCard[] | CurriculumConnection[] | undefined) => void;
}

const FormativeAssessmentSection: React.FC<FormativeAssessmentSectionProps> = ({
  unitPlan,
  updateUnitPlan
}) => {
  const { addItem, updateItem, removeItem, getList } = useListManager({ unitPlan, updateUnitPlan });

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-text-primary mb-4">
        Formative Assessment
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EditableListSection
          title="Informal Formative Assessment"
          items={getList('informalFormativeAssessment')}
          onAdd={() => addItem('informalFormativeAssessment')}
          onUpdate={(index, value) => updateItem('informalFormativeAssessment', index, value)}
          onRemove={(index) => removeItem('informalFormativeAssessment', index)}
          placeholder="Enter informal formative assessment"
          addButtonText="Add Item"
        />
        <EditableListSection
          title="Formal Formative Assessment"
          items={getList('formalFormativeAssessment')}
          onAdd={() => addItem('formalFormativeAssessment')}
          onUpdate={(index, value) => updateItem('formalFormativeAssessment', index, value)}
          onRemove={(index) => removeItem('formalFormativeAssessment', index)}
          placeholder="Enter formal formative assessment"
          addButtonText="Add Item"
        />
      </div>
    </div>
  );
};

export default FormativeAssessmentSection;




