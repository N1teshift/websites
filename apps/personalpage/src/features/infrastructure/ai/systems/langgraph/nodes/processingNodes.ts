/**
 * @file Defines graph nodes responsible for the core processing loop:
 * extracting settings for the current object and managing the context stack for recursion.
 */
import { GraphStateType, ProcessingContext } from "../state";
import { createSettingsExtractorRunnable } from "../runnables";
import { SUB_OBJECT_TYPE } from '../../../shared/constants/constants';
import { DEFAULT_COEFFICIENT_SETTINGS } from '@math/types/index';
import { createComponentLogger } from '@websites/infrastructure/logging';
import { TokenUsageCallbackHandler } from "../tokenHandler";
import { parentExpectsSingleChild } from "../helpers";

/**
 * Graph Node: Extracts settings for the object specified by `state.currentObjectType`,
 * using the prompt in `state.currentPrompt`.
 * 
 * It invokes the appropriate `createSettingsExtractorRunnable` for the object type.
 * Includes special logic to generate default coefficients settings based on parent context,
 * bypassing the LLM if `currentObjectType` is 'coefficients' and `currentPrompt` is 'default'.
 * Stores the validated settings in `state.currentSettings`. Also handles and stores validation errors.
 * 
 * @param {GraphStateType} state The current graph state, expecting `currentObjectType` and `currentPrompt`.
 * @returns {Promise<Partial<GraphStateType>>} A partial state update with `currentSettings` and potentially `error` and `validationErrors`.
 */
export async function extract_settings(state: GraphStateType): Promise<Partial<GraphStateType>> {
    const logger = createComponentLogger('LangGraph', `extract_settings_${state.currentObjectType}`);
    
    logger.info(`Entering Node (Prompt: "${state.currentPrompt?.substring(0, 50)}...")`);
    logger.info("Input State", { state });

    if (state.error) {
        logger.info("Propagating previous error");
        logger.info("Exiting Node (Error)");
        return { error: state.error };
    }
    const currentObjectType = state.currentObjectType;
    if (!currentObjectType || !state.currentPrompt) {
        logger.error("Error: Missing currentObjectType or currentPrompt.");
        logger.info("Exiting Node (Error)");
        return { error: "Cannot extract settings: Missing currentObjectType or currentPrompt." };
    }

    // --- Special Handling for Default Coefficients based on Parent Term TermIds ---    
    if (currentObjectType === 'coefficients' && 
        state.currentPrompt === 'default' && 
        state.contextStack.length > 0) {
        
        const parentContext = state.contextStack[state.contextStack.length - 1];
        const parentTermIds = parentContext.parentBaseSettings?.termIds;

        if (parentContext.parentObjectType === 'term' && 
            Array.isArray(parentTermIds) && 
            parentTermIds.length > 0) {

            const termIdsLength = parentTermIds.length;
            logger.info(`Applying default coefficients generation logic based on parent term's termIds length: ${termIdsLength}`);

            const collectionCount = termIdsLength;
            const coefficientsArray = Array(collectionCount).fill(null).map(() => ({ ...DEFAULT_COEFFICIENT_SETTINGS }));

            const defaultSettings = {
                collectionCount,
                coefficients: coefficientsArray,
                rules: [], // Assuming default empty rules
                // NOTE: No subObjectPromptParts needed here as we are generating defaults
            };

            logger.info("Constructed Default Coefficients Settings", { defaultSettings });

            // Bypass LLM call and return the constructed settings
            const update = {
                currentSettings: defaultSettings,
                error: undefined,
                validationErrors: [],
            };
            logger.info("State Update (Storing Default Settings)", { update });
            logger.info("Exiting Node (Success - Default Settings Applied)");
            return update;
        } else {
             logger.info(`Default prompt for coefficients, but parent context doesn't match expected term structure. Proceeding with LLM extraction.`);
        }
    }
    // --- END Special Handling ---

    // If special handling didn't apply, proceed with LLM extraction
    try {
        // Instantiate the token usage callback handler
        const tokenCallback = new TokenUsageCallbackHandler();
        // Get the runnable for settings extraction for the current object type
        const settingsExtractorRunnable = createSettingsExtractorRunnable(currentObjectType);
        // Invoke the runnable, passing the callback in the config
        const settings = await settingsExtractorRunnable.invoke(
            { userPrompt: state.currentPrompt }, // Pass the current prompt
            { callbacks: [tokenCallback] }       // Pass the callback handler instance
        );

        logger.info("Raw Settings Extracted", { settings });

        // Store the extracted settings temporarily. The conditional node will decide what to do next.
        const update = {
            currentSettings: settings,
            error: undefined, // Clear previous errors
            validationErrors: [], // Clear previous validation errors
        };

        logger.info("State Update (Storing Extracted Settings)", { update });
        logger.info("Exiting Node (Success - Settings Extracted)");
        return update;

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Error extracting settings: ${errorMessage}`);
        console.error(`Error in extract_settings for ${currentObjectType}:`, error);
        
        // Handle validation errors if available
        const validationErrors = error instanceof Error && 'errors' in error
            ? (error as unknown as { errors: Array<{ path: string[], message: string }> }).errors?.map(
                e => `${e.path.join('.')}: ${e.message}`
              ) || []
            : [];
            
        const fullErrorMessage = `Settings extraction failed for ${currentObjectType}. ${errorMessage}`;
        logger.error(`Validation Errors: ${validationErrors.join(', ')}`);
        logger.info("Exiting Node (Error)");
        
        // Store both general error and specific validation errors
        return { 
            error: fullErrorMessage, 
            validationErrors: validationErrors, 
            currentSettings: undefined 
        };
    }
}

/**
 * Graph Node: Prepares the state to recursively process a sub-object.
 * 
 * This node is called when the `extract_settings` node found sub-object prompts.
 * 1. Creates a new `ProcessingContext` containing the current object's type (`parentObjectType`),
 *    its settings (`parentBaseSettings` excluding sub-prompts), the remaining sub-prompts
 *    (`pendingSubPrompts`), the expected type of the sub-object (`expectedSubObjectType`),
 *    and the key where sub-objects should be stored (`subSettingsKey`).
 * 2. Pushes this context onto the `state.contextStack`.
 * 3. Updates `state.currentObjectType` to the `expectedSubObjectType`.
 * 4. Updates `state.currentPrompt` to the first prompt from the `subObjectPromptParts` list.
 * 5. Clears `state.currentSettings` to ready it for the sub-object's extraction.
 * 
 * @param {GraphStateType} state The current graph state, expecting `currentObjectType`, `currentSettings` (with `subObjectPromptParts`), and `contextStack`.
 * @returns {Promise<Partial<GraphStateType>>} A partial state update setting up the context stack and preparing `currentObjectType` and `currentPrompt` for the first sub-object.
 */
export const push_context_and_prepare_descend = async (
  state: GraphStateType,
  _options: { subObjectType?: string } = {}
): Promise<Partial<GraphStateType>> => {
  const logger = createComponentLogger('LangGraph', 'push_context_and_prepare_descend');
  
  try {
    // Defensive check to ensure contextStack exists
    if (!state.contextStack) {
      logger.info("push_context_and_prepare_descend: contextStack is undefined, initializing as empty array");
      state.contextStack = [];
    }

    // Ensure required fields exist
    if (!state.currentObjectType) {
      return {
        ...state,
        error: "Cannot descend when no object type is identified"
      };
    }

    logger.info("Entering Node");
    logger.info("Input State", { state });

    if (!state.currentObjectType || !state.currentSettings) {
        logger.error("Error: Missing currentObjectType or currentSettings.");
        return { error: "Cannot descend: Missing current object type or settings." };
    }

    const parentType = state.currentObjectType;
    const parentSettings = state.currentSettings;
    const requiredSubType = SUB_OBJECT_TYPE[parentType];
    const subPrompts = Array.isArray(parentSettings?.subObjectPromptParts)
        ? parentSettings.subObjectPromptParts : [];

    if (!requiredSubType || subPrompts.length === 0) {
        logger.error("Error: Cannot descend. No required sub-type or no sub-prompts.");
        return { error: "Cannot descend: Missing required sub-type or sub-prompts." };
    }

    // Determine the key under which sub-settings will be stored (often based on sub-type)
    const subSettingsKey = requiredSubType === 'coefficient' ? 'coefficients' : requiredSubType;

    // Remove subObjectPromptParts from the settings we store in the context
    const { subObjectPromptParts: _subObjectPromptParts, ...parentBaseSettings } = parentSettings;

    // Determine if the parent expects a single child object
    const expectsSingle = parentExpectsSingleChild(parentType, subSettingsKey);

    const newContext: ProcessingContext = {
        parentObjectType: parentType,
        parentBaseSettings: parentBaseSettings, // Store settings *without* sub-prompts
        pendingSubPrompts: subPrompts.slice(1), // Prepare remaining prompts
        expectedSubObjectType: requiredSubType,
        collectedSubSettings: [],
        subSettingsKey: subSettingsKey,
        expectsSingleSubObject: expectsSingle, // Set the flag
    };

    logger.info("Pushing new context", { newContext });

    const update = {
        contextStack: [...state.contextStack, newContext],
        currentObjectType: requiredSubType,
        currentPrompt: subPrompts[0], // Set the first prompt for the sub-object
        currentSettings: undefined, // Clear settings before extracting sub-object
        error: undefined,
    };

    logger.info("State Update for Descent", { update });
    logger.info("Exiting Node (Success)");
    return update;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error in push_context_and_prepare_descend: ${errorMessage}`);
    console.error(`Error in push_context_and_prepare_descend:`, error);
    return {
      ...state,
      error: errorMessage
    };
  }
} 



