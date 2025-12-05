import React from 'react';
import { UnitPlanData, SubunitData, AssessmentTask, ATLCard, ActivityCard, LearningExperienceCard, CurriculumConnection } from '../../../types/UnitPlanTypes';
import { useListManager } from '../../../hooks/useListManager';
import EditableListSection from '../../shared/EditableListSection';

interface DifferentiationSectionProps {
  unitPlan: UnitPlanData;
  updateUnitPlan: (field: keyof UnitPlanData, value: string | string[] | number | SubunitData[] | AssessmentTask[] | ATLCard[] | ActivityCard[] | LearningExperienceCard[] | CurriculumConnection[] | undefined) => void;
}

const DifferentiationSection: React.FC<DifferentiationSectionProps> = ({
  unitPlan,
  updateUnitPlan
}) => {
  const { addItem, updateItem, removeItem, getList } = useListManager({ unitPlan, updateUnitPlan });

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-text-primary mb-4">
        Differentiation
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EditableListSection
          title="Differentiation by Access"
          items={getList('differentiationByAccess')}
          onAdd={() => addItem('differentiationByAccess')}
          onUpdate={(index, value) => updateItem('differentiationByAccess', index, value)}
          onRemove={(index) => removeItem('differentiationByAccess', index)}
          placeholder="Enter differentiation by access"
          addButtonText="Add Item"
        />
        <EditableListSection
          title="Differentiation by Process"
          items={getList('differentiationByProcess')}
          onAdd={() => addItem('differentiationByProcess')}
          onUpdate={(index, value) => updateItem('differentiationByProcess', index, value)}
          onRemove={(index) => removeItem('differentiationByProcess', index)}
          placeholder="Enter differentiation by process"
          addButtonText="Add Item"
        />
        <EditableListSection
          title="Differentiation by Product"
          items={getList('differentiationByProduct')}
          onAdd={() => addItem('differentiationByProduct')}
          onUpdate={(index, value) => updateItem('differentiationByProduct', index, value)}
          onRemove={(index) => removeItem('differentiationByProduct', index)}
          placeholder="Enter differentiation by product"
          addButtonText="Add Item"
        />
      </div>
    </div>
  );
};

export default DifferentiationSection;




