export interface CurriculumConnection {
  id: string;
  type: "bup" | "cambridge" | "cambridge-book";
  level:
    | "module"
    | "unit"
    | "subunit"
    | "strand"
    | "substrand"
    | "objective"
    | "book-unit"
    | "book-subsection";
  displayPath: string;
  // BUP fields
  moduleId?: string;
  moduleName?: string;
  unitId?: string;
  unitName?: string;
  subunitId?: string;
  subunitName?: string;
  subunitText?: string;
  // Cambridge Curriculum fields
  strandId?: string;
  strandName?: string;
  substrandId?: string;
  substrandName?: string;
  objectiveId?: string;
  objectiveCode?: string;
  objectiveDescription?: string;
  // Cambridge Book fields
  bookUnitId?: string;
  bookUnitNumber?: number;
  bookUnitTitle?: string;
  bookUnitPages?: string;
  bookSubsectionId?: string;
  bookSubsectionCode?: string;
  bookSubsectionTitle?: string;
}

export interface SubunitData {
  subunitNumber: number;
  lessonsPerSubunit: number;
  subunitName: string;
  content: string;
  priorKnowledgeSubjectSpecific: string[];
  priorKnowledgeLearningSkills: string[];
  topicsTerminology: string[];
  conceptualKnowledge: string[];
  proceduralKnowledge: string[];
  successCriteria: string[];
  activities: string;
  learningExperiences: string;
  differentiation: string;
  summativeAssessment: string;
  interimAssessment: string;
  formativeAssessment: string;
}

export interface AssessmentTask {
  id: string;
  taskTitle: string;
  taskDescription: string;
  criterionID: string; // Changed from 'A' | 'B' | 'C' | 'D' to string to support strand IDs
  criterionDescription: string;
}

export interface ATLCard {
  id: string;
  categoryCluster: string; // e.g., "Thinking/Critical thinking"
  atlSupport: string;
  atlStrategyName: string;
  atlStrategyDescription: string;
}

export interface ActivityCard {
  id: string;
  activityName: string;
  activityDescription: string;
  activityFormativeAssessmentTitle: string;
}

export interface LearningExperienceCard {
  id: string;
  learningExperienceDayRange: string; // e.g., "1" or "1-2"
  learningExperienceHoursCount: string;
  learningExperienceName: string;
  learningExperienceDescription: string;
  learningExperienceFormativeAssessment: string;
  activities: ActivityCard[];
}

export interface UnitPlanData {
  schoolName: string;
  unitTitle: string;
  unitContent: string;
  academicYear: string;
  subject: string;
  unitOrder?: number; // Optional order number for sorting units
  outputMapping: "current" | "enhanced" | "custom";
  viewingMode?: "individual" | "year"; // Deprecated: now managed globally
  specifiedConcepts: string[];
  keyConcepts: string[];
  relatedConcepts: string[];
  conceptualUnderstandings: string;
  globalContext: string;
  globalContextExplanation: string;
  inquiryStatement: string;
  factualQuestions: string[];
  conceptualQuestions: string[];
  debatableQuestions: string[];
  objectives: string[];
  assessmentTitle: string;
  summativeAssessment: string;
  summativeAssessmentRelationshipDescription: string;
  assessmentTasks: AssessmentTask[];
  assessmentType: string;
  commandTerms: string[];
  individualContext: string;
  localContext: string;
  globalContextLens: string;
  atlSkills: string[];
  atlStrategies: string;
  atlCards: ATLCard[];
  learningExperienceCards: LearningExperienceCard[];
  subunits: SubunitData[];
  priorKnowledgeSubjectSpecific: string[];
  priorKnowledgeLearningSkills: string[];
  topicsTerminology: string[];
  conceptualKnowledge: string[];
  proceduralKnowledge: string[];
  informalFormativeAssessment: string[];
  formalFormativeAssessment: string[];
  differentiationByAccess: string[];
  differentiationByProcess: string[];
  differentiationByProduct: string[];
  resources: string;
  printedResources: string[];
  digitalResources: string[];
  guestsResources: string[];
  communityEngagement: string;
  reflectionPriorToTeaching: string;
  reflectionDuringTeaching: string;
  reflectionAfterTeaching: string;
  reflectionFuturePlanning: string;
  contributingTeachers: string[];
  lessonCount: number;
  mypYear: number;
  curriculumConnections?: CurriculumConnection[];
}

export type ActiveSection =
  | "guide"
  | "basic-info"
  | "content"
  | "inquiry"
  | "summative-assessment"
  | "atl"
  | "planning"
  | "resources"
  | "community-engagement"
  | "reflection"
  | "preview"
  | "content-display"
  | "data-management"
  | "settings";

export type QuestionType = "factualQuestions" | "conceptualQuestions" | "debatableQuestions";

export interface Subject {
  id: string;
  name: string;
  specifiedConcepts: string[];
  keyConcepts: string[];
  relatedConcepts: string[];
  displayName?: string;
}

export interface SubjectConcepts {
  [key: string]: string[];
}

export interface UnitPlanDocument {
  id: string;
  name: string;
  data: UnitPlanData;
  lastModified: Date;
}
