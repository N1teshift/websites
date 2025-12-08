/**
 * @file Defines the initial nodes for the LangGraph workflow, focusing on
 * identifying the primary object type and preparing the state for settings extraction.
 */
import { RunnableConfig } from "@langchain/core/runnables";
import { GraphStateType } from "../state";
import { createTypeIdentifierRunnable } from "../runnables";
import { ObjectType } from "@math/types/index";
import { createComponentLogger } from "@websites/infrastructure/logging";
import { TokenUsageCallbackHandler } from "../tokenHandler";
import { canProcessObjectType } from "../../../shared/utils/systemCapabilities";

/**
 * Graph Node: Identifies the primary mathematical object type from the initial user prompt.
 * Uses the `createTypeIdentifierRunnable` which leverages an LLM with structured output.
 * This is typically the entry point node of the graph.
 *
 * @param {GraphStateType} state The current graph state, expecting `userPrompt` to be populated.
 * @param {RunnableConfig} [_config] Optional LangChain runnable configuration (unused in this node).
 * @returns {Promise<Partial<GraphStateType>>} A partial state update containing either the `identifiedType` or an `error` message.
 */
export async function identify_object_type(
  state: GraphStateType,
  _config?: RunnableConfig
): Promise<Partial<GraphStateType>> {
  const logger = createComponentLogger("LangGraph", "identify_object_type");

  logger.info("Entering Node");
  logger.info("Input State", { state });
  try {
    // Instantiate the token usage callback handler
    const tokenCallback = new TokenUsageCallbackHandler();
    // Get the runnable for type identification
    const identifierRunnable = createTypeIdentifierRunnable();
    // Invoke the runnable, passing the callback in the config
    const result = await identifierRunnable.invoke(
      { userPrompt: state.userPrompt },
      { callbacks: [tokenCallback] } // Pass the callback handler instance
    );
    logger.info(`Type identified: ${result.objectType}`);
    const identifiedType = result.objectType as ObjectType;

    // Validate that System 2 (LangGraph) supports this object type
    if (!canProcessObjectType("langgraph", identifiedType)) {
      const errorMessage = `System 2 (LangGraph) does not support object type '${identifiedType}'. Only 'coefficient', 'coefficients', and 'term' are supported.`;
      logger.error(errorMessage);
      return { error: errorMessage };
    }

    logger.info("Exiting Node (Success)");
    return { identifiedType: identifiedType, error: undefined }; // Clear error on success
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error: ${errorMessage}`);
    console.error("Error in identify_object_type:", error);
    logger.info("Exiting Node (Error)");
    return { error: `Failed to identify object type: ${errorMessage}` };
  }
}

/**
 * Graph Node: Prepares the state for the initial settings extraction process.
 * It takes the `identifiedType` from the previous step and sets the `currentObjectType`
 * and `currentPrompt` (which is the full user prompt for the top-level object).
 * It also resets relevant parts of the state like `contextStack` and `accumulatedObjects`.
 *
 * @param {GraphStateType} state The current graph state, expecting `identifiedType` to be populated.
 * @returns {Promise<Partial<GraphStateType>>} A partial state update initializing `currentObjectType`, `currentPrompt`, and clearing relevant fields, or propagating an existing `error`.
 */
export async function start_settings_extraction(
  state: GraphStateType
): Promise<Partial<GraphStateType>> {
  const logger = createComponentLogger("LangGraph", "start_settings_extraction");

  logger.info("Entering Node");
  logger.info("Input State", { state });
  if (state.error) {
    logger.info("Propagating previous error");
    logger.info("Exiting Node (Error)");
    return { error: state.error }; // Propagate error
  }
  if (!state.identifiedType) {
    logger.error("Error: Type not identified.");
    logger.info("Exiting Node (Error)");
    return { error: "Cannot start settings extraction: Type not identified." };
  }
  logger.info(`Starting extraction for type: ${state.identifiedType}`);

  // Initialize state for the first object extraction
  const update = {
    currentObjectType: state.identifiedType,
    currentPrompt: state.userPrompt, // Use the original prompt for the top-level object
    contextStack: [], // Ensure stack is empty
    accumulatedObjects: [], // Ensure output is empty
    currentSettings: undefined, // Clear previous settings
    error: undefined, // Clear previous errors
    validationErrors: [], // Clear validation errors
  };
  logger.info("State Update", { update });
  logger.info("Exiting Node (Success)");
  return update;
}
