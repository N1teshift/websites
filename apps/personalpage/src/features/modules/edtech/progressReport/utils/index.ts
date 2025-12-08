// Main utilities
export * from "./progressReportUtils";
export * from "./assessmentColumnUtils";
export * from "./assessmentMetrics";

// Processing utilities - export specific functions to avoid type conflicts
export { calculateAssessmentStatistics } from "./processing/assessmentStatistics";
export { getCellColorClass } from "./processing/cellStyling";
export {
  calculateChartDataForEnglishTest,
  calculateChartDataForCambridge,
  calculateChartDataForBinaryHomework,
  calculateChartDataForMYP,
  calculateChartDataForPercentage,
} from "./processing/chartDataCalculator";
export { buildChartOptions } from "./processing/chartOptionsBuilder";
export type { ChartOption } from "./processing/chartOptionsBuilder";
export { calculateClassStatistics } from "./processing/classStatistics";
export {
  buildAssessmentColumns,
  shortenColumnTitle,
  columnHasData,
  getAssessmentMetadata,
} from "./processing/columnBuilder";
export type { AssessmentInfo } from "./processing/columnBuilder";
export { calculateGrade, getMissingTests, getTestScores } from "./processing/gradeCalculations";
export {
  filterStudentsByClass,
  filterStudentsBySearch,
  sortStudentsByName,
  sortStudentsByLastName,
} from "./processing/studentFilters";
export {
  createStudentSortComparators,
  parseAssessmentColumnId,
} from "./processing/studentSortComparators";
export { buildAllTimelineEvents } from "./processing/timelineEventsBuilder";
export type { TimelineEvent } from "./processing/timelineEventsBuilder";
