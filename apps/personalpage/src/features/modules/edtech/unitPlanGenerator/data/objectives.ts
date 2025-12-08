export interface ObjectiveStrand {
  id: string;
  description: string;
  objectiveId: string; // Reference to parent objective
  fullId: string; // Unique identifier like "A-i", "B-ii", etc.
}

export interface Objective {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  strands: ObjectiveStrand[];
  keyLearningExpectations: string[];
  assessmentNotes?: string;
}

export const OBJECTIVES: Objective[] = [
  {
    id: "A",
    name: "A - Knowing and Understanding",
    description: "Knowledge and conceptual understanding",
    detailedDescription:
      "Knowledge and understanding are fundamental to studying mathematics and form the base from which to explore concepts and develop skills. This objective assesses the extent to which students can select and apply mathematics to solve problems in both familiar and unfamiliar situations in a variety of contexts.",
    strands: [
      {
        id: "i",
        objectiveId: "A",
        fullId: "A-i",
        description:
          "Select appropriate mathematics when solving problems in both familiar and unfamiliar situations",
      },
      {
        id: "ii",
        objectiveId: "A",
        fullId: "A-ii",
        description: "Apply the selected mathematics successfully when solving problems",
      },
      {
        id: "iii",
        objectiveId: "A",
        fullId: "A-iii",
        description: "Solve problems correctly in a variety of contexts",
      },
    ],
    keyLearningExpectations: [
      "Demonstrate knowledge and understanding of concepts and skills",
      "Apply mathematics to solve problems in familiar and unfamiliar situations",
      "Work with the four branches: numerical and abstract reasoning, thinking with models, spatial reasoning, and reasoning with data",
    ],
  },
  {
    id: "B",
    name: "B - Investigating Patterns",
    description: "Investigating patterns and relationships",
    detailedDescription:
      "Investigating patterns allows students to experience the excitement and satisfaction of mathematical discovery. Working through investigations encourages students to become risk-takers, inquirers and critical thinkers. The ability to inquire is invaluable in the MYP and contributes to lifelong learning.",
    strands: [
      {
        id: "i",
        objectiveId: "B",
        fullId: "B-i",
        description:
          "Select and apply mathematical problem-solving techniques to discover complex patterns",
      },
      {
        id: "ii",
        objectiveId: "B",
        fullId: "B-ii",
        description: "Describe patterns as general rules consistent with findings",
      },
      {
        id: "iii",
        objectiveId: "B",
        fullId: "B-iii",
        description: "Prove, or verify and justify, general rules",
      },
    ],
    keyLearningExpectations: [
      "Experience mathematical discovery through investigations",
      "Develop risk-taking and inquiry skills",
      "Become critical thinkers through pattern analysis",
      "Formulate and justify general rules from patterns",
    ],
    assessmentNotes:
      "Tasks that are too guided (not allowing students to select problem-solving techniques) should result in a maximum achievement level of 6 (years 1-2) or 4 (year 3+). For year 3+, students describing general rules consistent with incorrect findings can achieve up to level 6 if the rule is of equivalent complexity.",
  },
  {
    id: "C",
    name: "C - Communicating",
    description: "Communicating in mathematics",
    detailedDescription:
      "Mathematics provides a powerful and universal language. Students are expected to use appropriate mathematical language and different forms of representation when communicating mathematical ideas, reasoning and findings, both orally and in writing.",
    strands: [
      {
        id: "i",
        objectiveId: "C",
        fullId: "C-i",
        description:
          "Use appropriate mathematical language (notation, symbols and terminology) in both oral and written explanations",
      },
      {
        id: "ii",
        objectiveId: "C",
        fullId: "C-ii",
        description: "Use appropriate forms of mathematical representation to present information",
      },
      {
        id: "iii",
        objectiveId: "C",
        fullId: "C-iii",
        description: "Move between different forms of mathematical representation",
      },
      {
        id: "iv",
        objectiveId: "C",
        fullId: "C-iv",
        description: "Communicate complete, coherent and concise mathematical lines of reasoning",
      },
      {
        id: "v",
        objectiveId: "C",
        fullId: "C-v",
        description: "Organize information using a logical structure",
      },
    ],
    keyLearningExpectations: [
      "Use mathematical language effectively in oral and written communication",
      "Employ appropriate mathematical representations",
      "Demonstrate flexibility in moving between different forms of representation",
      "Present coherent and logical mathematical reasoning",
      "Organize mathematical information systematically",
    ],
  },
  {
    id: "D",
    name: "D - Applying Mathematics in Real-Life Contexts",
    description: "Applying mathematics in real-world contexts",
    detailedDescription:
      "MYP mathematics encourages students to see mathematics as a tool for solving problems in an authentic real-life context. Students are expected to transfer theoretical mathematical knowledge into real-world situations and apply appropriate problem-solving strategies, draw valid conclusions and reflect upon their results.",
    strands: [
      {
        id: "i",
        objectiveId: "D",
        fullId: "D-i",
        description: "Identify relevant elements of authentic real-life situations",
      },
      {
        id: "ii",
        objectiveId: "D",
        fullId: "D-ii",
        description:
          "Select appropriate mathematical strategies when solving authentic real-life situations",
      },
      {
        id: "iii",
        objectiveId: "D",
        fullId: "D-iii",
        description: "Apply the selected mathematical strategies successfully to reach a solution",
      },
      {
        id: "iv",
        objectiveId: "D",
        fullId: "D-iv",
        description: "Justify the degree of accuracy of a solution",
      },
      {
        id: "v",
        objectiveId: "D",
        fullId: "D-v",
        description:
          "Justify whether a solution makes sense in the context of the authentic real-life situation",
      },
    ],
    keyLearningExpectations: [
      "Transfer theoretical knowledge to real-world applications",
      "Apply problem-solving strategies in authentic contexts",
      "Draw valid conclusions from mathematical analysis",
      "Reflect critically on mathematical solutions",
      "Justify the appropriateness and accuracy of solutions",
    ],
  },
];

// Create a flattened list of all strands for selection
export const ALL_STRANDS: ObjectiveStrand[] = OBJECTIVES.flatMap((objective) =>
  objective.strands.map((strand) => ({
    ...strand,
    objectiveName: objective.name,
    objectiveDescription: objective.description,
  }))
);

export const getObjectiveById = (id: string): Objective | undefined => {
  return OBJECTIVES.find((objective) => objective.id === id);
};

// Helper function to get all strands for a specific objective
export const getObjectiveStrands = (objectiveId: string): ObjectiveStrand[] => {
  const objective = getObjectiveById(objectiveId);
  return objective?.strands || [];
};

// Helper function to get strand by ID
export const getStrandById = (
  objectiveId: string,
  strandId: string
): ObjectiveStrand | undefined => {
  const objective = getObjectiveById(objectiveId);
  return objective?.strands.find((strand) => strand.id === strandId);
};

// Helper function to get strand by full ID
export const getStrandByFullId = (fullId: string): ObjectiveStrand | undefined => {
  return ALL_STRANDS.find((strand) => strand.fullId === fullId);
};

// Helper function to get all objectives with their strands
export const getAllObjectivesWithStrands = (): Objective[] => {
  return OBJECTIVES;
};

// Helper function to format objective for display
export const formatObjectiveForDisplay = (objectiveId: string): string => {
  const objective = getObjectiveById(objectiveId);
  if (!objective) return objectiveId;

  return `${objective.id} - ${objective.name.split(" - ")[1]}`;
};

// Helper function to format strand for display
export const formatStrandForDisplay = (fullId: string): string => {
  const strand = getStrandByFullId(fullId);
  if (!strand) return fullId;

  return `${strand.objectiveId}-${strand.id}. ${strand.description}`;
};

// Helper function to get objective summary for tooltips
export const getObjectiveSummary = (objectiveId: string): string => {
  const objective = getObjectiveById(objectiveId);
  if (!objective) return "";

  return `${objective.description}\n\nKey expectations:\n${objective.keyLearningExpectations
    .slice(0, 2)
    .map((exp) => `• ${exp}`)
    .join("\n")}`;
};

// Helper function to get strand summary for tooltips
export const getStrandSummary = (fullId: string): string => {
  const strand = getStrandByFullId(fullId);
  if (!strand) return "";

  const objective = getObjectiveById(strand.objectiveId);
  if (!objective) return strand.description;

  return `${objective.name}\n\n${strand.description}\n\nThis strand focuses on: ${strand.description.toLowerCase()}`;
};

// Helper function to check if an ID is an objective or strand
export const isObjectiveId = (id: string): boolean => {
  return OBJECTIVES.some((obj) => obj.id === id);
};

export const isStrandId = (id: string): boolean => {
  return ALL_STRANDS.some((strand) => strand.fullId === id);
};

// Helper function to get parent objective from strand ID
export const getParentObjective = (fullId: string): Objective | undefined => {
  const strand = getStrandByFullId(fullId);
  if (!strand) return undefined;

  return getObjectiveById(strand.objectiveId);
};
