/**
 * @file Provides the entry point function for invoking the Math Object Generation LangGraph.
 */
import { app } from "./graph";
import { GraphStateType } from "./state";
import { MathInput } from "@math/types/index";
import { createComponentLogger } from "@websites/infrastructure/logging";

/**
 * Invokes the compiled LangGraph application (`app`) to process a user prompt
 * and generate corresponding mathematical objects.
 *
 * - Initializes the graph's state (`GraphStateType`) with the user prompt.
 * - Calls `app.invoke()` with the initial state.
 * - Processes the final state returned by the graph:
 *   - If `finalState.error` exists, throws an error including any `validationErrors`.
 *   - If `finalState.accumulatedObjects` is not an array, throws an error.
 *   - Otherwise, returns the `finalState.accumulatedObjects`.
 *
 * @param {string} userPrompt The natural language prompt from the user describing the desired math object(s).
 * @returns {Promise<MathInput[]>} A promise that resolves to an array of generated `MathInput` objects.
 * @throws {Error} If the graph execution fails (returns an error state) or an unexpected error occurs during invocation.
 */
export async function invokeMathObjectGenerator(userPrompt: string): Promise<MathInput[]> {
  const logger = createComponentLogger("InvokeGraph");

  logger.info("--- Starting Math Object Generation Graph ---");
  logger.info("User Prompt", { userPrompt });

  // 1. Define the initial state for the graph using the new structure
  const initialState: GraphStateType = {
    messages: [], // Optional: Initialize if needed, defaults to [] in state.ts
    userPrompt: userPrompt,
    identifiedType: undefined,
    currentObjectType: undefined,
    currentPrompt: undefined,
    currentSettings: undefined,
    contextStack: [], // Initialize the context stack as empty
    accumulatedObjects: [], // Initialize final output list, defaults to [] in state.ts
    validationErrors: [], // Initialize errors list, defaults to [] in state.ts
    error: undefined,
  };

  try {
    logger.info("Invoking graph with initial state", { initialState });
    // 2. Invoke the compiled LangGraph application
    const finalState = await app.invoke(initialState);
    logger.info("Graph execution finished. Final state", { finalState });

    // 3. Process the final state
    if (finalState.error) {
      logger.error(
        "Graph execution resulted in an error",
        finalState.error instanceof Error ? finalState.error : new Error(String(finalState.error))
      );
      // Include validation errors if they exist
      const errorDetails =
        finalState.validationErrors && finalState.validationErrors.length > 0
          ? ` Validation Errors: ${finalState.validationErrors.join(", ")}`
          : "";
      throw new Error(`Graph execution failed: ${finalState.error}.${errorDetails}`);
    }

    // Check if accumulatedObjects is an array
    if (!Array.isArray(finalState.accumulatedObjects)) {
      logger.error(
        "Graph finished, but 'accumulatedObjects' is not an array",
        new Error(
          `accumulatedObjects is not an array: ${JSON.stringify(finalState.accumulatedObjects)}`
        )
      );
      throw new Error(
        "Graph execution finished, but the final output (accumulatedObjects) was not in the expected array format."
      );
    }

    // Successfully generated objects are in the accumulatedObjects array
    logger.info("Successfully generated MathInput objects", {
      accumulatedObjects: finalState.accumulatedObjects,
    });
    // Cast might not be strictly necessary if accumulatedObjects uses z.custom<MathInput> correctly
    return finalState.accumulatedObjects as MathInput[];
  } catch (error: unknown) {
    logger.error(
      "An unexpected error occurred during graph invocation",
      error instanceof Error ? error : new Error(String(error))
    );
    // Re-throw the error to be handled by the caller
    throw new Error(
      `Failed to invoke math object generator graph: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
