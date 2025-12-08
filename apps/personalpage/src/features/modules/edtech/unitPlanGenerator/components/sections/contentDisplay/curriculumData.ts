import { BUP_CURRICULUM, BUPGrade } from "../../../data/curriculumBUP";
import { CAMBRIDGE_CURRICULUM, CambridgeStage } from "../../../data/curriculumCambridge";

export interface CurriculumTopic {
  id: string;
  type: "bup" | "cambridge";
  title: string;
  description?: string;
  objectives?: string[]; // For Cambridge
  content?: string; // For BUP
  connections?: string[]; // IDs of connected topics in the other curriculum
  module?: string; // For BUP
  strand?: string; // For Cambridge
}

// Get BUP topics for a specific grade
export function getBUPTopics(grade: number): CurriculumTopic[] {
  const gradeData: BUPGrade | undefined = BUP_CURRICULUM.find((g: BUPGrade) => g.grade === grade);
  if (!gradeData) return [];

  const topics: CurriculumTopic[] = [];

  for (const curriculumModule of gradeData.modules) {
    for (const unit of curriculumModule.units) {
      for (const subunit of unit.subunits) {
        topics.push({
          id: subunit.id,
          type: "bup",
          title: subunit.name,
          content: subunit.originalText,
          module: curriculumModule.name,
          connections: [], // To be filled with connection logic
        });
      }
    }
  }

  return topics;
}

// Get Cambridge topics for a specific grade
export function getCambridgeTopics(grade: number): CurriculumTopic[] {
  const stageData: CambridgeStage | undefined = CAMBRIDGE_CURRICULUM.find(
    (s: CambridgeStage) => s.grade === grade
  );
  if (!stageData) return [];

  const topics: CurriculumTopic[] = [];

  for (const strand of stageData.strands) {
    for (const substrand of strand.substrands) {
      // Group objectives by substrand for display
      const objectivesList = substrand.objectives.map(
        (obj: { code: string; description: string; id: string }) => obj.description
      );

      topics.push({
        id: substrand.id,
        type: "cambridge",
        title: substrand.name,
        objectives: objectivesList,
        strand: strand.name,
        connections: [], // To be filled with connection logic
      });
    }
  }

  return topics;
}

// PROPOSED CONNECTION EXAMPLES - Manual mapping for demonstration
// These show different types of connections between curricula
export const EXAMPLE_CONNECTIONS: Record<string, string[]> = {
  // Grade 7 BUP to Cambridge Stage 8 (Grade 7)
  "g7-m1-u1-s1": ["s8-ni", "s8-8Ni.05"], // Powers → Integers/indices
  "g7-m2-u1-s1": ["s8-ae", "s8-8Ae.07"], // Inequalities → Algebra intervals
  "g7-m3-u2-s1": ["s8-gg"], // Plane figures → Geometrical reasoning
  "g7-m3-u2-s3": ["s8-gg"], // Area/volume calculations → Geometry measurements

  // Grade 8 BUP to Cambridge Stage 9 (Grade 8)
  "g8-m1-u1-s1": ["s9-ni", "s9-9Ni.04"], // Square/cube roots → Surds
  "g8-m1-u1-s2": ["s9-ni", "s9-9Ni.01"], // Number sets → Rational/irrational
  "g8-m2-u1-s2": ["s9-ae", "s9-9Ae.06"], // Equation systems → Simultaneous equations
  "g8-m3-u2-s1": ["s9-gg", "s9-9Gg.10"], // Pitagoro teorema → Pythagoras' theorem
};

// Apply example connections to topics
export function applyConnections(topics: CurriculumTopic[]): CurriculumTopic[] {
  return topics.map((topic) => ({
    ...topic,
    connections: EXAMPLE_CONNECTIONS[topic.id] || [],
  }));
}
