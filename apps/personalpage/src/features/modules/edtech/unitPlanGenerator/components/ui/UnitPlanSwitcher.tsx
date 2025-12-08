import React, { useRef, useEffect, useCallback } from "react";
import { UnitPlanDocument } from "../../types/UnitPlanTypes";
import { Copy, Plus, X } from "lucide-react";

interface UnitPlanSwitcherProps {
  unitPlans: UnitPlanDocument[];
  activeUnitPlanId: string;
  onSwitchPlan: (id: string) => void;
  onRemovePlan: (id: string) => void;
  onAddPlan: () => void;
  onDuplicateWithBasicInfo: () => void;
  onRenamePlan?: (id: string, newName: string) => void; // Kept for backward compatibility but not used
}

const UnitPlanSwitcher: React.FC<UnitPlanSwitcherProps> = ({
  unitPlans,
  activeUnitPlanId,
  onSwitchPlan,
  onRemovePlan,
  onAddPlan,
  onDuplicateWithBasicInfo,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active plan
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector(
        `[data-plan-id="${activeUnitPlanId}"]`
      );
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeUnitPlanId]);

  const handleRemovePlan = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();

      if (unitPlans.length <= 1) {
        alert("You must have at least one unit plan open.");
        return;
      }

      const plan = unitPlans.find((p) => p.id === id);
      const displayName = plan?.data.unitTitle || plan?.name || "this unit";
      if (plan && confirm(`Are you sure you want to close "${displayName}"?`)) {
        onRemovePlan(id);
      }
    },
    [unitPlans, onRemovePlan]
  );

  const truncateName = (name: string, maxLength: number = 20) => {
    return name.length > maxLength ? name.substring(0, maxLength) + "..." : name;
  };

  // Sort unit plans by unitOrder (if defined), then by name
  const sortedUnitPlans = [...unitPlans].sort((a, b) => {
    const orderA = a.data.unitOrder && a.data.unitOrder > 0 ? a.data.unitOrder : Infinity;
    const orderB = b.data.unitOrder && b.data.unitOrder > 0 ? b.data.unitOrder : Infinity;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // If orders are equal (or both undefined), sort by name
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="border-b-2 border-border-default bg-transparent w-full shadow-soft">
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 px-3 py-2 overflow-x-auto scrollbar-thin scrollbar-thumb-border-default scrollbar-track-surface-card"
        style={{ scrollbarWidth: "thin" }}
      >
        {/* Unit Plan Tabs */}
        {sortedUnitPlans.map((plan) => {
          const isActive = plan.id === activeUnitPlanId;

          return (
            <div
              key={plan.id}
              data-plan-id={plan.id}
              onClick={() => onSwitchPlan(plan.id)}
              className={`
                                flex items-center gap-2 px-4 py-2 rounded-t-xl transition-all duration-200 cursor-pointer
                                flex-shrink-0 min-w-[140px] max-w-[220px] group relative
                                ${
                                  isActive
                                    ? "bg-surface-card border-2 border-b-0 border-brand hover:shadow-medium transform translate-y-0.5"
                                    : "bg-transparent border-2 border-transparent hover:bg-surface-button/50 hover:border-border-default hover:shadow-soft"
                                }
                            `}
            >
              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full animate-pulse"></div>
              )}

              {/* Plan Name - Shows Unit Title from Basic Info */}
              <span
                className={`flex-1 text-sm font-semibold ${isActive ? "text-brand" : "text-text-primary group-hover:text-brand"}`}
                title={plan.data.unitTitle || plan.name}
              >
                {truncateName(plan.data.unitTitle || plan.name, 18)}
              </span>

              {/* Close Button */}
              <button
                onClick={(e) => handleRemovePlan(e, plan.id)}
                className={`p-1 rounded-lg hover:bg-danger-50 transition-all duration-200 ${
                  isActive
                    ? "opacity-70 hover:opacity-100"
                    : "opacity-0 group-hover:opacity-70 group-hover:hover:opacity-100"
                }`}
                title="Close plan"
              >
                <X className="w-3.5 h-3.5 text-danger-600" strokeWidth={2.5} />
              </button>
            </div>
          );
        })}

        {/* Duplicate Plan with Basic Info Button */}
        <button
          onClick={onDuplicateWithBasicInfo}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-br from-success-50 to-success-100 hover:from-success-100 hover:to-success-200 border-2 border-success-300 transition-all duration-200 flex-shrink-0 shadow-soft hover:shadow-medium group"
          title="Duplicate current plan with basic info"
        >
          <Copy
            className="w-4 h-4 text-success-600 group-hover:scale-110 transition-transform"
            strokeWidth={2.5}
          />
          <span className="text-xs font-semibold text-success-700 hidden lg:inline">Duplicate</span>
        </button>

        {/* Add New Plan Button */}
        <button
          onClick={onAddPlan}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-br from-brand to-brand-hover hover:from-brand-hover hover:to-brand text-text-inverse transition-all duration-200 flex-shrink-0 shadow-medium hover:shadow-large group"
          title="Add new unit plan"
        >
          <Plus
            className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300"
            strokeWidth={2.5}
          />
          <span className="text-xs font-semibold hidden lg:inline">New Plan</span>
        </button>
      </div>
    </div>
  );
};

export default UnitPlanSwitcher;
