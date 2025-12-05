export const FEATURE_FLAGS = {
  exercisesGenerator:      false, // Exercise Generator - AI-powered educational content creation
  lessonScheduler:         true,  // Lesson Scheduler - Calendar integration for lesson planning
  mathGenerator:           true,  // Math Object Generator - Core mathematical object creation (should stay enabled)
  calendarIntegration:     true,  // Calendar Integration - Google/Microsoft calendar features
  voiceRecognition:        true,  // Voice Recognition - Speech-to-text input for math generation
  examGenerator:           false, // Exam Generator - Educational assessment creation
  myTasks:                 false, // My Tasks - Personal task management
  fieldCompletion:         false, // Field completion UI (word/sentence hints and progress)
  emwHome:                 true, // Election Monitoring Wizard - EMW project home

  connectingVessels:                 true, // Connecting Vessels - Brief description
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export function isFeatureEnabled(feature: FeatureFlag): boolean {
  // Check for environment variable override first
  // Format: NEXT_PUBLIC_FEATURE_[FEATURE_NAME] = "true" | "false"
  const envKey = `NEXT_PUBLIC_FEATURE_${feature.toUpperCase()}`;
  const envValue = process.env[envKey];
  
  if (envValue !== undefined) {
    return envValue.toLowerCase() === 'true';
  }
  
  // Fall back to default configuration
  return FEATURE_FLAGS[feature];
}

export function getEnabledFeatures(): FeatureFlag[] {
  return Object.keys(FEATURE_FLAGS).filter(
    feature => isFeatureEnabled(feature as FeatureFlag)
  ) as FeatureFlag[];
}

export function getDisabledFeatures(): FeatureFlag[] {
  return Object.keys(FEATURE_FLAGS).filter(
    feature => !isFeatureEnabled(feature as FeatureFlag)
  ) as FeatureFlag[];
}



