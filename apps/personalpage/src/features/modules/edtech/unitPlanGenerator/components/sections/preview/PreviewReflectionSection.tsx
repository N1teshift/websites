import React from "react";
import { UnitPlanData } from "../../../types/UnitPlanTypes";
import { previewStyles } from "./previewTheme";

interface PreviewReflectionSectionProps {
  unitPlan: UnitPlanData;
}

const PreviewReflectionSection: React.FC<PreviewReflectionSectionProps> = ({ unitPlan }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2" style={previewStyles.sectionTitle}>
        Reflection: Considering the planning, process and impact of the inquiry
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 rounded-lg border-l-4" style={previewStyles.secondaryBlock}>
          <h4 className="font-semibold mb-3" style={previewStyles.fieldLabel}>
            Prior to teaching the unit
          </h4>
          <div className="text-text-secondary">
            {unitPlan.reflectionPriorToTeaching || (
              <span className="text-gray-500 italic">No reflection provided</span>
            )}
          </div>
        </div>
        <div className="p-4 rounded-lg border-l-4" style={previewStyles.secondaryBlock}>
          <h4 className="font-semibold mb-3" style={previewStyles.fieldLabel}>
            During teaching
          </h4>
          <div className="text-text-secondary">
            {unitPlan.reflectionDuringTeaching || (
              <span className="text-gray-500 italic">No reflection provided</span>
            )}
          </div>
        </div>
        <div className="p-4 rounded-lg border-l-4" style={previewStyles.secondaryBlock}>
          <h4 className="font-semibold mb-3" style={previewStyles.fieldLabel}>
            After teaching the unit
          </h4>
          <div className="text-text-secondary">
            {unitPlan.reflectionAfterTeaching || (
              <span className="text-gray-500 italic">No reflection provided</span>
            )}
          </div>
        </div>
        <div className="p-4 rounded-lg border-l-4" style={previewStyles.secondaryBlock}>
          <h4 className="font-semibold mb-3" style={previewStyles.fieldLabel}>
            Future planning
          </h4>
          <div className="text-text-secondary">
            {unitPlan.reflectionFuturePlanning || (
              <span className="text-gray-500 italic">No reflection provided</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewReflectionSection;
