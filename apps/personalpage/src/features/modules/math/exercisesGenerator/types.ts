import { MathInput } from "@math/types/index";

/**
 * Allowed types for an exercise.
 */
export const exerciseTypeOptions = ["test", "text"] as const;
/**
 * Type representing the possible types of an exercise.
 */
export type ExerciseType = (typeof exerciseTypeOptions)[number];

/**
 * Allowed topic types for an exercise.
 */
export const topicTypeOptions = [
  "sets",
  "equations",
  "terms",
  "functions",
  "inequalities",
] as const;
/**
 * Type representing the possible topic types of an exercise.
 */
export type TopicType = (typeof topicTypeOptions)[number];

/**
 * Allowed difficulty levels for an exercise.
 */
export const difficultyTypeOptions = ["easy", "medium", "hard"] as const;
/**
 * Type representing the possible difficulty levels of an exercise.
 */
export type DifficultyType = (typeof difficultyTypeOptions)[number];

/**
 * Interface representing the data structure for a book document.
 */
export interface BookDocumentData {
  /** Unique identifier for the book. */
  id: string;
  /** Title of the book. */
  title: string;
  /** Author of the book. */
  author: string;
  /** Record mapping section IDs to their exercise count. */
  sections: Record<string, number>;
}

/**
 * Interface representing the data structure for a section document within a book.
 */
export interface SectionDocumentData {
  /** Unique identifier for the section. */
  id: string;
  /** Title of the section. */
  title: string;
  /** Number of exercises in the section. */
  count: number;
}

/**
 * Interface representing the data structure for an exercise document.
 */
export interface ExerciseDocumentData {
  /** Unique identifier for the exercise. */
  id: string;
  /** Type of the exercise (e.g., 'test', 'text'). */
  exerciseType: ExerciseType;
  /** Points awarded for completing the exercise. */
  points: number;
  /** Topic category of the exercise. */
  topicType: TopicType;
  /** Difficulty level of the exercise. */
  difficultyType: DifficultyType;
  /** Number of steps involved in the exercise solution. */
  steps: number;
  /** Array of strings representing the question text. */
  question: string[];
  /** Array of MathInput objects for interactive elements. */
  inputs: MathInput[];
  /** Array of options for multiple-choice questions. */
  options: string[];
  /** Array of strings representing TikZ picture code. */
  tikzPicture: string[];
  /** The correct answer to the exercise. */
  answer: string;
  /** Explanation or solution steps for the exercise. */
  explanation: string;
  /** The sequential number of the exercise within its context (e.g., section). */
  exerciseNumber: number;
  /** Date the exercise was created. */
  dateCreated: string;
  /** Date the exercise was last modified. */
  lastModified: string;
}

/**
 * Interface representing the state for navigation within the exercise database.
 */
export interface NavigationState {
  /** Array of available books. */
  books: BookDocumentData[];
  /** The currently selected book, or null if none selected. */
  selectedBook: BookDocumentData | null;
  /** Array of sections within the selected book. */
  sections: SectionDocumentData[];
  /** The currently selected section, or null if none selected. */
  selectedSection: SectionDocumentData | null;
  /** Array of exercises within the selected section. */
  exercises: ExerciseDocumentData[];
  /** The currently selected exercise, or null if none selected. */
  selectedExercise: ExerciseDocumentData | null;
  /** Index of the currently viewed exercise within the 'exercises' array. */
  currentIndex: number;
  /** Flag indicating if data is currently being loaded. */
  loading: boolean;
  /** Array of strings representing a generated exercise (potentially for preview). */
  generatedExercise: string[];
  /** Error message, or null if no error occurred. */
  error: string | null;
}
