/**
 * @file Defines the legacy MathObjectGenerator class, responsible for orchestrating
 * the older AI chain-based process for generating mathematical object settings.
 * @deprecated This class uses the legacy chain system (`TypeIdentifierChain`, `SettingsExtractorChain`)
 *             and has been superseded by the LangGraph implementation in `src/features/infrastructure/ai/lang/`.
 *             Use `generateSettings` from `src/features/infrastructure/ai/core/objectGeneration.ts` which routes
 *             to the appropriate implementation.
 */
import {
  MathInput,
  CoefficientsSettings,
  ObjectType,
  CoefficientSettings,
  DEFAULT_COEFFICIENT_SETTINGS,
  DEFAULT_COEFFICIENTS_SETTINGS,
  ExpressionSettings,
  EquationSettings,
  TermSettings,
} from "@math/types/index";
import { TokenUsage } from "@ai/types";
import { SettingsExtractorChain, TypeIdentifierChain } from "./chains/index";
import { accumulateTokenUsage } from "../../shared/utils/tokenUtils";
import { createComponentLogger } from "@websites/infrastructure/logging";
import {
  isMathInput,
  validateSettingsMatch,
  TestSettings,
  ResponseSettings,
} from "../../shared/validation/index";
import { isCoefficientSettingsCombinationValid } from "@math/shared/coefficientConceptualValidator";
import { TestCase } from "@math/tests/cases/TestCase";
import { canProcessObjectType } from "../../shared/utils/systemCapabilities";

/**
 * @internal
 * Defines the union type for settings validation within the legacy generator.
 * @deprecated Part of the legacy MathObjectGenerator system.
 */
type AllPossibleSettings =
  | CoefficientSettings
  | ExpressionSettings
  | EquationSettings
  | CoefficientsSettings
  | TermSettings;

/**
 * @internal
 * Configuration for handling sub-objects within parent objects in the legacy system.
 * @deprecated Specific to the legacy MathObjectGenerator's recursive logic.
 */
interface SubObjectConfig {
  subObjectType: ObjectType; // The type of the sub-object
  settingsKey: string; // The key in the parent's settings object where sub-settings are stored
  isArray: boolean; // Whether the settingsKey holds an array or a single object
}

/**
 * @internal
 * Map defining parent-child relationships and storage details for the legacy generator.
 * Determines how sub-objects are identified and nested within parent settings.
 * @deprecated Specific to the legacy MathObjectGenerator's recursive logic.
 */
const SUB_OBJECT_CONFIG: Partial<Record<ObjectType, SubObjectConfig>> = {
  term: { subObjectType: "coefficients", settingsKey: "coefficients", isArray: false }, // Term has single coefficients object
  coefficients: { subObjectType: "coefficient", settingsKey: "coefficients", isArray: true },
  // coefficient has no sub-objects (leaf node)
  // All other types are unsupported and will be rejected by validation before reaching here
};

/**
 * Legacy class orchestrating the generation of mathematical objects using custom chains.
 * Identifies object types, extracts settings recursively, performs validation,
 * and can compare results against test cases.
 * @deprecated Superseded by the LangGraph implementation (`invokeMathObjectGenerator`). Use
 * `generateSettings` from `objectGeneration.ts` instead.
 */
export class MathObjectGenerator {
  /**
   * Optional test case used for validation comparison.
   * @deprecated Part of the legacy validation mechanism.
   */
  private testCase?: TestCase<Record<string, unknown>>;
  private logger: ReturnType<typeof createComponentLogger>;

  /**
   * Initializes the legacy MathObjectGenerator.
   * @param {TestCase<Record<string, unknown>>} [test] - Optional test case for validation.
   * @deprecated Use the LangGraph implementation.
   */
  constructor(test?: TestCase<Record<string, unknown>>) {
    this.testCase = test;
    this.logger = createComponentLogger("MathObjectGenerator");
    this.logger.info(`Initialized ${test ? "with TestCase: " + test.name : "without a TestCase."}`);
  }

  /**
   * Generates MathInput objects based on a user prompt using the legacy chain system.
   * Optionally validates the generated objects against structural rules, mathematical consistency,
   * and a provided test case.
   * @param {string} userPrompt - The natural language prompt.
   * @returns {Promise<{objects: MathInput[]}>} A promise resolving to the generated objects.
   * @throws {Error} If any step (identification, extraction, validation) fails.
   * @deprecated Use `generateSettings` from `objectGeneration.ts` which uses the LangGraph implementation.
   */
  async generate(userPrompt: string): Promise<{ objects: MathInput[] }> {
    this.logger.info(
      `Starting math object generation for prompt: ${userPrompt.substring(0, 50)}...`
    );
    if (this.testCase) {
      this.logger.info(
        `TestCase '${this.testCase.name}' provided; value validation will be performed.`
      );
    }
    const totalUsage: TokenUsage = { input_tokens: 0, output_tokens: 0, total_tokens: 0 };

    try {
      // Step 1: Identify the object type
      // Use objectType from testCase if available for identification step
      const validationObjectType = this.testCase?.objectType;
      const {
        objectType,
        context,
        usage: identificationUsage,
      } = await this.identifyObjectType(userPrompt, validationObjectType);

      accumulateTokenUsage(totalUsage, identificationUsage);

      // Validate that System 1 (Legacy) supports this object type
      if (!canProcessObjectType("legacy", objectType)) {
        const errorMessage = `System 1 (Legacy) does not support object type '${objectType}'. Only 'coefficient', 'coefficients', and 'term' are supported.`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Step 2: Generate the objects with the identified type
      const { objects } = await this.generateObjectsForType(
        userPrompt,
        objectType,
        context,
        totalUsage
      );

      // Step 3: Validate the generated objects
      this.logger.info(
        `Initiating validation for ${objects.length} generated MathInput object(s)...`
      );
      this._validateGeneratedObjects(objects);
      this.logger.info(`Validation successful for all generated objects.`);

      return {
        objects,
      };
    } catch (error) {
      // Mark error message as important
      this.logger.error(
        `Error in math object generation: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Private helper method to encapsulate all validation logic for generated objects.
   * Performs structural checks (`isMathInput`), mathematical consistency checks (currently only for coefficients),
   * and optional value validation against a stored `testCase`.
   * @param {MathInput[]} objects - The array of generated MathInput objects to validate.
   * @throws {Error} If any validation step fails for any object.
   * @private
   * @deprecated Validation logic is integrated differently in the LangGraph implementation.
   */
  private _validateGeneratedObjects(objects: MathInput[]): void {
    this.logger.info(`Starting detailed validation for ${objects.length} object(s)...`);

    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i]; // obj is of type MathInput
      const objIndexInfo = `object at index ${i} (Type: ${obj?.objectType ?? "unknown"})`;
      this.logger.debug(`Validating ${objIndexInfo}...`);

      try {
        // === Structural and Type Validation ===
        if (!isMathInput(obj)) {
          throw new Error(
            `Structural validation failed for ${objIndexInfo}. Check warnings for details.`
          );
        }
        this.logger.debug(`Passed structural validation for ${objIndexInfo}.`);

        // === Mathematical Consistency Validation ===
        if (obj.objectType === "coefficient") {
          const settings = obj.coefficientSettings as CoefficientSettings;
          if (
            !isCoefficientSettingsCombinationValid(
              settings.numberSet,
              settings.rules,
              settings.representationType,
              settings.range as [number, number] | undefined
            )
          ) {
            throw new Error(
              `Mathematical consistency validation failed for ${objIndexInfo}: Invalid combination.`
            );
          }
          this.logger.debug(`Passed mathematical consistency validation for ${objIndexInfo}.`);
        } else {
          this.logger.debug(
            `Skipping mathematical consistency validation for ${objIndexInfo} (not yet implemented for type '${obj.objectType}').`
          );
        }

        // === Value Validation against Source TestCase ===
        if (this.testCase) {
          this.logger.debug(
            `Performing value validation against TestCase '${this.testCase.name}' for ${objIndexInfo}...`
          );

          // Construct TestSettings from the stored testCase
          // Use the public getter and cast to the expected union type
          const sourceSettingsForValidation: TestSettings = {
            objectType: this.testCase.objectType,
            settings: this.testCase.getSettings() as AllPossibleSettings,
          };

          // Construct the ResponseSettings object from the generated MathInput
          const currentResponseSettings: ResponseSettings = {
            objectType: obj.objectType,
            // Access settings dynamically and cast to the expected union type
            settings: (obj as Record<string, unknown>)[
              `${obj.objectType}Settings`
            ] as AllPossibleSettings,
          };

          // Perform the validation against the source TestCase settings
          const valueValidationError = validateSettingsMatch(
            sourceSettingsForValidation,
            currentResponseSettings
          );

          if (valueValidationError) {
            // Include path/field info if available from the error
            let errorMsg = `Value validation failed for ${objIndexInfo} against TestCase '${this.testCase.name}': ${valueValidationError.message}`;
            if (valueValidationError.path) {
              errorMsg += ` (Path: ${valueValidationError.path})`;
            } else if (valueValidationError.field) {
              errorMsg += ` (Field: ${valueValidationError.field})`;
            }
            throw new Error(errorMsg);
          }
          this.logger.debug(`Passed value validation against TestCase for ${objIndexInfo}.`);
        } else {
          this.logger.debug(
            `Skipping value validation against TestCase for ${objIndexInfo} (no TestCase provided).`
          );
        }
      } catch (validationError: unknown) {
        const message =
          validationError instanceof Error ? validationError.message : String(validationError);
        this.logger.error(`Validation failed for ${objIndexInfo}: ${message}`);
        // Re-throw the error to be caught by the main generate method's try/catch
        throw new Error(`MathObjectGenerator validation failed for ${objIndexInfo}: ${message}`);
      }
    }
    // No need for a success log here, it's logged in the calling method `generate`
  }

  /**
   * Identifies the primary object type from the user prompt using the legacy `TypeIdentifierChain`.
   * Optionally uses a validation type from a test case to verify the identification.
   * @param {string} userPrompt - The user's natural language prompt.
   * @param {ObjectType} [validationObjectType] - Optional expected type for validation logging.
   * @returns {Promise<{objectType: ObjectType, context: Record<string, unknown>, usage: TokenUsage}>}
   *          The identified object type, context from the chain, and token usage.
   * @throws {Error} If the `TypeIdentifierChain` fails.
   * @private
   * @deprecated Uses the legacy `TypeIdentifierChain`. The LangGraph uses `createTypeIdentifierRunnable`.
   */
  private async identifyObjectType(
    userPrompt: string,
    validationObjectType?: ObjectType
  ): Promise<{ objectType: ObjectType; context: Record<string, unknown>; usage: TokenUsage }> {
    // Identifying types is verbose only
    this.logger.debug(`Identifying object types from prompt: ${userPrompt.substring(0, 50)}...`);

    // Create TypeIdentifierChain with validation type (optional)
    const typeIdentifierChain = new TypeIdentifierChain(validationObjectType);

    try {
      // Execute the chain to identify object type
      const result = await typeIdentifierChain.execute(userPrompt, {});

      // Simply return the identified type - the chain handles validation logging
      return {
        objectType: result.output,
        context: result.context,
        usage: result.usage,
      };
    } catch (error) {
      // Enhance the error message if we have a validation type
      if (validationObjectType) {
        // Mark validation-specific error as important
        this.logger.error(
          `Type identification failed with validation type: ${validationObjectType}`
        );
        throw new Error(
          `Failed to identify object type for prompt with validation type '${validationObjectType}': ${error instanceof Error ? error.message : String(error)}`
        );
      }
      // Re-throw other errors (will be caught by the main generate method)
      throw error;
    }
  }

  /**
   * Generates the full `MathInput` structures for a given object type, including recursive
   * processing of sub-objects, using the legacy system.
   * @param {string} userPrompt - The initial user prompt (might be refined for sub-objects).
   * @param {ObjectType} objectType - The primary object type to generate.
   * @param {Record<string, unknown>} initialContext - Context from the identification step.
   * @param {TokenUsage} usage - The token usage object to be updated by subsequent chain calls.
   * @returns {Promise<{objects: MathInput[], usage: TokenUsage}>} Generated objects and the updated usage object.
   * @private
   * @deprecated Relies on the legacy `processObjectAndSubObjects` logic.
   */
  private async generateObjectsForType(
    userPrompt: string,
    objectType: ObjectType,
    initialContext: Record<string, unknown> = {},
    usage: TokenUsage // Accept the usage object
  ): Promise<{ objects: MathInput[]; usage: TokenUsage }> {
    // Generating for type is verbose only
    this.logger.debug(`Generating objects for type: ${objectType}`);

    // Collect all generated objects
    const allObjects: MathInput[] = [];
    const processedObjects = new Map<string, MathInput>();

    // Process the main object and all its sub-objects recursively
    await this.processObjectAndSubObjects(
      userPrompt,
      objectType,
      initialContext,
      allObjects,
      processedObjects,
      usage // Pass the existing usage object down
    );

    return {
      objects: allObjects,
      usage, // Return the final accumulated usage
    };
  }

  /**
   * Extracts settings for a single object type using the legacy `SettingsExtractorChain`.
   * Includes special handling to potentially generate default settings for 'coefficients'
   * based on parent context, bypassing the LLM call.
   * @param {string} userPrompt - The prompt for this specific object/sub-object.
   * @param {ObjectType} objectType - The type of object to extract settings for.
   * @param {Record<string, unknown>} parentContext - Context inherited from the parent object's processing.
   * @param {TokenUsage} usage - The token usage object to accumulate usage into.
   * @returns {Promise<{settings: unknown, context: Record<string, unknown>}>} The extracted settings and the context returned by the chain.
   * @throws {Error} If the `SettingsExtractorChain` fails.
   * @private
   * @deprecated Uses the legacy `SettingsExtractorChain`. LangGraph uses `createSettingsExtractorRunnable`.
   */
  private async extractSingleObjectSettings(
    userPrompt: string,
    objectType: ObjectType,
    parentContext: Record<string, unknown>,
    usage: TokenUsage // Pass usage object to accumulate tokens
  ): Promise<{ settings: unknown; context: Record<string, unknown> }> {
    this.logger.debug(
      `Attempting to extract single settings for type: ${objectType} with prompt: '${userPrompt}'...`
    );

    // --- Try Generating Default Settings First (Special Case) ---
    if (objectType === "coefficients") {
      const defaultSettings = this._tryGenerateDefaultCoefficientsSettings(
        userPrompt,
        parentContext
      );
      if (defaultSettings) {
        this.logger.debug(`Generated default coefficients settings. Skipping LLM call.`);
        // Return the generated default settings and the original context
        // Token usage is 0 for this path, handled implicitly as we don't call accumulateTokenUsage
        return { settings: defaultSettings, context: parentContext };
      }
      this.logger.debug(
        `Could not generate default coefficients settings based on context. Proceeding with LLM extraction.`
      );
    }
    // --- End Default Settings Handling ---

    // If not handled by special default logic, proceed with LLM extraction
    this.logger.debug(`Proceeding with LLM extraction for ${objectType}.`);
    const settingsChain = new SettingsExtractorChain(objectType);
    const result = await settingsChain.execute(userPrompt, parentContext);
    accumulateTokenUsage(usage, result.usage);

    this.logger.debug(
      `Single settings extracted via LLM for ${objectType}: ${JSON.stringify(result.output.settings, null, 2)}`
    );
    return { settings: result.output.settings, context: result.context };
  }

  /**
   * Helper method to attempt generating default `CoefficientsSettings` based on parent context,
   * specifically when the parent is a 'term' and the prompt is 'default'.
   * @param {string} userPrompt - The prompt received (checking if it's 'default').
   * @param {Record<string, unknown>} parentContext - Context containing parent type and settings (like termIds).
   * @returns {CoefficientsSettings | null} The generated default settings or null if conditions aren't met.
   * @private
   * @deprecated Logic specific to the legacy default settings generation. LangGraph handles this differently.
   */
  private _tryGenerateDefaultCoefficientsSettings(
    userPrompt: string,
    parentContext: Record<string, unknown>
  ): CoefficientsSettings | null {
    this.logger.debug(`Checking conditions for default coefficients generation...`);
    // --- Special Handling for Default Coefficients ---\
    // Check if we need default coefficients based on a 'term' parent and 'default' prompt
    // Safely access nested properties
    const parentSettings =
      typeof parentContext.parentSettings === "object" && parentContext.parentSettings !== null
        ? parentContext.parentSettings // parentSettings is unknown here
        : undefined;
    // Ensure termIds exists and is an array before accessing it
    // Use Record<string, unknown> for type safety instead of any
    const termIds =
      parentSettings &&
      typeof parentSettings === "object" && // Extra check for object type
      "termIds" in parentSettings &&
      Array.isArray((parentSettings as Record<string, unknown>).termIds) // Assert as Record<string, unknown>
        ? ((parentSettings as Record<string, unknown>).termIds as unknown[]) // Assert and get as unknown[]
        : undefined;

    const isDefaultPrompt = userPrompt === "default";
    const isParentTerm = parentContext.parentType === "term";

    this.logger.debug(
      `Default Check: Prompt='${userPrompt}' (${isDefaultPrompt}), ParentType='${parentContext.parentType}' (${isParentTerm}), TermIDs=${termIds ? JSON.stringify(termIds) : "undefined"}`
    );

    if (isDefaultPrompt && isParentTerm && termIds) {
      const termIdsLength = termIds.length;
      if (termIdsLength > 0) {
        this.logger.debug(
          `Using default coefficients settings based on parent term's termIds length: ${termIdsLength}`
        );

        // Calculate required collection count
        const collectionCount = termIdsLength;

        // Create the array of default coefficient settings (deep copy)
        const coefficientsArray = Array(collectionCount)
          .fill(null)
          .map(() => ({ ...DEFAULT_COEFFICIENT_SETTINGS }));

        // Construct the final default settings object for coefficients
        const defaultSettings: CoefficientsSettings = {
          collectionCount,
          coefficients: coefficientsArray,
          rules: DEFAULT_COEFFICIENTS_SETTINGS.rules || [], // Use default rules
          // Do not include subObjectPromptParts here as we are generating defaults
        };

        // Return the constructed default settings
        return defaultSettings;
      } else {
        this.logger.debug(
          `Parent term has empty termIds, cannot generate default coefficients based on length.`
        );
        return null; // Conditions met, but termIds is empty
      }
    } else {
      this.logger.debug(`Conditions for default coefficients generation not met.`);
      return null; // Conditions for default generation not met
    }
    // --- End Special Handling ---
  }

  /**
   * Recursively processes an object and its potential sub-objects based on `SUB_OBJECT_CONFIG`.
   * Extracts settings for the current object, identifies required sub-objects, extracts their settings
   * using prompts derived from the parent's context, and assembles the final `MathInput` structure.
   * Mutates the `usage` object passed in.
   * @param {string} userPrompt - The prompt for the current object level.
   * @param {ObjectType} objectType - The type of the current object being processed.
   * @param {Record<string, unknown>} parentContext - Context from the parent processing level.
   * @param {MathInput[]} allObjects - Array where fully assembled `MathInput` objects are collected.
   * @param {Map<string, MathInput>} processedObjects - Map potentially used for memoization (appears unused currently).
   * @param {TokenUsage} usage - The token usage object, mutated by chain calls within this function.
   * @returns {Promise<void>}
   * @private
   * @deprecated Core recursive logic of the legacy generator, replaced by LangGraph's state machine.
   */
  private async processObjectAndSubObjects(
    userPrompt: string,
    objectType: ObjectType,
    parentContext: Record<string, unknown>,
    allObjects: MathInput[],
    processedObjects: Map<string, MathInput>,
    usage: TokenUsage // This object will be mutated
  ): Promise<void> {
    this.logger.debug(`Processing object type: ${objectType}`);

    // 1. Determine sub-object configuration using the map
    const subObjectConfig = SUB_OBJECT_CONFIG[objectType];
    const requiredSubType = subObjectConfig?.subObjectType;
    const subObjectsSettingsKey = subObjectConfig?.settingsKey;
    const isArrayProperty = subObjectConfig?.isArray ?? false; // Default to false if no config

    this.logger.debug(
      `Sub-object config for ${objectType}: ${subObjectConfig ? `Type: ${requiredSubType}, Key: ${subObjectsSettingsKey}, IsArray: ${isArrayProperty}` : "None"}`
    );

    // 2. Extract settings for the current object type itself
    const { settings: currentSettings, context: currentContext } =
      await this.extractSingleObjectSettings(userPrompt, objectType, parentContext, usage);

    this.logger.debug(
      `Extracted settings for ${objectType}: ${JSON.stringify(currentSettings, null, 2)}`
    );

    // 3. Prepare the main MathInput object structure
    // Use a type assertion acknowledging dynamic properties might be added
    const mathObject: MathInput = {
      objectType,
      priority: 0,
      // Dynamically set the settings property, e.g., termSettings, coefficientsSettings
      [`${objectType}Settings`]: {
        ...(currentSettings || {}), // Spread extracted settings
      },
    } as MathInput; // Asserting allows adding properties dynamically below if needed

    // 4. Handle sub-objects if configuration exists
    if (subObjectConfig && requiredSubType && subObjectsSettingsKey) {
      this.logger.debug(
        `Handling required sub-type: ${requiredSubType} for ${objectType}. Settings key: '${subObjectsSettingsKey}'`
      );

      // Get the parent settings object early and cast it for use throughout this block
      const parentSettingsObject = (mathObject as Record<string, unknown>)[`${objectType}Settings`];
      // Define indexableSettings here so it's available in the broader scope
      let indexableSettings: Record<string, unknown> | null = null;

      // Check if it's a non-null object before proceeding
      if (typeof parentSettingsObject === "object" && parentSettingsObject !== null) {
        // Assign the casted object to indexableSettings
        indexableSettings = parentSettingsObject as Record<string, unknown>;

        // Initialize only if it doesn't exist AND should be an array
        if (isArrayProperty && !(subObjectsSettingsKey in indexableSettings)) {
          indexableSettings[subObjectsSettingsKey] = [];
          this.logger.debug(
            `Initialized empty array for sub-object key '${subObjectsSettingsKey}' in ${objectType} settings.`
          );
        }
        // For single objects (isArrayProperty = false), assignment happens later if needed.
      } else {
        // Should not happen if extractSingleObjectSettings worked, but good practice
        this.logger.warn(
          `Settings object for ${objectType} not found after extraction. Cannot add sub-objects.`
        );
        allObjects.push(mathObject); // Push the object without sub-settings
        return;
      }

      // Get prompts from the context returned by the settings extractor for the *current* objectType
      let subPrompts: string[] | undefined = undefined; // Correct type: array of strings
      const extractorContextKey = `${objectType}SettingsExtractor`; // Construct the expected key for the nested context

      // Check if the extractor key exists and contains the subObjectPromptParts array
      if (
        currentContext && // Ensure context is not null/undefined
        extractorContextKey in currentContext &&
        typeof currentContext[extractorContextKey] === "object" &&
        currentContext[extractorContextKey] !== null &&
        "subObjectPromptParts" in currentContext[extractorContextKey] &&
        Array.isArray(currentContext[extractorContextKey].subObjectPromptParts)
      ) {
        // Extract the array
        subPrompts = currentContext[extractorContextKey].subObjectPromptParts as string[]; // Cast to string array
        this.logger.debug(
          `Found subObjectPromptParts in context.${extractorContextKey}: ${JSON.stringify(subPrompts)}`
        );
      } else {
        // Log if not found or if the structure is unexpected
        this.logger.debug(
          `No valid subObjectPromptParts array found under context.${extractorContextKey} for ${objectType}. Context received: ${JSON.stringify(currentContext)}`
        );
      }

      // --- Check if default sub-object settings were ALREADY handled ---
      // This logic seems specific to 'coefficients' being generated based on a 'default' prompt.
      // Let's refine the condition to be more robust and use the config.
      let skipSubObjectLoop = false;
      if (
        requiredSubType === "coefficients" &&
        userPrompt === "default" && // Check if the *parent's* prompt requested default
        isArrayProperty && // Ensure default logic applies only to arrays
        subPrompts && // Check if prompts exist
        Array.isArray(subPrompts) &&
        subPrompts.length === 1 &&
        subPrompts[0] === "default" && // Specifically check for a single "default" prompt
        // Check if the property exists, is an array, and has length > 0 safely
        Array.isArray((parentSettingsObject as Record<string, unknown>)?.[subObjectsSettingsKey]) &&
        ((parentSettingsObject as Record<string, unknown>)[subObjectsSettingsKey] as unknown[])
          .length > 0 // Assert as unknown[] before checking length
      ) {
        skipSubObjectLoop = true;
        this.logger.debug(
          `Default coefficients appear to be pre-filled for key '${subObjectsSettingsKey}'. Skipping explicit sub-object extraction loop.`
        );
      }

      // Proceed only if we are not skipping and have valid prompts
      if (!skipSubObjectLoop && subPrompts && Array.isArray(subPrompts) && subPrompts.length > 0) {
        this.logger.debug(
          `Found ${subPrompts.length} sub-object prompts for ${subObjectsSettingsKey}. Extracting individually...`
        );

        // If it's not an array property, only process the first prompt
        const promptsToProcess = isArrayProperty ? subPrompts : subPrompts.slice(0, 1);
        if (!isArrayProperty && subPrompts.length > 1) {
          this.logger.warn(
            `Multiple subObjectPromptParts found for non-array property '${subObjectsSettingsKey}' of ${objectType}. Using only the first prompt.`
          );
        }

        // Iterate and extract settings for each sub-object to process
        for (const subPrompt of promptsToProcess) {
          // Prepare context for the sub-object extraction
          const subObjectContext = {
            parentType: objectType, // Pass the actual parent type
            parentSettings: currentSettings, // Pass the parent's extracted settings
            ...currentContext, // Pass along other context from parent extraction
          };
          // Remove subObjectPromptParts from context passed down if it exists,
          // as it's specific to the parent's sub-object handling
          if ("subObjectPromptParts" in subObjectContext) {
            delete subObjectContext.subObjectPromptParts;
          }

          const { settings: subSettings } = await this.extractSingleObjectSettings(
            subPrompt,
            requiredSubType,
            subObjectContext, // Pass the refined context
            usage // Pass usage object
          );

          // Assign or push depending on whether it's an array property (using config)
          if (isArrayProperty) {
            // Add the extracted settings to the sub-objects array in the parent
            // Assert the target property as unknown[] before pushing
            (indexableSettings[subObjectsSettingsKey] as unknown[]).push(subSettings);
          } else {
            // Direct assignment for single sub-object properties
            // Assigning unknown is generally safer than any
            indexableSettings[subObjectsSettingsKey] = subSettings;
            // Break after processing the first prompt for non-array properties
            break;
          }
        }
        // Log appropriately based on whether it was an array or single assignment
        // Now indexableSettings should be accessible here, but check for null just in case
        if (isArrayProperty) {
          this.logger.debug(
            `Collected sub-object settings array for '${subObjectsSettingsKey}': ${JSON.stringify(indexableSettings?.[subObjectsSettingsKey], null, 2)}`
          );
        } else {
          this.logger.debug(
            `Assigned sub-object settings for '${subObjectsSettingsKey}': ${JSON.stringify(indexableSettings?.[subObjectsSettingsKey], null, 2)}`
          );
        }
      } else if (skipSubObjectLoop) {
        this.logger.debug(
          `Skipping sub-object extraction loop for '${subObjectsSettingsKey}' as default settings were applied or detected.`
        );
      } else {
        // Use parentSettingsObject directly here, as indexableSettings is out of scope
        this.logger.debug(
          `No valid subObjectPromptParts found or default handling applied for '${subObjectsSettingsKey}'. Property may be empty or pre-filled. Current value: ${JSON.stringify((parentSettingsObject as Record<string, unknown>)?.[subObjectsSettingsKey])}`
        );
        // Ensure array exists if it should be an array and wasn't pre-filled
        if (typeof parentSettingsObject === "object" && parentSettingsObject !== null) {
          // Use parentSettingsObject cast to Record<string, unknown> for safe access
          const settingsObj = parentSettingsObject as Record<string, unknown>;
          if (isArrayProperty && !(subObjectsSettingsKey in settingsObj)) {
            settingsObj[subObjectsSettingsKey] = [];
            this.logger.debug(
              `Initialized empty array for '${subObjectsSettingsKey}' as fallback.`
            );
          }
        }
        // For non-array (e.g., function.expression), if no prompt, it might remain undefined or rely on schema defaults. No explicit action here.
      }

      // --- Clean up subObjectPromptParts consistently ---\
      // Check the PARENT's settings object directly before finishing
      if (
        typeof parentSettingsObject === "object" &&
        parentSettingsObject !== null &&
        Object.prototype.hasOwnProperty.call(parentSettingsObject, "subObjectPromptParts")
      ) {
        // Use Record<string, unknown> for the cast
        delete (parentSettingsObject as Record<string, unknown>).subObjectPromptParts;
        this.logger.debug(`Removed subObjectPromptParts from final ${objectType} settings.`);
      }

      // Push the completed parent object containing sub-object settings
      allObjects.push(mathObject);
      this.logger.debug(
        `Completed ${objectType} MathObject with sub-objects: ${JSON.stringify(mathObject, null, 2)}`
      );
    }
    // Removed the specific block for handling "!subObjectsSettingsKey" as the config map approach inherently handles cases where there's no config entry (subObjectConfig would be undefined)
    // else if (requiredSubType && !subObjectsSettingsKey) { ... }
    else {
      // 5. Handle base types (no sub-objects config found)
      this.logger.debug(`${objectType} is a base type or has no sub-object configuration.`);
      // --- Clean up before finishing (also for base types) ---\
      const currentSettingsObject = (mathObject as Record<string, unknown>)[
        `${objectType}Settings`
      ];
      if (
        typeof currentSettingsObject === "object" &&
        currentSettingsObject !== null &&
        Object.prototype.hasOwnProperty.call(currentSettingsObject, "subObjectPromptParts")
      ) {
        // Use Record<string, unknown> for the cast
        delete (currentSettingsObject as Record<string, unknown>).subObjectPromptParts;
        this.logger.debug(`Removed subObjectPromptParts from final base ${objectType} settings.`);
      }
      // Simply push the object with its own settings
      allObjects.push(mathObject);
      this.logger.debug(
        `Completed base ${objectType} MathObject: ${JSON.stringify(mathObject, null, 2)}`
      );
    }
  }
}
