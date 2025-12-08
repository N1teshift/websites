import React from "react";
import { UnitPlanData } from "../../../types/UnitPlanTypes";
import { formatATLSkillsForDisplay } from "../../../data/atlSkills";
import { previewStyles } from "./previewTheme";

interface PreviewATLSectionProps {
  unitPlan: UnitPlanData;
}

const PreviewATLSection: React.FC<PreviewATLSectionProps> = ({ unitPlan }) => {
  // Only show this section if there's ATL content to display
  const hasATLContent =
    unitPlan.outputMapping !== "current" || (unitPlan.atlCards && unitPlan.atlCards.length > 0);

  if (!hasATLContent) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2" style={previewStyles.sectionTitle}>
        Approaches to Learning
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ATL Skills/Strategies - shown in "enhanced" and "custom" modes */}
        {unitPlan.outputMapping !== "current" && (
          <>
            <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
              <div
                className="font-semibold text-sm uppercase tracking-wide mb-2"
                style={previewStyles.fieldLabel}
              >
                ATL Skills
              </div>
              <div className="text-gray-700">
                {formatATLSkillsForDisplay(unitPlan.atlSkills) || "No ATL skills specified"}
              </div>
            </div>
            <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
              <div
                className="font-semibold text-sm uppercase tracking-wide mb-2"
                style={previewStyles.fieldLabel}
              >
                ATL Strategies
              </div>
              <div className="text-gray-700">
                {unitPlan.atlStrategies || "No ATL strategies specified"}
              </div>
            </div>
          </>
        )}

        {/* ATL Cards - shown in "current" and "custom" modes */}
        {(unitPlan.outputMapping === "current" || unitPlan.outputMapping === "custom") &&
          unitPlan.atlCards &&
          unitPlan.atlCards.length > 0 && (
            <div
              className="p-4 rounded-lg border-l-4 col-span-full"
              style={previewStyles.contentBlock}
            >
              <div
                className="font-semibold text-sm uppercase tracking-wide mb-2"
                style={previewStyles.fieldLabel}
              >
                ATL Cards
              </div>
              <div className="text-gray-700 space-y-3">
                {unitPlan.atlCards.map((card, index) => (
                  <div
                    key={index}
                    className="bg-white p-3 rounded border-l-2"
                    style={previewStyles.border}
                  >
                    <div>
                      <strong>Category Cluster:</strong> {card.categoryCluster}
                    </div>
                    <div>
                      <strong>ATL Support:</strong> {card.atlSupport}
                    </div>
                    <div>
                      <strong>Strategy Name:</strong> {card.atlStrategyName}
                    </div>
                    <div>
                      <strong>Strategy Description:</strong> {card.atlStrategyDescription}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default PreviewATLSection;
