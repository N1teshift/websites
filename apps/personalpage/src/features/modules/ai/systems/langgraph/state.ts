/**
 * @file Defines the state schema (`GraphStateType`) and update logic (reducers)
 * for the LangGraph workflow used in AI feature processing.
 * State is managed using Zod schemas for robust type safety and validation.
 */
// Defines the state object passed between nodes in the LangGraph
import { z } from "@websites/infrastructure/api/zod";
import { ObjectType, MathInput } from "@math/types/index"; // Import ObjectType directly

/**
 * Generic type representing the settings extracted for any mathematical object.
 * Allows for arbitrary properties while optionally including common fields like `subObjectPromptParts`.
 */
export type ObjectSettings = {
  [key: string]: unknown;
} & {
  // Common fields that might be in various settings
  subObjectPromptParts?: string[];
};

/**
 * Defines the structure of an entry in the `contextStack`.
 * Each entry represents a parent object whose sub-objects are currently being processed.
 */
export type ProcessingContext = {
  /** The type of the parent object awaiting its sub-objects. */
  parentObjectType: ObjectType;
  /** The settings of the parent object *before* processing its sub-objects. */
  parentBaseSettings: ObjectSettings;
  /** The list of remaining user prompt parts identified for the parent's sub-objects. */
  pendingSubPrompts: string[];
  /** The expected type of the next sub-object to be processed (if known). */
  expectedSubObjectType: ObjectType | undefined;
  /** The settings of sub-objects already processed and collected for the current parent. */
  collectedSubSettings: ObjectSettings[];
  /** The key in `parentBaseSettings` where `collectedSubSettings` should be stored upon completion. */
  subSettingsKey: string | undefined;
  /** Flag indicating if the parent expects a single sub-object (true) or an array of sub-objects (false). */
  expectsSingleSubObject: boolean;
};

// Create a Zod enum from the ObjectType values (Assuming ObjectType is an enum or similar structure)
// If ObjectType is just a string union, this needs adjustment. Let's assume it can map to enum-like values.
// We need the actual list of valid ObjectType strings.
const ObjectTypeValues = [
  "coefficient",
  "coefficients",
  "term",
  "terms",
  "expression",
  "equation",
  "inequality",
  "function",
  "point",
  "set",
  "interval",
] as const; // Use the actual types
const ObjectTypeEnum = z.enum(ObjectTypeValues);

/**
 * @internal
 * Zod schema for validating `ObjectSettings`.
 */
const ObjectSettingsSchema = z.record(z.string(), z.unknown()).and(
  z.object({
    subObjectPromptParts: z.array(z.string()).optional(),
  })
);

/**
 * Zod schema defining the complete state object for the LangGraph workflow.
 * This schema is used by LangGraph to manage and validate the state between nodes.
 */
export const GraphStateSchema = z.object({
  // --- Initial Input ---
  /** Optional initial messages, often used if continuing a conversation. Defaults to empty array. */
  messages: z
    .array(
      z.object({
        role: z.string(),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
  /** The initial user prompt that starts the graph execution. */
  userPrompt: z.string(),

  // --- Type Identification ---
  /** The top-level object type identified from the `userPrompt`. */
  identifiedType: ObjectTypeEnum.optional(),

  // --- Processing State ---
  /** The `ObjectType` of the object currently being processed (could be top-level or a sub-object). */
  currentObjectType: ObjectTypeEnum.optional(),
  /** The specific part of the user prompt relevant to the `currentObjectType`. */
  currentPrompt: z.string().optional(),
  /** The settings extracted for the `currentObjectType` by the settings extractor node. */
  currentSettings: ObjectSettingsSchema.optional(),

  // --- Context Stack ---
  /**
   * Stack maintaining the context of parent objects when recursively processing nested structures.
   * Each element represents a parent waiting for its children.
   * Defaults to an empty array.
   */
  contextStack: z
    .array(
      z.object({
        // Zod schema for ProcessingContext
        parentObjectType: ObjectTypeEnum,
        parentBaseSettings: ObjectSettingsSchema,
        pendingSubPrompts: z.array(z.string()),
        expectedSubObjectType: ObjectTypeEnum.optional(),
        collectedSubSettings: z.array(ObjectSettingsSchema),
        subSettingsKey: z.string().optional(),
        expectsSingleSubObject: z.boolean(), // NEW: Add Zod validation for the new flag
      })
    )
    .default([]), // Default to empty stack

  // --- Final Output ---
  /**
   * Array accumulating the fully processed `MathInput` objects.
   * Defaults to an empty array.
   */
  // Using z.custom to allow the more complex MathInput type
  accumulatedObjects: z.array(z.custom<MathInput>()).default([]),

  // --- Metadata / Error Handling ---
  /** Array accumulating validation errors encountered during processing. Defaults to empty array. */
  validationErrors: z.array(z.string()).default([]),
  /** Stores any critical error message that halts graph execution. */
  error: z.string().optional(),
});

/**
 * TypeScript type inferred from the `GraphStateSchema`.
 * Represents the structure of the state object passed between graph nodes.
 */
export type GraphStateType = z.infer<typeof GraphStateSchema>;

/**
 * @internal
 * Type helper matching LangGraph's internal expectation for state update reducers.
 */
type SingleReducer<V, U> = (currentValue: V | undefined, update: U | undefined) => V | undefined;

/**
 * @internal
 * Default reducer behavior (last write wins / replace).
 * Kept for reference, not actively used where array reducers are specified.
 */
function _defaultReducer<T>(): SingleReducer<T, T> {
  return (a: T | undefined, b: T | undefined): T | undefined => b ?? a;
}

/**
 * @internal
 * Generic reducer function for state properties that are arrays.
 * Appends new items (single or array) to the existing array.
 * @template T The type of elements in the array.
 * @returns {SingleReducer<T[], T | T[]>} A reducer function for appending to arrays.
 */
function arrayReducer<T>(): SingleReducer<T[], T | T[]> {
  return (a: T[] | undefined, b: T | T[] | undefined): T[] => {
    const current = a ?? [];
    if (b === undefined) return current;
    const additions = Array.isArray(b) ? b : [b];
    return [...current, ...additions];
  };
}

/**
 * @internal
 * Type definition for the `stateKeysUpdate` object, ensuring correct reducer types
 * are associated with specific state keys (especially array types).
 */
export type StateKeyReducers = {
  [K in keyof GraphStateType]?: K extends "validationErrors"
    ? SingleReducer<string[], string | string[]>
    : K extends "accumulatedObjects"
      ? SingleReducer<MathInput[], MathInput | MathInput[]>
      : K extends "messages"
        ? SingleReducer<
            { role: string; content: string }[],
            { role: string; content: string } | { role: string; content: string }[]
          >
        : SingleReducer<GraphStateType[K], GraphStateType[K]>;
};

/**
 * Configuration object mapping specific state keys to their update reducer functions.
 * Used by LangGraph's `StateGraph` constructor to define how state updates are merged.
 * Keys *not* listed here implicitly use the default reducer (last write wins/replace).
 */
// Define reducers for state keys that need array handling or specific logic
// 'contextStack' typically uses the default reducer (replace) unless specific stack manipulation is needed via updates.
export const stateKeysUpdate: StateKeyReducers = {
  /** Appends new validation errors to the existing array. */
  validationErrors: arrayReducer<string>(),
  /** Appends newly completed MathInput objects to the existing array. */
  accumulatedObjects: arrayReducer<MathInput>(),
  /** Appends new messages to the existing message array. */
  messages: arrayReducer<{ role: string; content: string }>(),
  // contextStack uses default replacement behavior implicitly if not listed here
};
