import { UnitPlanData } from "../types/UnitPlanTypes";

// Field completion thresholds
export interface FieldThreshold {
  minWords: number;
  minSentences: number;
  description: string;
  minItems?: number; // For array fields
  maxItems?: number; // For array fields
}

// Define which fields are text fields (should be considered complete with 1+ character)
const textFields: (keyof UnitPlanData)[] = [
  "schoolName",
  "unitTitle",
  "academicYear",
  "subject",
  "conceptualUnderstandings",
  "globalContext",
  "globalContextExplanation",
  "inquiryStatement",
  "assessmentTitle",
  "summativeAssessment",
  "assessmentType",
  "individualContext",
  "localContext",
  "globalContextLens",
  "atlStrategies",
  "priorKnowledgeSubjectSpecific",
  "priorKnowledgeLearningSkills",
  "resources",
  "printedResources",
  "digitalResources",
  "guestsResources",
  "communityEngagement",
  "reflectionPriorToTeaching",
  "reflectionDuringTeaching",
  "reflectionAfterTeaching",
  "reflectionFuturePlanning",
];

// Define completion thresholds for each field
export const fieldThresholds: Record<keyof UnitPlanData, FieldThreshold> = {
  // Basic info - minimal thresholds
  schoolName: { minWords: 1, minSentences: 1, description: "School name" },
  academicYear: { minWords: 1, minSentences: 1, description: "Academic year" },
  subject: { minWords: 1, minSentences: 1, description: "Subject" },
  mypYear: { minWords: 1, minSentences: 1, description: "MYP year" },
  contributingTeachers: { minWords: 1, minSentences: 1, description: "Contributing teachers" },
  unitTitle: { minWords: 2, minSentences: 1, description: "Unit title" },
  unitOrder: { minWords: 1, minSentences: 1, description: "Unit order" },

  // Inquiry fields - moderate thresholds
  outputMapping: { minWords: 1, minSentences: 1, description: "Output mapping" },
  viewingMode: { minWords: 1, minSentences: 1, description: "Viewing mode" },
  unitContent: { minWords: 10, minSentences: 2, description: "Unit content" },
  specifiedConcepts: {
    minWords: 3,
    minSentences: 1,
    description: "Specified concepts",
    minItems: 2,
    maxItems: 3,
  },
  keyConcepts: {
    minWords: 3,
    minSentences: 1,
    description: "Key concepts",
    minItems: 1,
    maxItems: 5,
  },
  relatedConcepts: {
    minWords: 3,
    minSentences: 1,
    description: "Related concepts",
    minItems: 0,
    maxItems: 5,
  },
  conceptualUnderstandings: {
    minWords: 10,
    minSentences: 2,
    description: "Conceptual understandings",
  },
  globalContext: { minWords: 2, minSentences: 1, description: "Global context" },
  globalContextExplanation: {
    minWords: 20,
    minSentences: 3,
    description: "Global context explanation",
  },
  inquiryStatement: { minWords: 6, minSentences: 1, description: "Inquiry statement" },

  // Question fields - moderate thresholds
  factualQuestions: { minWords: 10, minSentences: 2, description: "Factual questions" },
  conceptualQuestions: { minWords: 10, minSentences: 2, description: "Conceptual questions" },
  debatableQuestions: { minWords: 10, minSentences: 2, description: "Debatable questions" },

  // Planning fields - moderate to high thresholds
  objectives: {
    minWords: 2,
    minSentences: 1,
    description: "Objectives/Strands",
    minItems: 4,
    maxItems: 16,
  }, // Updated for strands
  assessmentTitle: { minWords: 2, minSentences: 1, description: "Assessment title" },
  assessmentType: { minWords: 2, minSentences: 1, description: "Assessment type" },
  summativeAssessment: { minWords: 20, minSentences: 3, description: "Summative assessment" },
  summativeAssessmentRelationshipDescription: {
    minWords: 15,
    minSentences: 2,
    description: "Relationship between summative assessment and inquiry statement",
  },
  assessmentTasks: {
    minWords: 1,
    minSentences: 1,
    description: "Assessment tasks",
    minItems: 0,
    maxItems: 10,
  },
  commandTerms: {
    minWords: 2,
    minSentences: 1,
    description: "Command terms",
    minItems: 2,
    maxItems: 3,
  },
  atlSkills: { minWords: 3, minSentences: 1, description: "ATL skills", minItems: 2, maxItems: 3 },
  atlStrategies: { minWords: 10, minSentences: 2, description: "ATL strategies" },
  atlCards: { minWords: 1, minSentences: 1, description: "ATL cards", minItems: 0, maxItems: 10 },
  learningExperienceCards: {
    minWords: 1,
    minSentences: 1,
    description: "Learning Experience cards",
    minItems: 0,
    maxItems: 10,
  },
  individualContext: { minWords: 10, minSentences: 2, description: "Individual context" },
  localContext: { minWords: 10, minSentences: 2, description: "Local context" },
  globalContextLens: { minWords: 10, minSentences: 2, description: "Global context lens" },

  // Resources & Community - high thresholds
  resources: { minWords: 15, minSentences: 2, description: "Unit resources" },
  printedResources: {
    minWords: 1,
    minSentences: 1,
    description: "Printed resources",
    minItems: 0,
    maxItems: 10,
  },
  digitalResources: {
    minWords: 1,
    minSentences: 1,
    description: "Digital resources",
    minItems: 0,
    maxItems: 10,
  },
  guestsResources: {
    minWords: 1,
    minSentences: 1,
    description: "Guests resources",
    minItems: 0,
    maxItems: 10,
  },
  communityEngagement: { minWords: 15, minSentences: 2, description: "Community engagement" },

  // Reflection fields - high thresholds
  reflectionPriorToTeaching: {
    minWords: 20,
    minSentences: 3,
    description: "Reflection prior to teaching",
  },
  reflectionDuringTeaching: {
    minWords: 20,
    minSentences: 3,
    description: "Reflection during teaching",
  },
  reflectionAfterTeaching: {
    minWords: 25,
    minSentences: 3,
    description: "Reflection after teaching",
  },
  reflectionFuturePlanning: {
    minWords: 25,
    minSentences: 3,
    description: "Reflection future planning",
  },

  // Subunit fields - will be handled separately
  subunits: { minWords: 0, minSentences: 0, description: "Subunits" },
  priorKnowledgeSubjectSpecific: {
    minWords: 10,
    minSentences: 2,
    description: "Subject specific prior knowledge",
  },
  priorKnowledgeLearningSkills: { minWords: 10, minSentences: 2, description: "Learning skills" },
  topicsTerminology: {
    minWords: 1,
    minSentences: 1,
    description: "Topics/Terminology",
    minItems: 0,
    maxItems: 10,
  },
  conceptualKnowledge: {
    minWords: 1,
    minSentences: 1,
    description: "Conceptual Knowledge",
    minItems: 0,
    maxItems: 10,
  },
  proceduralKnowledge: {
    minWords: 1,
    minSentences: 1,
    description: "Procedural Knowledge",
    minItems: 0,
    maxItems: 10,
  },
  informalFormativeAssessment: {
    minWords: 1,
    minSentences: 1,
    description: "Informal formative assessment",
    minItems: 0,
    maxItems: 10,
  },
  formalFormativeAssessment: {
    minWords: 1,
    minSentences: 1,
    description: "Formal formative assessment",
    minItems: 0,
    maxItems: 10,
  },
  differentiationByAccess: {
    minWords: 1,
    minSentences: 1,
    description: "Differentiation by access",
    minItems: 0,
    maxItems: 10,
  },
  differentiationByProcess: {
    minWords: 1,
    minSentences: 1,
    description: "Differentiation by process",
    minItems: 0,
    maxItems: 10,
  },
  differentiationByProduct: {
    minWords: 1,
    minSentences: 1,
    description: "Differentiation by product",
    minItems: 0,
    maxItems: 10,
  },
  lessonCount: { minWords: 1, minSentences: 1, description: "Lesson count" },
  curriculumConnections: {
    minWords: 1,
    minSentences: 1,
    description: "Curriculum connections",
    minItems: 0,
    maxItems: 20,
  },
};

// Helper functions
export const countWords = (text: string): number => {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
};

export const countSentences = (text: string): number => {
  return text.split(/[.!?]+/).filter((sentence) => sentence.trim().length > 0).length;
};

export const countCharacters = (text: string): number => {
  return text.trim().length;
};

// Check if a field is completed
export const isFieldCompleted = (
  fieldName: keyof UnitPlanData,
  value: UnitPlanData[keyof UnitPlanData]
): boolean => {
  if (!value || value === "") return false;

  const threshold = fieldThresholds[fieldName];
  const text = String(value);

  // Handle array fields (like specifiedConcepts, commandTerms, etc.)
  if (Array.isArray(value)) {
    const validItems = value.filter((item) => String(item).trim().length > 0);

    // Special handling for objectives (strands)
    if (fieldName === "objectives") {
      // For strands, we want at least 4 strands selected (minimum requirement)
      // and ideally cover all 4 objectives (A, B, C, D)
      if (validItems.length < 4) return false;

      // Check if we have strands from all 4 objectives
      const objectiveIds = new Set(validItems.map((item) => String(item).split("-")[0]));
      return objectiveIds.size >= 2; // At least 2 different objectives covered
    }

    // Check if we have min/max item thresholds
    if (threshold.minItems !== undefined && threshold.maxItems !== undefined) {
      return validItems.length >= threshold.minItems && validItems.length <= threshold.maxItems;
    }

    // Default behavior for other array fields
    return validItems.length > 0;
  }

  // Handle subunit fields
  if (fieldName === "subunits" && Array.isArray(value)) {
    return (
      value.length > 0 &&
      value.every((subunit) => subunit.content && countWords(subunit.content) >= 1)
    );
  }

  // For text fields, consider complete if at least one character is written
  if (textFields.includes(fieldName)) {
    return countCharacters(text) >= 1;
  }

  // For non-text fields (like numbers), use the original logic
  const words = countWords(text);
  const sentences = countSentences(text);

  return words >= threshold.minWords && sentences >= threshold.minSentences;
};

// Get field completion status with details
export const getFieldCompletionStatus = (
  fieldName: keyof UnitPlanData | string,
  value: UnitPlanData[keyof UnitPlanData] | string
) => {
  // Handle lesson-specific fields that are not in UnitPlanData
  const lessonFieldThresholds: Record<string, FieldThreshold> = {
    content: { minWords: 1, minSentences: 1, description: "Lesson content" },
    successCriteria: { minWords: 6, minSentences: 1, description: "Success criteria" },
    activities: { minWords: 10, minSentences: 2, description: "Activities" },
    learningExperiences: { minWords: 10, minSentences: 2, description: "Learning experiences" },
    differentiation: { minWords: 8, minSentences: 2, description: "Differentiation" },
    summativeAssessment: { minWords: 6, minSentences: 1, description: "Summative assessment" },
    interimAssessment: { minWords: 6, minSentences: 1, description: "Interim assessment" },
    formativeAssessment: { minWords: 6, minSentences: 1, description: "Formative assessment" },
  };

  // Get the appropriate threshold
  const threshold =
    (fieldThresholds as Record<string, FieldThreshold>)[fieldName] ||
    lessonFieldThresholds[fieldName];

  if (!threshold) {
    // Fallback for unknown fields
    return {
      completed: false,
      progress: 0,
      message: `Fill in ${fieldName}`,
      color: "text-gray-500",
    };
  }

  if (!value || value === "") {
    return {
      completed: false,
      progress: 0,
      message: `Fill in ${threshold.description}`,
      color: "text-gray-500",
    };
  }
  const text = String(value);

  // Handle array fields (like multiselectors)
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return {
        completed: false,
        progress: 0,
        message: `Add at least one ${threshold.description.toLowerCase()}`,
        color: "text-gray-500",
      };
    }

    // For multiselectors, consider an item complete if it has any content
    const completedItems = value.filter((item) => String(item).trim().length > 0);
    const progress = (completedItems.length / value.length) * 100;

    // Special handling for objectives (strands)
    if (fieldName === "objectives") {
      const objectiveIds = new Set(completedItems.map((item) => String(item).split("-")[0]));
      const objectivesCovered = objectiveIds.size;

      if (completedItems.length < 4) {
        return {
          completed: false,
          progress: 0,
          message: `Need ${4 - completedItems.length} more strands (minimum 4 required)`,
          color: "text-red-600",
        };
      } else if (objectivesCovered < 2) {
        return {
          completed: false,
          progress: 50,
          message: `Need strands from more objectives (currently ${objectivesCovered}/4 objectives)`,
          color: "text-yellow-600",
        };
      } else {
        return {
          completed: true,
          progress: 100,
          message: `✅ ${completedItems.length} strands selected from ${objectivesCovered} objectives`,
          color: "text-green-600",
        };
      }
    }

    // Check if we have min/max item thresholds (like for specified concepts)
    if (threshold.minItems !== undefined && threshold.maxItems !== undefined) {
      if (completedItems.length < threshold.minItems) {
        return {
          completed: false,
          progress: 0,
          message: `Need ${threshold.minItems - completedItems.length} more ${threshold.description.toLowerCase()}`,
          color: "text-red-600",
        };
      } else if (
        completedItems.length >= threshold.minItems &&
        completedItems.length <= threshold.maxItems
      ) {
        return {
          completed: true,
          progress: 100,
          message: `✅ ${completedItems.length} ${threshold.description.toLowerCase()} selected (perfect range)`,
          color: "text-green-600",
        };
      } else {
        return {
          completed: false,
          progress: 100,
          message: `⚠️ ${completedItems.length} items selected (consider reducing to ${threshold.maxItems})`,
          color: "text-yellow-600",
        };
      }
    }

    // Default behavior for other array fields
    if (progress === 100) {
      return {
        completed: true,
        progress: 100,
        message: `✅ ${value.length} items selected`,
        color: "text-green-600",
      };
    } else {
      return {
        completed: false,
        progress,
        message: `Need ${value.length - completedItems.length} more items`,
        color: "text-red-600",
      };
    }
  }

  // Handle subunit fields
  if (fieldName === "subunits" && Array.isArray(value)) {
    if (value.length === 0) {
      return {
        completed: false,
        progress: 0,
        message: "Add at least one subunit",
        color: "text-gray-500",
      };
    }

    const completedSubunits = value.filter(
      (subunit) => subunit.content && countWords(subunit.content) >= 1
    );
    const progress = (completedSubunits.length / value.length) * 100;

    if (progress === 100) {
      return {
        completed: true,
        progress: 100,
        message: `${value.length} subunits with content`,
        color: "text-green-600",
      };
    } else {
      return {
        completed: false,
        progress,
        message: `${completedSubunits.length}/${value.length} subunits have content`,
        color: "text-yellow-600",
      };
    }
  }

  // For text fields, show simple completion status without progression tracking
  if (textFields.includes(fieldName as keyof UnitPlanData)) {
    const characters = countCharacters(text);
    if (characters >= 1) {
      return {
        completed: true,
        progress: 100,
        message: `✅ ${threshold.description} completed`,
        color: "text-green-600",
      };
    } else {
      return {
        completed: false,
        progress: 0,
        message: `Fill in ${threshold.description}`,
        color: "text-gray-500",
      };
    }
  }

  // For non-text fields, use the original progression tracking logic
  const words = countWords(text);
  const sentences = countSentences(text);

  const wordProgress = Math.min((words / threshold.minWords) * 100, 100);
  const sentenceProgress = Math.min((sentences / threshold.minSentences) * 100, 100);

  const progress = Math.min(wordProgress, sentenceProgress);

  if (progress >= 100) {
    return {
      completed: true,
      progress: 100,
      message: `✅ Your input has exceeded the required threshold of ${threshold.minWords} words and ${threshold.minSentences} sentences`,
      color: "text-green-600",
    };
  } else {
    return {
      completed: false,
      progress,
      message: `Need ${threshold.minWords - words} more words, ${threshold.minSentences - sentences} more sentences`,
      color: "text-red-600",
    };
  }
};

// Calculate overall progress
export const calculateOverallProgress = (unitPlan: Partial<UnitPlanData>): number => {
  const fields = Object.keys(fieldThresholds) as (keyof UnitPlanData)[];
  const completedFields = fields.filter((field) => {
    const value = unitPlan[field];
    return (
      value !== undefined && isFieldCompleted(field, value as UnitPlanData[keyof UnitPlanData])
    );
  });

  return Math.round((completedFields.length / fields.length) * 100);
};

// Get progress breakdown by section
export const getSectionProgress = (unitPlan: Partial<UnitPlanData>) => {
  const sections = {
    "basic-info": [
      "schoolName",
      "academicYear",
      "subject",
      "mypYear",
      "contributingTeachers",
      "unitTitle",
    ],
    inquiry: [
      "specifiedConcepts",
      "conceptualUnderstandings",
      "globalContext",
      "globalContextExplanation",
      "inquiryStatement",
      "factualQuestions",
      "conceptualQuestions",
      "debatableQuestions",
    ],
    planning: [
      "objectives",
      "assessmentTitle",
      "assessmentType",
      "summativeAssessment",
      "commandTerms",
      "atlSkills",
      "atlStrategies",
    ],
    resources: ["resources"],
    "community-engagement": ["communityEngagement"],
    reflection: [
      "reflectionPriorToTeaching",
      "reflectionDuringTeaching",
      "reflectionAfterTeaching",
      "reflectionFuturePlanning",
    ],
    content: ["subunits", "lessonCount"],
  };

  const sectionProgress: Record<string, number> = {};

  Object.entries(sections).forEach(([section, fields]) => {
    const completedFields = fields.filter((field) => {
      const value = unitPlan[field as keyof UnitPlanData];
      return (
        value !== undefined &&
        isFieldCompleted(field as keyof UnitPlanData, value as UnitPlanData[keyof UnitPlanData])
      );
    });
    sectionProgress[section] = Math.round((completedFields.length / fields.length) * 100);
  });

  return sectionProgress;
};
