// Export dynamically imported chart components (client-only)
// This prevents recharts from being processed during static generation
export {
  ActivityTimelineChart,
  AssessmentTimelineChart,
  ClassPerformanceChart,
  ClassPerformanceChartEnhanced,
  // Re-export types for convenience
  type ChartMode,
  type AllScoreTypes,
  type EnglishTestScoreType,
} from "./charts.client";

export { default as CollapsibleSection } from "./CollapsibleSection";
export { default as ColumnCustomizer } from "./ColumnCustomizer";
export { default as DateRangeFilter } from "./DateRangeFilter";
export { default as MultiSelectFilter } from "./MultiSelectFilter";
export { default as StudentSummaryCards } from "./StudentSummaryCards";

// Re-export shared components
export * from "./shared";
