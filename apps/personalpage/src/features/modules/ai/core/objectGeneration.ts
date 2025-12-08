/**
 * @file Central module for generating mathematical object settings from user prompts.
 * Provides a unified interface (`generateSettings`) that can switch between the modern
 * LangGraph-based implementation and the legacy `MathObjectGenerator` implementation
 * based on a configuration flag.
 * Also handles resetting and retrieving global token usage for the generation process.
 */

import { invokeMathObjectGenerator } from "../systems/langgraph/invokeGraph";
import { GeneratedMathObjects } from "@ai/types";
// Import the legacy generator
import { MathObjectGenerator } from "../systems/legacy/MathObjectGenerator";
// Import token utility functions
import { getGlobalTokenUsage, resetGlobalTokenUsage } from "../shared/utils/tokenUtils";
import { createComponentLogger } from "@websites/infrastructure/logging";
// --- System Type Definitions ---
/**
 * Available AI generation systems.
 */
export type AISystem = "legacy" | "langgraph";

/**
 * Default system to use when none is specified.
 */
const DEFAULT_SYSTEM: AISystem = "langgraph";
// --- End System Type Definitions ---

// --- Implementation Functions ---

/**
 * @internal
 * Generates settings using the LangGraph implementation (`invokeMathObjectGenerator`).
 * Resets the global token counter before invocation and retrieves the total usage afterwards.
 * @param {string} userPrompt The user's natural language prompt.
 * @returns {Promise<GeneratedMathObjects>} A promise resolving to the generated objects and their token usage.
 * @throws Re-throws any error encountered during graph invocation.
 */
async function generateSettingsUsingLangGraph(userPrompt: string): Promise<GeneratedMathObjects> {
  const logger = createComponentLogger("ObjectGeneration", "langGraph");

  try {
    // Reset global token usage before starting the graph execution
    resetGlobalTokenUsage();
    logger.info(`Initiating LangGraph generation for prompt: "${userPrompt}"`);

    // Invoke the graph
    const generatedObjects = await invokeMathObjectGenerator(userPrompt);

    // Retrieve the token usage accumulated during the graph execution
    const usage = getGlobalTokenUsage();
    logger.info("LangGraph generation successful. Returning objects and usage", { usage });

    // Return the generated objects and the collected usage
    return {
      objects: generatedObjects,
      usage: usage, // Use the retrieved global usage
    };
  } catch (error) {
    logger.error(
      "Error generating math objects using LangGraph",
      error instanceof Error ? error : new Error(String(error))
    );
    // Reset usage in case of error? Maybe not, depends on desired behavior.
    // resetGlobalTokenUsage();
    throw error;
  }
}

/**
 * @internal
 * Generates settings using the legacy `MathObjectGenerator` implementation.
 * Resets the global token counter before generation and retrieves the total usage afterwards.
 * @param {string} userPrompt The user's natural language prompt.
 * @returns {Promise<GeneratedMathObjects>} A promise resolving to the generated objects and their token usage.
 * @throws Re-throws any error encountered during legacy generation.
 */
async function generateSettingsUsingLegacy(userPrompt: string): Promise<GeneratedMathObjects> {
  const logger = createComponentLogger("ObjectGeneration", "legacy");

  try {
    // Reset global token usage before starting legacy generation
    resetGlobalTokenUsage();
    logger.info(`Initiating legacy MathObjectGenerator generation for prompt: "${userPrompt}"`);
    const generator = new MathObjectGenerator(); // Instantiate the legacy generator
    const result = await generator.generate(userPrompt); // Call its generate method

    // Retrieve the token usage accumulated during legacy generation
    const usage = getGlobalTokenUsage();
    logger.info("Legacy MathObjectGenerator generation successful. Returning objects and usage", {
      usage,
    });

    // Adapt the result to the GeneratedMathObjects structure
    return {
      objects: result.objects, // The generate method returns { objects: MathInput[] }
      usage: usage, // Use the retrieved global usage
    };
  } catch (error) {
    logger.error(
      "Error generating math objects using legacy MathObjectGenerator",
      error instanceof Error ? error : new Error(String(error))
    );
    // resetGlobalTokenUsage(); // Consider resetting on error
    throw error;
  }
}

// --- Main Exported Function ---

/**
 * Generates structured settings for mathematical objects based on a natural language user prompt.
 *
 * This function acts as a facade, dispatching the request to either the modern LangGraph-based
 * generator or the legacy generator based on the `system` parameter.
 *
 * It handles the setup and teardown for token usage tracking for the chosen method.
 *
 * **Note:** This function requires server-side execution (OPENAI_API_KEY must be available).
 * For client-side usage, use the `/api/ai/generateSettings` API endpoint instead.
 *
 * @param {string} userPrompt The user's natural language prompt describing the desired mathematical object(s).
 * @param {AISystem} [system] The AI system to use. Defaults to 'langgraph' if not specified.
 * @returns {Promise<GeneratedMathObjects>} A promise resolving to an object containing the array of generated
 * `MathInput` objects and the total token usage for the generation process.
 * @throws {Error} If the selected generation process encounters an error.
 */
export async function generateSettings(
  userPrompt: string,
  system: AISystem = DEFAULT_SYSTEM
): Promise<GeneratedMathObjects> {
  // Check if we're on the client side (where API key is not available)
  if (typeof window !== "undefined") {
    throw new Error(
      "generateSettings cannot be called from the client side. " +
        "Please use the /api/ai/generateSettings API endpoint instead."
    );
  }

  if (system === "langgraph") {
    return generateSettingsUsingLangGraph(userPrompt);
  } else {
    return generateSettingsUsingLegacy(userPrompt);
  }
}
