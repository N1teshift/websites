/**
 * @file Defines a chain for identifying the type of mathematical object from user input.
 * @deprecated This chain system is considered legacy and may be replaced by a newer implementation using Langchain/LangGraph.
 */
import { ObjectType } from "@math/types/mathTypes";
import { BaseChain } from "./BaseChain";
import { typeIdentifierPrompt } from "../../../shared/prompts/typeIdentifier/prompt";
import { isValidObjectType } from "../../../shared/validation/typeGuards";
import { typeIdentifierSchema } from "../../../shared/schemas/objectType";

/**
 * Chain for identifying the type of mathematical object from user input.
 * Inherits execution logic from BaseChain, using getModelResponseWithSchema.
 * It determines if the input refers to a vector, matrix, equation, etc.
 * @extends BaseChain<ObjectType>
 * @deprecated This chain system is considered legacy and may be replaced by a newer implementation using Langchain/LangGraph.
 */
export class TypeIdentifierChain extends BaseChain<ObjectType> {
  private validationObjectType?: ObjectType;

  /**
   * Creates an instance of TypeIdentifierChain.
   * @param {ObjectType} [validationObjectType] - Optional. The expected object type, used for validation during testing or in specific scenarios. If provided and the identified type mismatches, a warning is logged, but the identified type is still used unless a validation error occurs, in which case this acts as a fallback.
   */
  constructor(validationObjectType?: ObjectType) {
    super("TypeIdentifier", typeIdentifierPrompt);
    
    this.validationObjectType = validationObjectType;
    this.logger.info(`Initialized with validation type: ${validationObjectType}`);
  }
  
  /**
   * Gets the JSON schema required for the TypeIdentifierChain output.
   * The schema defines that the output should be an object containing an `objectType` field.
   * @param {Record<string, unknown>} _context - The current execution context (not used in this implementation).
   * @returns {unknown} The JSON schema for identifying object types.
   * @protected
   * @override
   */
  protected getSchema(_context: Record<string, unknown>): unknown {
    this.logger.debug(`Providing schema: typeIdentifierSchema`);
    return typeIdentifierSchema; 
  }
  
  /**
   * Prepares the user prompt for the TypeIdentifierChain.
   * In this specific chain, no additional preparation is needed beyond the system prompt.
   * @param {string} userPrompt - The original user prompt.
   * @returns {string} The original user prompt, unchanged.
   * @protected
   * @override
   */
  protected preparePrompt(userPrompt: string): string {
    this.logger.debug(`No additional prompt preparation needed for type identification.`);
    return userPrompt; // Pass the original prompt through
  }

  /**
   * Validates the parsed response object from the LLM to ensure it contains a valid `ObjectType`.
   * It checks if the response has an `objectType` property and if its value is a known `ObjectType`.
   * If `validationObjectType` was provided to the constructor and a validation error occurs with the LLM response,
   * this `validationObjectType` is used as a fallback.
   * @param {unknown} parsedOutput - The parsed JavaScript object from the LLM response.
   * @param {string} _userPrompt - The original user prompt (not used in this implementation).
   * @param {Record<string, unknown>} _context - The current execution context (not used in this implementation).
   * @returns {Promise<ObjectType>} A promise that resolves with the validated `ObjectType`.
   * @throws {Error} Throws an error if the response is invalid and no fallback `validationObjectType` is available.
   * @protected
   * @override
   */
  protected async validateResponse(
    parsedOutput: unknown,
    _userPrompt: string,
    _context: Record<string, unknown>
  ): Promise<ObjectType> {
    this.logger.debug(`Validating parsed response: ${JSON.stringify(parsedOutput)}`);
    try {
      // Type guard to check if the input is a non-null object with an objectType string property
      const hasObjectType = (
        input: unknown
      ): input is { objectType: string } => {
        return typeof input === 'object' && input !== null && 'objectType' in input && typeof input.objectType === 'string';
      };

      // Validate the structure and the objectType field using the type guard
      if (!hasObjectType(parsedOutput) || !isValidObjectType(parsedOutput.objectType)) {
        // Log the invalid response for debugging
        this.logger.warn(`Invalid or missing objectType in parsed response: ${JSON.stringify(parsedOutput)}`);
        // Throw an error to indicate validation failure, potentially triggering fallback
        throw new Error(`Invalid or missing objectType in response`);
      }

      // Now TypeScript knows parsedOutput has objectType because of the type guard
      const identifiedType = parsedOutput.objectType as ObjectType;
      this.logger.debug(`Successfully validated type: ${identifiedType}`);

      // Perform validation warning if a validation type was provided and doesn't match
      if (this.validationObjectType && identifiedType !== this.validationObjectType) {
        this.logger.warn(`Validation mismatch: Identified "${identifiedType}" but expected "${this.validationObjectType}". Using identified type.`);
        // Note: We proceed with the identified type, the warning is informational.
      }

      return identifiedType;

    } catch (error) {
      // This catch block now primarily handles validation errors or missing objectType
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error validating response: ${errorMsg}`);

      // Fallback logic: If a validation type exists, use it as a last resort
      if (this.validationObjectType) {
        this.logger.warn(`Error validating response. Falling back to validation type: "${this.validationObjectType}"`);
        return this.validationObjectType;
      }
      
      // If no fallback is available, re-throw the error
      this.logger.error(`Validation error and no fallback validation type available.`);
      // Re-throw with a more specific message if needed
      throw new Error(`Failed to validate response and no fallback available: ${errorMsg}`);
    }
  }
} 



