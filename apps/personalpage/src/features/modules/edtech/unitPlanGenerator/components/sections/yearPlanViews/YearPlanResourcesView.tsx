import React from "react";
import { UnitPlanDocument } from "../../../types/UnitPlanTypes";

interface YearPlanResourcesViewProps {
  unitPlans: UnitPlanDocument[];
}

interface ResourceUsage {
  resource: string;
  unitIds: string[];
  units: { id: string; title: string; order?: number }[];
}

type ResourceType = "printedResources" | "digitalResources" | "guestsResources";

const YearPlanResourcesView: React.FC<YearPlanResourcesViewProps> = ({ unitPlans }) => {
  // Helper function to aggregate resources by type
  const aggregateResources = (resourceType: ResourceType): ResourceUsage[] => {
    const resourceMap = new Map<string, ResourceUsage>();

    unitPlans.forEach((plan) => {
      const resources = plan.data[resourceType] || [];
      resources.forEach((resource) => {
        const trimmedResource = resource.trim();
        if (trimmedResource) {
          if (!resourceMap.has(trimmedResource)) {
            resourceMap.set(trimmedResource, {
              resource: trimmedResource,
              unitIds: [],
              units: [],
            });
          }
          const usage = resourceMap.get(trimmedResource)!;
          usage.unitIds.push(plan.id);
          usage.units.push({
            id: plan.id,
            title: plan.data.unitTitle || "Untitled Unit",
            order: plan.data.unitOrder,
          });
        }
      });
    });

    // Convert to array and sort
    return Array.from(resourceMap.values()).sort((a, b) => {
      // Sort by number of uses (descending), then alphabetically
      if (b.units.length !== a.units.length) {
        return b.units.length - a.units.length;
      }
      return a.resource.localeCompare(b.resource);
    });
  };

  const printedResources = aggregateResources("printedResources");
  const digitalResources = aggregateResources("digitalResources");
  const guestsResources = aggregateResources("guestsResources");

  const totalUniqueResources =
    printedResources.length + digitalResources.length + guestsResources.length;

  // Helper to format unit list
  const formatUnitList = (units: ResourceUsage["units"]): string => {
    const sortedUnits = [...units].sort((a, b) => {
      const orderA = a.order ?? Infinity;
      const orderB = b.order ?? Infinity;
      if (orderA !== orderB) return orderA - orderB;
      return a.title.localeCompare(b.title);
    });

    return sortedUnits.map((u) => (u.order ? `Unit ${u.order}` : u.title)).join(", ");
  };

  // Component for rendering a resource category
  const ResourceCategory = ({
    title,
    icon,
    resources,
    emptyMessage,
    colorClass,
  }: {
    title: string;
    icon: string;
    resources: ResourceUsage[];
    emptyMessage: string;
    colorClass: string;
  }) => (
    <div className="bg-surface-card border-2 border-border-default rounded-lg shadow-sm overflow-hidden">
      {/* Category Header */}
      <div className={`${colorClass} px-6 py-4 border-b-2 border-border-default`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <h3 className="text-lg font-bold text-text-primary">{title}</h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-text-primary">{resources.length}</div>
            <div className="text-xs text-text-muted uppercase tracking-wide">
              {resources.length === 1 ? "Resource" : "Resources"}
            </div>
          </div>
        </div>
      </div>

      {/* Resources List */}
      <div className="divide-y divide-border-default">
        {resources.length === 0 ? (
          <div className="px-6 py-8 text-center text-text-muted">
            <svg
              className="mx-auto h-12 w-12 text-text-muted mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          resources.map((resourceUsage, index) => (
            <div key={index} className="px-6 py-4 hover:bg-surface-button-hover transition-colors">
              <div className="flex items-start justify-between gap-4">
                {/* Resource Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-base text-text-primary font-medium break-words">
                    {resourceUsage.resource}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-text-muted">Used in:</span>
                    <span className="text-sm text-text-secondary font-medium">
                      {formatUnitList(resourceUsage.units)}
                    </span>
                  </div>
                </div>

                {/* Usage Count Badge */}
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="text-center px-3 py-2 bg-brand-light rounded-lg">
                      <div className="text-xl font-bold text-brand">
                        {resourceUsage.units.length}
                      </div>
                      <div className="text-xs text-brand uppercase tracking-wide">
                        {resourceUsage.units.length === 1 ? "Unit" : "Units"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          📚 Year Plan View - Resources Overview
        </h2>
        <p className="text-text-secondary mb-6">
          A consolidated view of all resources used across your unit plans. Resources are
          deduplicated and show which units use them.
        </p>
      </div>

      <div className="space-y-6">
        {/* Printed Resources */}
        <ResourceCategory
          title="Printed Resources"
          icon="📖"
          resources={printedResources}
          emptyMessage="No printed resources added across any units"
          colorClass="bg-surface-button"
        />

        {/* Digital Resources */}
        <ResourceCategory
          title="Digital Resources"
          icon="💻"
          resources={digitalResources}
          emptyMessage="No digital resources added across any units"
          colorClass="bg-surface-button"
        />

        {/* Guests */}
        <ResourceCategory
          title="Guest Speakers & Visitors"
          icon="👥"
          resources={guestsResources}
          emptyMessage="No guest speakers or visitors added across any units"
          colorClass="bg-surface-button"
        />
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
              Unique Resources
            </h4>
            <p className="text-2xl font-bold text-brand mt-1">{totalUniqueResources}</p>
          </div>
          <div className="text-right">
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
              Resource Types
            </h4>
            <div className="flex gap-3 mt-1">
              <div className="text-center">
                <div className="text-lg font-bold text-brand">{printedResources.length}</div>
                <div className="text-xs text-text-muted">Print</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-brand">{digitalResources.length}</div>
                <div className="text-xs text-text-muted">Digital</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-brand">{guestsResources.length}</div>
                <div className="text-xs text-text-muted">Guests</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearPlanResourcesView;
