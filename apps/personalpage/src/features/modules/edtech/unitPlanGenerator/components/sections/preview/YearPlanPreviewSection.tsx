import React from "react";
import { UnitPlanDocument } from "../../../types/UnitPlanTypes";
import { previewStyles } from "./previewTheme";

interface YearPlanPreviewSectionProps {
  unitPlans: UnitPlanDocument[];
}

const YearPlanPreviewSection: React.FC<YearPlanPreviewSectionProps> = ({ unitPlans }) => {
  // Sort units by order
  const sortedPlans = [...unitPlans].sort((a, b) => {
    const orderA = a.data.unitOrder && a.data.unitOrder > 0 ? a.data.unitOrder : Infinity;
    const orderB = b.data.unitOrder && b.data.unitOrder > 0 ? b.data.unitOrder : Infinity;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });

  // Check if all plans share the same basic info
  const firstPlan = sortedPlans[0]?.data;
  const hasCommonInfo =
    firstPlan &&
    sortedPlans.every(
      (plan) =>
        plan.data.schoolName === firstPlan.schoolName &&
        plan.data.subject === firstPlan.subject &&
        plan.data.academicYear === firstPlan.academicYear &&
        plan.data.mypYear === firstPlan.mypYear
    );

  const getTotalLessons = (plan: UnitPlanDocument): number => {
    return plan.data.subunits.reduce((total, subunit) => total + subunit.lessonsPerSubunit, 0);
  };

  const yearTotalLessons = sortedPlans.reduce((total, plan) => total + getTotalLessons(plan), 0);

  return (
    <div className="container">
      {/* Header matching individual preview style */}
      <div style={previewStyles.header} className="p-8">
        <div className="mb-6">
          {hasCommonInfo && firstPlan ? (
            <>
              <h1 className="text-3xl font-bold mb-2">{firstPlan.schoolName}</h1>
              <div className="space-y-1" style={previewStyles.headerText}>
                <div>
                  <span className="font-semibold">Subject:</span>{" "}
                  <span className="capitalize">{firstPlan.subject.replace(/-/g, " ")}</span>
                </div>
                <div>
                  <span className="font-semibold">MYP Year:</span> MYP Year {firstPlan.mypYear}
                </div>
                <div>
                  <span className="font-semibold">Academic Year:</span> {firstPlan.academicYear}
                </div>
                <div>
                  <span className="font-semibold">Total Lessons:</span> {yearTotalLessons}
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2">Year Plan Overview</h1>
              <div className="space-y-1" style={previewStyles.headerText}>
                <div>
                  <span className="font-semibold">Unit Plans:</span> {sortedPlans.length}
                </div>
                <div>
                  <span className="font-semibold">Total Lessons:</span> {yearTotalLessons}
                </div>
              </div>
            </>
          )}
        </div>
        <div style={previewStyles.headerBorder} className="border-t pt-4">
          <h2 className="text-2xl font-bold mb-2">Year Plan Collection</h2>
        </div>
      </div>

      {/* Units List */}
      <div className="p-8 space-y-3">
        {sortedPlans.map((plan) => {
          const totalLessons = getTotalLessons(plan);
          const hasOrder = plan.data.unitOrder !== undefined && plan.data.unitOrder > 0;

          return (
            <div
              key={plan.id}
              className="p-4 rounded-lg border-l-4"
              style={previewStyles.contentBlock}
            >
              <div className="flex items-center gap-3">
                {/* Order Number Badge */}
                {hasOrder && (
                  <div
                    className="badge flex-shrink-0"
                    style={{ minWidth: "40px", textAlign: "center" }}
                  >
                    {plan.data.unitOrder}
                  </div>
                )}

                {/* Unit Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base text-text-primary">
                    {plan.data.unitTitle || "Untitled Unit"}
                  </div>

                  {/* Show individual info if not common */}
                  {!hasCommonInfo && (
                    <div className="text-xs text-text-muted mt-1">
                      {plan.data.schoolName && <span>{plan.data.schoolName} • </span>}
                      {plan.data.subject && (
                        <span className="capitalize">
                          {plan.data.subject.replace(/-/g, " ")} •{" "}
                        </span>
                      )}
                      {plan.data.academicYear && <span>{plan.data.academicYear} • </span>}
                      {plan.data.mypYear > 0 && <span>Year {plan.data.mypYear}</span>}
                    </div>
                  )}
                </div>

                {/* Lesson Count */}
                <div className="flex-shrink-0 text-right">
                  <div
                    className="text-xl font-bold"
                    style={{ color: previewStyles.sectionTitle.color }}
                  >
                    {totalLessons}
                  </div>
                  <div className="text-xs text-gray-500">
                    {totalLessons === 1 ? "lesson" : "lessons"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Summary - More compact */}
      <div
        className="px-8 py-4 bg-surface-button border-t"
        style={{ borderTopColor: previewStyles.sectionTitle.borderColor }}
      >
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>
            <strong>{sortedPlans.length}</strong> unit plan{sortedPlans.length !== 1 ? "s" : ""}
          </span>
          <span>
            Total: <strong>{yearTotalLessons}</strong> lessons
          </span>
        </div>
      </div>
    </div>
  );
};

export default YearPlanPreviewSection;
