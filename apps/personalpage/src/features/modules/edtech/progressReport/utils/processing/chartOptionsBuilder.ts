export interface ChartOption {
  id: string;
  title: string;
  type: "assessment";
}

export interface AssessmentInfo {
  id: string;
  title: string;
  type: string;
}

export function buildChartOptions(availableAssessments: AssessmentInfo[]): ChartOption[] {
  const options: ChartOption[] = [];

  // Add all assessments (includes English tests as diagnostic/summative assessments)
  availableAssessments.forEach((assessment) => {
    options.push({
      id: assessment.id,
      title: assessment.title,
      type: "assessment",
    });
  });

  return options;
}
