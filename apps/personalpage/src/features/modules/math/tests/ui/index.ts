/**
 * @file Index file for UI components related to the testing feature.
 * @description Exports components for displaying test results summary, test controls,
 *              and a toggle for database fetching.
 *              `TestResultsSummary` is dynamically imported to disable SSR.
 */
import dynamic from "next/dynamic";

// Dynamically import TestResultsSummary to disable Server-Side Rendering (SSR)
// This is often done for components that rely heavily on client-side state or APIs.
const TestResultsSummary = dynamic(() => import("./TestResultsSummary"), { ssr: false });

// Export the dynamically imported component as the default
export default TestResultsSummary;
// Also export named exports from TestResultsSummary (e.g., props interfaces)
export * from "./TestResultsSummary";

// Export other components from this directory
export { default as TestControls } from "./TestControls";
export { default as DBFetchingToggle } from "./DBFetchingToggle";
export { default as AIModeSwitch } from "./AIModeSwitch";
export type { AISystem } from "./AIModeSwitch";
