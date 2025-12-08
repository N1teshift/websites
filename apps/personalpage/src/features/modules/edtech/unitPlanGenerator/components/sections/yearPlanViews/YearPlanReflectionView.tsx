import React, { useState } from "react";
import { UnitPlanDocument } from "../../../types/UnitPlanTypes";

interface YearPlanReflectionViewProps {
  unitPlans: UnitPlanDocument[];
  onUpdateReflection: (
    planId: string,
    field:
      | "reflectionPriorToTeaching"
      | "reflectionDuringTeaching"
      | "reflectionAfterTeaching"
      | "reflectionFuturePlanning",
    value: string
  ) => void;
}

type ReflectionField =
  | "reflectionPriorToTeaching"
  | "reflectionDuringTeaching"
  | "reflectionAfterTeaching"
  | "reflectionFuturePlanning";

interface ReflectionStage {
  field: ReflectionField;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  placeholder: string;
}

const reflectionStages: ReflectionStage[] = [
  {
    field: "reflectionPriorToTeaching",
    label: "Prior to Teaching",
    icon: "📝",
    color: "text-text-primary",
    bgColor: "bg-brand-light",
    borderColor: "border-border-default",
    placeholder: "Reflections and plans before starting this unit...",
  },
  {
    field: "reflectionDuringTeaching",
    label: "During Teaching",
    icon: "🔄",
    color: "text-text-primary",
    bgColor: "bg-brand-light",
    borderColor: "border-border-default",
    placeholder: "Observations and adjustments while teaching this unit...",
  },
  {
    field: "reflectionAfterTeaching",
    label: "After Teaching",
    icon: "✅",
    color: "text-text-primary",
    bgColor: "bg-brand-light",
    borderColor: "border-border-default",
    placeholder: "What worked well and what could be improved...",
  },
  {
    field: "reflectionFuturePlanning",
    label: "Future Planning",
    icon: "🎯",
    color: "text-text-primary",
    bgColor: "bg-brand-light",
    borderColor: "border-border-default",
    placeholder: "Changes and improvements for next time...",
  },
];

const YearPlanReflectionView: React.FC<YearPlanReflectionViewProps> = ({
  unitPlans,
  onUpdateReflection,
}) => {
  const [editingCell, setEditingCell] = useState<{ planId: string; field: ReflectionField } | null>(
    null
  );
  const [editValue, setEditValue] = useState<string>("");

  const handleStartEdit = (planId: string, field: ReflectionField, currentValue: string) => {
    setEditingCell({ planId, field });
    setEditValue(currentValue || "");
  };

  const handleFinishEdit = () => {
    if (editingCell) {
      onUpdateReflection(editingCell.planId, editingCell.field, editValue);
    }
    setEditingCell(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
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

  const getCompletionStats = (plan: UnitPlanDocument) => {
    const completed = reflectionStages.filter(
      (stage) => plan.data[stage.field] && plan.data[stage.field].trim().length > 0
    ).length;
    return { completed, total: reflectionStages.length };
  };

  const getTotalCompletionStats = () => {
    let completed = 0;
    let total = 0;
    unitPlans.forEach((plan) => {
      const stats = getCompletionStats(plan);
      completed += stats.completed;
      total += stats.total;
    });
    return { completed, total };
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          💭 Year Plan View - Reflection Timeline
        </h2>
        <p className="text-text-secondary mb-6">
          View and edit reflections across all your unit plans. Each unit shows a complete
          reflection journey from planning through to future improvements. Click on any reflection
          to edit it inline.
        </p>
      </div>

      <div className="space-y-6">
        {sortedUnitPlans.map((plan) => {
          const stats = getCompletionStats(plan);
          const completionPercentage = (stats.completed / stats.total) * 100;

          return (
            <div
              key={plan.id}
              className="bg-surface-card border-2 border-border-default rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Unit Header */}
              <div className="bg-surface-button px-6 py-4 border-b-2 border-border-default">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
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
                  {/* Completion Indicator */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-text-secondary">
                        {stats.completed} / {stats.total} Complete
                      </div>
                      <div className="w-32 h-2 bg-surface-button rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-brand transition-all duration-300"
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline of Reflections */}
              <div className="px-6 py-4">
                <div className="relative">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border-default" />

                  <div className="space-y-4">
                    {reflectionStages.map((stage) => {
                      const isEditing =
                        editingCell?.planId === plan.id && editingCell?.field === stage.field;
                      const hasContent =
                        plan.data[stage.field] && plan.data[stage.field].trim().length > 0;

                      return (
                        <div key={stage.field} className="relative">
                          <div className="flex items-start gap-4">
                            {/* Timeline Icon */}
                            <div className="flex-shrink-0 w-12 h-12 bg-brand-light rounded-full flex items-center justify-center text-2xl z-10 border-2 border-border-default shadow-sm">
                              {stage.icon}
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 pb-6">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-base font-semibold text-text-primary">
                                  {stage.label}
                                </h4>
                                {hasContent && (
                                  <span className="text-xs px-2 py-0.5 bg-brand-light text-brand rounded-full">
                                    ✓
                                  </span>
                                )}
                              </div>

                              {isEditing ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-full px-4 py-2.5 text-base bg-surface-card text-text-primary border-2 border-border-default rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-light focus:border-brand placeholder-text-muted transition-all duration-200 min-h-[150px] resize-y"
                                    placeholder={stage.placeholder}
                                    autoFocus
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={handleCancelEdit}
                                      className="px-3 py-1.5 text-sm font-medium text-text-secondary bg-surface-button hover:bg-surface-button-hover rounded-md transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={handleFinishEdit}
                                      className="px-3 py-1.5 text-sm font-medium text-white bg-brand hover:bg-brand-primary-hover rounded-md transition-colors"
                                    >
                                      Save Changes
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  onClick={() =>
                                    handleStartEdit(plan.id, stage.field, plan.data[stage.field])
                                  }
                                  className="cursor-pointer hover:bg-surface-button-hover px-4 py-3 rounded-lg transition-colors min-h-[80px] border-2 border-transparent hover:border-brand group"
                                  title={`Click to edit ${stage.label.toLowerCase()}`}
                                >
                                  {hasContent ? (
                                    <div className="text-text-secondary whitespace-pre-wrap text-sm">
                                      {plan.data[stage.field]}
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-text-muted italic">
                                      <div className="text-center">
                                        <p className="text-sm">No reflection added yet</p>
                                        <p className="text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          Click to add {stage.label.toLowerCase()}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
          <div className="text-center">
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
              Reflections Completed
            </h4>
            <p className="text-2xl font-bold text-brand mt-1">
              {getTotalCompletionStats().completed} / {getTotalCompletionStats().total}
            </p>
          </div>
          <div className="text-right">
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
              Overall Progress
            </h4>
            <p className="text-2xl font-bold text-brand mt-1">
              {Math.round(
                (getTotalCompletionStats().completed / getTotalCompletionStats().total) * 100
              )}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearPlanReflectionView;
