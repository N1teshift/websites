/**
 * @file Configures and compiles the LangGraph StateGraph for processing mathematical object requests.
 * Defines the graph structure, nodes, edges, and state management channels.
 *
 * This file contains the configuration for a LangGraph StateGraph workflow.
 * Due to TypeScript's limitations with the LangGraph API, we need to use
 * type assertions (`as any`) in some places when interacting with StateGraph methods.
 * However, we've improved type safety where possible by using GraphStateType and proper reducer types.
 */

import { StateGraph, END, START as _START } from "@langchain/langgraph/web";
import { RunnableLambda } from "@langchain/core/runnables";
import { GraphStateType, stateKeysUpdate, StateKeyReducers } from "./state";

// Import node functions from refactored modules
import { identify_object_type, start_settings_extraction } from "./nodes/identificationNodes";
import { extract_settings, push_context_and_prepare_descend } from "./nodes/processingNodes";
import { complete_current_level, finalize_object, handle_error } from "./nodes/completionNodes";

// Import conditional routing functions
import { should_descend_or_complete, should_continue_or_finalize } from "./conditionals";

/**
 * @internal
 * Defines the structure for LangGraph channels, specifying how state values are updated
 * and their default initial values.
 * Uses GraphStateType to provide better type safety than `any`.
 */
type ChannelType<K extends keyof GraphStateType = keyof GraphStateType> = {
  /** Reducer function to update the channel's value. */
  value: StateKeyReducers[K] extends infer R
    ? R extends (current: infer C, update: infer U) => infer V
      ? (current: C, update: U) => V
      : (
          current: GraphStateType[K] | undefined,
          update: GraphStateType[K] | undefined
        ) => GraphStateType[K] | undefined
    : (
        current: GraphStateType[K] | undefined,
        update: GraphStateType[K] | undefined
      ) => GraphStateType[K] | undefined;
  /** Function returning the default value for the channel. */
  default: () => GraphStateType[K] | undefined;
};

/**
 * @internal
 * Configuration object mapping state keys to their channel update and default logic.
 * Uses proper typing based on GraphStateType for better type safety.
 */
const channels: Partial<Record<keyof GraphStateType, ChannelType>> = {};

/**
 * @internal
 * Defines state keys that represent arrays and require specific initialization.
 */
// Define array fields that need special handling
const arrayFields = {
  messages: [],
  contextStack: [],
  accumulatedObjects: [],
  validationErrors: [],
};

// Set up channels for fields with reducers defined in stateKeysUpdate
Object.entries(stateKeysUpdate).forEach(([key, reducer]) => {
  const stateKey = key as keyof GraphStateType;
  channels[stateKey] = {
    value: reducer as any,
    // Use empty array as default for known array fields, otherwise default to empty array too (safer)
    default: () =>
      (arrayFields[key as keyof typeof arrayFields] !== undefined
        ? []
        : []) as GraphStateType[typeof stateKey],
  } as ChannelType;
});

// Add special handling for contextStack to ensure it's always initialized properly
// Ensure contextStack always defaults to empty array and updates correctly
channels["contextStack"] = {
  value: (
    _curr: GraphStateType["contextStack"] = [],
    update: GraphStateType["contextStack"] | undefined
  ) => update ?? [],
  default: () => [] as GraphStateType["contextStack"],
};

/**
 * @internal
 * List of non-array state fields that need basic default channel handling (last write wins).
 */
// Add default channels for non-array state fields that need to be preserved
const nonArrayFields = [
  "userPrompt",
  "identifiedType",
  "currentObjectType",
  "currentPrompt",
  "currentSettings",
  "error",
];

// Create default reducers for non-array fields (last write wins)
nonArrayFields.forEach((key) => {
  const stateKey = key as keyof GraphStateType;
  if (!channels[stateKey]) {
    channels[stateKey] = {
      value: (
        _current: GraphStateType[typeof stateKey] | undefined,
        update: GraphStateType[typeof stateKey] | undefined
      ) => update,
      default: () => undefined as GraphStateType[typeof stateKey] | undefined,
    };
  }
});

/**
 * @internal
 * The StateGraph builder instance, configured with state channels and default state values.
 * Uses `as any` for compatibility with LangGraph's typing.
 */
// Initialize the StateGraph with proper channel configuration
// Using type assertion for compatibility with LangGraph
const builder = new StateGraph({
  channels,
  // Define default state to ensure all arrays are properly initialized
  state: {
    messages: [],
    contextStack: [],
    accumulatedObjects: [],
    validationErrors: [],
    userPrompt: "",
    identifiedType: undefined,
    currentObjectType: undefined,
    currentPrompt: undefined,
    currentSettings: undefined,
    error: undefined,
  },
} as any);

/**
 * @internal
 * Type alias for node functions to simplify type assertions when adding nodes.
 * Uses GraphStateType for better type safety.
 */
type NodeFunction = (state: GraphStateType, config?: unknown) => Promise<GraphStateType>;

// Add nodes to the graph with type assertions for LangGraph compatibility
// Each node is wrapped in a RunnableLambda.
// We need to cast each function to NodeFunction and the RunnableLambda to `as any`.
builder.addNode(
  "identify_object_type",
  new RunnableLambda({ func: identify_object_type as NodeFunction }) as any
);

builder.addNode(
  "start_settings_extraction",
  new RunnableLambda({ func: start_settings_extraction as NodeFunction }) as any
);

builder.addNode(
  "extract_settings",
  new RunnableLambda({ func: extract_settings as NodeFunction }) as any
);

builder.addNode(
  "push_context_and_prepare_descend",
  new RunnableLambda({ func: push_context_and_prepare_descend as NodeFunction }) as any
);

builder.addNode(
  "complete_current_level",
  new RunnableLambda({ func: complete_current_level as NodeFunction }) as any
);

builder.addNode(
  "finalize_object",
  new RunnableLambda({ func: finalize_object as NodeFunction }) as any
);

builder.addNode("handle_error", new RunnableLambda({ func: handle_error as NodeFunction }) as any);

// Set the entry point - LangGraph automatically connects START to this node.
builder.setEntryPoint("identify_object_type" as any);

// Define the flow (edges) between nodes using `addEdge` and `addConditionalEdges`.
// Uses `as any` for compatibility with LangGraph's typing.
(builder as any).addEdge("identify_object_type", "start_settings_extraction");
(builder as any).addEdge("start_settings_extraction", "extract_settings");

// Add conditional edge after extracting settings
(builder as any).addConditionalEdges(
  "extract_settings",
  new RunnableLambda({
    func: (state: GraphStateType) => should_descend_or_complete(state) as any,
  }) as any,
  {
    push_context_and_prepare_descend: "push_context_and_prepare_descend",
    complete_current_level: "complete_current_level",
    handle_error: "handle_error",
  }
);

// After pushing context and preparing for sub-object, go back to extract settings
(builder as any).addEdge("push_context_and_prepare_descend", "extract_settings");

// Add conditional edge after completing a level
(builder as any).addConditionalEdges(
  "complete_current_level",
  new RunnableLambda({
    func: (state: GraphStateType) => should_continue_or_finalize(state) as any,
  }) as any,
  {
    extract_settings: "extract_settings",
    complete_current_level: "complete_current_level",
    finalize_object: "finalize_object",
    handle_error: "handle_error",
  }
);

// Connect terminal nodes to END
(builder as any).addEdge("finalize_object", END);
(builder as any).addEdge("handle_error", END);

// Compile the graph into a runnable application.
const app = builder.compile();

/**
 * The compiled LangGraph application ready to be invoked.
 * Use `app.invoke(initialState)` to run the graph.
 */
export { app };

/**
 * NOTE ON TYPE ASSERTIONS:
 *
 * The type assertions (`as any`) used extensively in this file are a workaround
 * for challenges in expressing LangGraph's complex type expectations within TypeScript.
 * They primarily satisfy the type checker and do not alter the runtime behavior of the graph.
 * Refer to LangGraph documentation for the expected shapes and interactions.
 */
