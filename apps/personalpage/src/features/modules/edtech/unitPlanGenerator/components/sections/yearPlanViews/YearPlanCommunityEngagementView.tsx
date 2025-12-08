import React, { useState } from "react";
import { UnitPlanDocument } from "../../../types/UnitPlanTypes";

interface YearPlanCommunityEngagementViewProps {
  unitPlans: UnitPlanDocument[];
  onUpdateCommunityEngagement: (planId: string, value: string) => void;
}

const YearPlanCommunityEngagementView: React.FC<YearPlanCommunityEngagementViewProps> = ({
  unitPlans,
  onUpdateCommunityEngagement,
}) => {
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const handleStartEdit = (planId: string, currentValue: string) => {
    setEditingPlanId(planId);
    setEditValue(currentValue || "");
  };

  const handleFinishEdit = () => {
    if (editingPlanId) {
      onUpdateCommunityEngagement(editingPlanId, editValue);
    }
    setEditingPlanId(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingPlanId(null);
    setEditValue("");
  };

  const sortedUnitPlans = [...unitPlans].sort((a, b) => {
    const orderA = a.data.unitOrder ?? Infinity;
    const orderB = b.data.unitOrder ?? Infinity;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          🤝 Year Plan View - Community Engagement
        </h2>
        <p className="text-text-secondary mb-6">
          View and edit community engagement activities across all your unit plans. Click on any
          entry to edit it inline.
        </p>
      </div>

      <div className="space-y-4">
        {sortedUnitPlans.map((plan) => {
          const isEditing = editingPlanId === plan.id;
          const hasContent =
            plan.data.communityEngagement && plan.data.communityEngagement.trim().length > 0;

          return (
            <div
              key={plan.id}
              className="bg-surface-card border-2 border-border-default rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Unit Header */}
              <div className="bg-surface-button px-6 py-4 border-b-2 border-border-default">
                <div className="flex items-center gap-3">
                  {plan.data.unitOrder && (
                    <div className="flex-shrink-0 w-10 h-10 bg-brand text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {plan.data.unitOrder}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-text-primary">
                      {plan.data.unitTitle || "Untitled Unit"}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Community Engagement Content */}
              <div className="px-6 py-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full px-4 py-2.5 text-base bg-surface-card text-text-primary border-2 border-border-default rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-light focus:border-brand placeholder-text-muted transition-all duration-200 min-h-[200px] resize-y"
                      placeholder="Describe community engagement activities for this unit..."
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-sm font-medium text-text-secondary bg-surface-button hover:bg-surface-button-hover rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleFinishEdit}
                        className="px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-primary-hover rounded-lg transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => handleStartEdit(plan.id, plan.data.communityEngagement)}
                    className="cursor-pointer hover:bg-surface-button-hover px-4 py-3 rounded-lg transition-colors min-h-[100px] group"
                    title="Click to edit community engagement"
                  >
                    {hasContent ? (
                      <div className="text-text-primary whitespace-pre-wrap">
                        {plan.data.communityEngagement}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-text-muted italic">
                        <div className="text-center">
                          <svg
                            className="mx-auto h-8 w-8 mb-2 opacity-50"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <p>No community engagement activities specified</p>
                          <p className="text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to add
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="bg-surface-card border-2 border-border-default rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
              Total Units
            </h4>
            <p className="text-2xl font-bold text-text-primary mt-1">{unitPlans.length}</p>
          </div>
          <div className="text-right">
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
              With Community Engagement
            </h4>
            <p className="text-2xl font-bold text-brand mt-1">
              {
                unitPlans.filter(
                  (plan) =>
                    plan.data.communityEngagement && plan.data.communityEngagement.trim().length > 0
                ).length
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearPlanCommunityEngagementView;
