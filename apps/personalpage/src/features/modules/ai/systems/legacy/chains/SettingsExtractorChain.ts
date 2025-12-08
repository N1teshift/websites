import { BaseChain } from "./BaseChain";
import { ObjectType } from "@math/types/mathTypes";
import { getObjectTypeSystemPrompt } from "../../../shared/utils/promptUtils";
import { validateObjectSettings } from "../../../shared/validation/settingsValidator";
// Import the specific schemas directly - only for supported types
import {
  coefficientSettingsSchema,
  coefficientsSettingsSchema,
  termSettingsSchema,
} from "../../../shared/schemas";

// Define a more specific output type for this chain
/**
 * Represents the output of the SettingsExtractorChain, containing the extracted settings
 * and potentially prompts for processing sub-objects.
 */
type SettingsExtractorOutput = {
  settings: unknown; // Settings structure depends on objectType, unknown is safest here
  subObjects?: Record<string, string>; // Optional sub-objects
};

// Map object types to their standalone schemas
// System 1 (Legacy) only supports: coefficient, coefficients, term
/** @internal A mapping from ObjectType to its corresponding JSON schema for settings extraction. */
const settingsSchemaMap: Partial<Record<ObjectType, unknown>> = {
  coefficient: coefficientSettingsSchema,
  coefficients: coefficientsSettingsSchema,
  term: termSettingsSchema,
  // All other types are unsupported - validation will reject them before reaching here
};

/**
 * Generic chain for extracting structured settings from user input for a specific mathematical object type.
 * It dynamically selects the appropriate system prompt and validation schema based on the `ObjectType`.
 * @extends BaseChain<SettingsExtractorOutput>
 * @deprecated This chain system is considered legacy and may be replaced by a newer implementation using Langchain/LangGraph.
 */
export class SettingsExtractorChain extends BaseChain<SettingsExtractorOutput> {
  private objectType: ObjectType;

  /**
   * Creates an instance of SettingsExtractorChain for a specific object type.
   * @param {ObjectType} objectType - The type of mathematical object for which to extract settings.
   */
  constructor(objectType: ObjectType) {
    const systemPrompt = getObjectTypeSystemPrompt(objectType);
    super(`${objectType}SettingsExtractor`, systemPrompt);
    this.objectType = objectType;
    this.logger.info(`Initialized for object type: ${objectType}`);
  }

  /**
   * Gets the JSON schema required for validating the LLM's output for the specific `objectType`.
   * Retrieves the schema from the `settingsSchemaMap`.
   * @param {Record<string, unknown>} _context - The current execution context (not used in this implementation).
   * @returns {unknown} The JSON schema corresponding to the `objectType`.
   * @throws {Error} Throws an error if no schema is found for the given `objectType` (unless a fallback is implemented).
   * @protected
   * @override
   */
  protected getSchema(_context: Record<string, unknown>): unknown {
    this.logger.debug(`Providing schema for object type: ${this.objectType}`);
    const schema = settingsSchemaMap[this.objectType];
    if (!schema) {
      // This should not happen if validation is working correctly, but fail fast if it does
      const errorMessage = `No settings schema found for object type: ${this.objectType}. System 1 (Legacy) only supports 'coefficient', 'coefficients', and 'term'.`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    return schema;
  }

  /**
   * Prepares the user prompt for the SettingsExtractorChain.
   * In this specific chain, no additional preparation is needed beyond the system prompt determined by the `objectType`.
   * @param {string} userPrompt - The original user prompt.
   * @returns {string} The original user prompt, unchanged.
   * @protected
   * @override
   */
  protected preparePrompt(userPrompt: string): string {
    this.logger.debug(
      `No additional prompt preparation needed for math object settings extraction.`
    );
    return userPrompt;
  }

  /**
   * Validates the parsed response object from the LLM against the schema for the specific `objectType`.
   * Uses the `validateObjectSettings` utility function for type-specific validation.
   * @param {unknown} parsedResponse - The parsed JavaScript object from the LLM response.
   * @param {string} _userPrompt - The original user prompt (not used in this implementation).
   * @param {Record<string, unknown>} _context - The current execution context (not used in this implementation).
   * @returns {Promise<SettingsExtractorOutput>} A promise that resolves with the validated settings.
   * @throws {Error} Throws an error if the validation fails.
   * @protected
   * @override
   */
  protected async validateResponse(
    parsedResponse: unknown,
    _userPrompt: string,
    _context: Record<string, unknown>
  ): Promise<SettingsExtractorOutput> {
    this.logger.debug(`Validating parsed response.`);
    try {
      // Validate the parsed object using the specific validator for the object type
      const validatedSettings = validateObjectSettings(parsedResponse, this.objectType);
      // Use objectTypeName consistently for logging
      const objectTypeName = this.objectType.charAt(0).toUpperCase() + this.objectType.slice(1);
      this.logger.debug(`${objectTypeName} object required properties exist.`);

      return { settings: validatedSettings };
    } catch (error: unknown) {
      // Catch validation errors from validateObjectSettings
      // Use objectTypeName in error logs as well
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error validating response for ${this.objectType}: ${message}`);
      this.logger.debug(`Failed validation data: ${JSON.stringify(parsedResponse)}`);
      // Re-throw the validation error
      throw new Error(`Failed to validate ${this.objectType} settings: ${message}`);
    }
  }

  /**
   * Updates the execution context with the extracted settings.
   * It adds the settings object under a key derived from the chain's name (e.g., 'equationSettingsExtractor').
   * It also merges any potential sub-object prompts into the context.
   * @param {SettingsExtractorOutput} output - The validated output of the chain (containing settings and optional subObjects).
   * @param {Record<string, unknown>} context - The context before this chain executed.
   * @returns {Record<string, unknown>} The updated context.
   * @protected
   * @override
   */
  protected updateContext(
    output: SettingsExtractorOutput,
    context: Record<string, unknown>
  ): Record<string, unknown> {
    const newContext: Record<string, unknown> = {
      ...context,
      [this.name]: output.settings,
    };

    // Sub-object prompt handling remains the same logic, but the content of
    // output.subObjects needs to be generated correctly in processResponse
    if (output.subObjects && Object.keys(output.subObjects).length > 0) {
      newContext.subObjectPrompts = {
        ...(context.subObjectPrompts || {}),
        ...output.subObjects,
      };
    }

    return newContext;
  }
}
