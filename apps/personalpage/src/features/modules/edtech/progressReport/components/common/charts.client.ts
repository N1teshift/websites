import dynamic from "next/dynamic";

/**
 * Client-only chart components using dynamic imports with SSR disabled.
 *
 * This prevents recharts (and its @reduxjs/toolkit dependency) from being
 * processed during static generation, eliminating CommonJS/ESM conflicts.
 *
 * Charts are loaded only on the client side after page hydration.
 */
export const ClassPerformanceChartEnhanced = dynamic(
  () => import("./ClassPerformanceChartEnhanced"),
  { ssr: false }
);

export const ClassPerformanceChart = dynamic(() => import("./ClassPerformanceChart"), {
  ssr: false,
});

export const AssessmentTimelineChart = dynamic(() => import("./AssessmentTimelineChart"), {
  ssr: false,
});

export const ActivityTimelineChart = dynamic(() => import("./ActivityTimelineChart"), {
  ssr: false,
});

// Re-export all types from ClassPerformanceChartEnhanced
// Types are compile-time only, so they don't need dynamic imports
export type {
  ChartMode,
  AllScoreTypes,
  EnglishTestScoreType,
} from "./ClassPerformanceChartEnhanced";
