/**
 * @file Defines graph nodes responsible for completing object processing,
 * handling the ascent from sub-objects to parents, finalizing the top-level object,
 * and managing error states.
 */
import { GraphStateType } from "../state";
import { MathInput } from '@math/types/index';
import { createComponentLogger } from '@websites/infrastructure/logging';

/**
 * Graph Node: Completes processing for the current object (`currentSettings`).
 * This node handles the crucial logic for ascending the processing stack.
 * 
 * Logic:
 * 1. If `contextStack` is empty:
 *    - The current object is the top-level one.
 *    - Prepare state for `finalize_object` node.
 * 2. If `contextStack` is not empty:
 *    - Pop the `parentContext` from the stack.
 *    - Add `currentSettings` (the completed sub-object) to `parentContext.collectedSubSettings`.
 *    - If `parentContext.pendingSubPrompts` is not empty:
 *      - Update state (`currentObjectType`, `currentPrompt`) to process the next sibling sub-object.
 *      - Return state targeting the `extract_settings` node.
 *    - If `parentContext.pendingSubPrompts` is empty (all siblings done):
 *      - Assemble the parent object by merging `collectedSubSettings` into `parentContext.parentBaseSettings`.
 *      - Update state (`currentObjectType`, `currentSettings`) to represent the now-completed parent.
 *      - Return state targeting this `complete_current_level` node again to process the parent's completion.
 * Handles cases where `currentSettings` might be missing due to errors during sub-object processing.
 * 
 * @param {GraphStateType} state The current graph state, expecting `currentSettings`, `currentObjectType`, and `contextStack`.
 * @returns {Promise<Partial<GraphStateType>>} A partial state update directing the graph to the next logical step (finalize, extract next sibling, or re-evaluate completion for the parent).
 */
export async function complete_current_level(state: GraphStateType): Promise<Partial<GraphStateType>> {
    const logger = createComponentLogger('LangGraph', 'complete_current_level');
    
    logger.info("Entering Node");
    logger.info("Input State", { state });

    if (state.error) {
        logger.info("Propagating error, cannot complete level.");
        return { error: state.error }; // Let error handling take over
    }
    // Allow proceeding even if currentSettings is null/undefined IF stack is not empty
    // This handles cases where an error occurred during a sub-extraction but we need to ascend.
    if (!state.currentSettings && state.contextStack.length > 0) {
         logger.warn("Warning: No currentSettings found, but stack is not empty. Attempting to ascend.");
         // Continue to ascend logic, parentContext might just have fewer collectedSubSettings.
    } else if (!state.currentSettings && state.contextStack.length === 0) {
         logger.error("Error: No currentSettings to complete and stack is empty.");
         return { error: "Cannot complete level: currentSettings is missing and stack is empty." };
    }


    const completedObjectSettings = state.currentSettings; // This might be null/undefined if ascending from error

    if (state.contextStack.length === 0) {
        // --- Case 1: Stack is empty - Finalize the top-level object ---
        logger.info("Context stack is empty. Preparing to finalize the top-level object.");
         if (!completedObjectSettings) {
             logger.error("Error: Stack empty but no final object settings found.");
             return { error: "Cannot finalize: final settings missing." };
         }
        // The currentSettings hold the fully assembled top-level object.
        // The finalize_object node will handle putting it into accumulatedObjects.
        logger.info("Exiting Node (Proceed to Finalize)");
        return { error: undefined }; // Ensure no error is passed if successful completion

    } else {
        // --- Case 2: Stack is not empty - Ascend: Collect into parent ---
        logger.info("Context stack is not empty. Ascending to parent.");

        const parentContext = state.contextStack[state.contextStack.length - 1];
        const remainingStack = state.contextStack.slice(0, -1);

        logger.info("Parent Context Popped", { parentContext });

        // Add the completed sub-object to the parent's collected settings (only if it exists)
        const updatedCollectedSubSettings = completedObjectSettings
            ? [...parentContext.collectedSubSettings, completedObjectSettings]
            : [...parentContext.collectedSubSettings]; // Keep existing if current one failed

        if (completedObjectSettings) {
            logger.info(`Collected ${updatedCollectedSubSettings.length} sub-settings for parent ${parentContext.parentObjectType}.`);
        } else {
             logger.info(`Sub-object failed, collected ${updatedCollectedSubSettings.length} settings so far for parent ${parentContext.parentObjectType}.`);
        }


        if (parentContext.pendingSubPrompts.length > 0) {
            // --- Sub-Case 2a: More siblings to process ---
            logger.info("Parent has more pending sub-prompts. Processing next sibling.");
            const nextPrompt = parentContext.pendingSubPrompts[0];
            const remainingPrompts = parentContext.pendingSubPrompts.slice(1);

            // Explicitly construct the updated context to satisfy TS
            const updatedParentContext = {
                parentObjectType: parentContext.parentObjectType,
                parentBaseSettings: parentContext.parentBaseSettings, // Ensure required field is present
                pendingSubPrompts: remainingPrompts,
                expectedSubObjectType: parentContext.expectedSubObjectType,
                collectedSubSettings: updatedCollectedSubSettings,
                subSettingsKey: parentContext.subSettingsKey,
                expectsSingleSubObject: parentContext.expectsSingleSubObject, // Pass flag along
            };


            logger.info("Updated Parent Context (for stack)", { updatedParentContext });

            const update = {
                contextStack: [...remainingStack, updatedParentContext],
                currentObjectType: parentContext.expectedSubObjectType,
                currentPrompt: nextPrompt,
                currentSettings: undefined, // Clear settings before extraction
                error: undefined, // Clear error from potential sub-failure before processing sibling
            };
            logger.info("State Update for Next Sibling", { update });
            logger.info("Exiting Node (Processing Next Sibling)");
            return update;

        } else {
            // --- Sub-Case 2b: All siblings processed - Complete the parent ---
            logger.info("All sub-objects for the parent processed. Completing parent object.");

            const assembledParentSettings = { ...parentContext.parentBaseSettings };
            if (parentContext.subSettingsKey) {
                // --- Check expectsSingleSubObject flag ---            
                if (parentContext.expectsSingleSubObject) {
                    if (updatedCollectedSubSettings.length === 1) {
                        assembledParentSettings[parentContext.subSettingsKey] = updatedCollectedSubSettings[0];
                        logger.info(`Merged single sub-setting into key '${parentContext.subSettingsKey}' for parent ${parentContext.parentObjectType}.`);
                    } else {
                        logger.error(`Error: Expected single sub-object for key '${parentContext.subSettingsKey}' in parent ${parentContext.parentObjectType}, but found ${updatedCollectedSubSettings.length}. Storing array as fallback.`);
                        // Fallback: Store the array anyway to avoid losing data, but log error
                        assembledParentSettings[parentContext.subSettingsKey] = updatedCollectedSubSettings;
                        // Optionally, set an error state here:
                        // state.error = `Expected single sub-object for ${parentContext.subSettingsKey}, got ${updatedCollectedSubSettings.length}`;
                    }
                } else {
                    // Original behavior: Assign the array
                    assembledParentSettings[parentContext.subSettingsKey] = updatedCollectedSubSettings;
                    logger.info(`Merged ${updatedCollectedSubSettings.length} sub-settings into key '${parentContext.subSettingsKey}' for parent ${parentContext.parentObjectType}.`);
                }
                // --- END MODIFICATION ---
            } else {
                 logger.warn(`Warning: No subSettingsKey found for parent ${parentContext.parentObjectType}. Sub-settings stored under generic 'children' key.`);
                 assembledParentSettings['children'] = updatedCollectedSubSettings;
            }

            logger.info("Assembled Parent Object Settings", { assembledParentSettings });

            const update = {
                contextStack: remainingStack,
                currentSettings: assembledParentSettings,
                currentObjectType: parentContext.parentObjectType,
                currentPrompt: undefined,
                error: undefined, // Clear error state as parent assembly is successful
            };
            logger.info("State Update (Parent Completed)", { update });
            logger.info("Exiting Node (Parent Completed, Looping back to Complete Level)");
            return update;
        }
    }
}

/**
 * Graph Node: Finalizes the processing by taking the fully assembled top-level object
 * settings and formatting them into a `MathInput` object.
 * 
 * - Constructs the final `MathInput` object using `state.currentObjectType` and `state.currentSettings`.
 * - Adds this object to the `state.accumulatedObjects` list.
 * - Clears temporary processing state fields (`currentObjectType`, `currentSettings`, `currentPrompt`, `contextStack`).
 * - This node typically leads to the `END` state of the graph.
 * 
 * @param {GraphStateType} state The current graph state, expecting `currentObjectType` and `currentSettings` to hold the completed top-level object data.
 * @returns {Promise<Partial<GraphStateType>>} A partial state update containing the final `accumulatedObjects` list and cleared processing fields.
 */
export async function finalize_object(state: GraphStateType): Promise<Partial<GraphStateType>> {
    const logger = createComponentLogger('LangGraph', 'finalize_object');
    
    logger.info("Entering Node");
    logger.info("Input State", { state });

    if (state.error) {
        logger.info("Propagating previous error");
        logger.info("Exiting Node (Error)");
        return { error: state.error };
    }

    const finalSettings = state.currentSettings;
    const objectTypeToFinalize = state.currentObjectType;

    if (!finalSettings || !objectTypeToFinalize) {
        logger.error("Error: Missing finalSettings or objectTypeToFinalize.");
        logger.info("Exiting Node (Error)");
        return { error: "Cannot finalize: Missing final settings or object type." };
    }

    logger.info(`Finalizing top-level object of type: ${objectTypeToFinalize}`);
    logger.info("Final Settings", { finalSettings });

    const settingsKey = `${objectTypeToFinalize}Settings`;
    // Keep the cast here as TypeScript struggles with the dynamic key for discriminated unions
    const mathObject = {
      objectType: objectTypeToFinalize,
      priority: 0,
      [settingsKey]: finalSettings,
    } as unknown as MathInput;

    logger.info("Constructed Final MathInput Object", { mathObject });

    const update = {
        accumulatedObjects: [mathObject],
        currentObjectType: undefined,
        currentSettings: undefined,
        currentPrompt: undefined,
        contextStack: [],
        error: undefined,
        validationErrors: [],
    };

     logger.info("State Update (Finalization)", { update });
     logger.info("Exiting Node (Success)");
    return update;
}

/**
 * Graph Node: Terminal node for handling errors encountered during graph execution.
 * 
 * - Logs the error details (`state.error` and `state.validationErrors`).
 * - Clears transient processing state (`currentObjectType`, `currentSettings`, `currentPrompt`, `contextStack`)
 *   to prevent inconsistent state if retries were implemented.
 * - Preserves the `error`, `validationErrors`, `userPrompt`, `identifiedType`, `messages`, and any potentially
 *   partially completed `accumulatedObjects`.
 * - This node leads to the `END` state of the graph.
 * 
 * @param {GraphStateType} state The current graph state, expecting `state.error` to be populated.
 * @returns {Promise<Partial<GraphStateType>>} A partial state update that clears temporary fields while preserving the error information.
 */
export async function handle_error(state: GraphStateType): Promise<Partial<GraphStateType>> {
    const logger = createComponentLogger('LangGraph', 'handle_error');
    
    logger.info("Entering Node");
    logger.error(`Input State (Error): ${state.error}`);
    logger.error(`Validation Errors: ${state.validationErrors?.join(', ')}`);
    logger.info("Full State", { state });

    console.error("--- ERROR Node Reached ---");
    console.error("Graph execution error:", state.error);
    if (state.validationErrors && state.validationErrors.length > 0) {
        console.error("Validation errors:", state.validationErrors);
    }

    // Clear temporary/processing fields to prevent loops/bad state on potential retries (if implemented)
    // Keep error, validationErrors, userPrompt, identifiedType, accumulatedObjects (partially completed?)
    const update = {
         currentObjectType: undefined,
         currentSettings: undefined,
         currentPrompt: undefined,
         contextStack: [], // Clear the stack
         // Keep: error, validationErrors, userPrompt, identifiedType, messages, accumulatedObjects
    };
    logger.info("State Update (Clearing Temp Fields)", { update });
    logger.info("Exiting Node (Error Handled)");
    return update; // Return update to clear fields, keeping the error message
} 



