/**
 * @file Defines conditional logic functions for the LangGraph workflow.
 * These functions determine the next node to execute based on the current graph state,
 * enabling branching and looping within the graph.
 */
import { GraphStateType } from "./state";
import { SUB_OBJECT_TYPE } from "../../shared/constants/constants";
import { createComponentLogger } from "@websites/infrastructure/logging";

/**
 * Determines the next node after settings have been extracted for the current object.
 * Logic:
 * 1. If an error exists in the state, go to `handle_error`.
 * 2. If critical state (`currentObjectType`, `currentSettings`) is missing, go to `handle_error`.
 * 3. If the current object type requires sub-objects (based on `SUB_OBJECT_TYPE` constant)
 *    AND sub-object prompts were successfully extracted into `currentSettings.subObjectPromptParts`,
 *    then go to `push_context_and_prepare_descend` to process the first sub-object.
 * 4. Otherwise (no sub-objects required, or prompts weren't extracted), go to `complete_current_level`
 *    to finalize the current object.
 *
 * @param {GraphStateType} state The current graph state after the `extract_settings` node.
 * @returns {"push_context_and_prepare_descend" | "complete_current_level" | "handle_error"} The name of the next node.
 */
export function should_descend_or_complete(
  state: GraphStateType
): "push_context_and_prepare_descend" | "complete_current_level" | "handle_error" {
  const logger = createComponentLogger("LangGraph", "should_descend_or_complete");

  logger.info("Entering Condition Check");
  logger.info("State", { state });

  if (state.error) {
    logger.info("Decision: Error detected -> handle_error");
    return "handle_error";
  }
  if (!state.currentObjectType || !state.currentSettings) {
    logger.info("Decision: Missing currentObjectType or currentSettings -> handle_error");
    // We shouldn't proceed without settings having been extracted
    return "handle_error"; // Or potentially a specific error state?
  }

  // Check if the *current* object type requires sub-objects
  const requiredSubType = SUB_OBJECT_TYPE[state.currentObjectType] ?? undefined;
  // Check if the extracted settings contain prompts for sub-objects
  const subPrompts = Array.isArray(state.currentSettings?.subObjectPromptParts)
    ? state.currentSettings.subObjectPromptParts
    : [];

  if (requiredSubType && subPrompts.length > 0) {
    // Case 1: Sub-objects are required and prompts were extracted. Descend.
    logger.info(
      `Decision: Type ${state.currentObjectType} requires sub-type ${requiredSubType} and has ${subPrompts.length} prompts -> push_context_and_prepare_descend`
    );
    return "push_context_and_prepare_descend";
  } else {
    // Case 2: No sub-objects required or no prompts found. Complete this level.
    if (requiredSubType && subPrompts.length === 0) {
      logger.warn(
        `Warning: Type ${state.currentObjectType} requires sub-type ${requiredSubType}, but no sub-prompts were extracted. Proceeding to complete level.`
      );
    } else {
      logger.info(
        `Decision: Type ${state.currentObjectType} requires no sub-objects or no prompts found -> complete_current_level`
      );
    }
    return "complete_current_level";
  }
}

/**
 * Determines the next node after attempting to complete the processing for an object
 * (either a sub-object or the top-level object).
 * Logic (checked in order):
 * 1. If an error exists in the state, go to `handle_error`.
 * 2. If the context stack is empty AND the current object processing seems complete
 *    (has `currentSettings` and `currentObjectType`), it means the top-level object is finished.
 *    Go to `finalize_object`.
 * 3. If a `currentPrompt` and `currentObjectType` exist, it implies the `complete_current_level` node
 *    prepared the state to process the *next sibling* sub-object. Go back to `extract_settings`.
 * 4. If the stack is *not* empty, the current object processing is complete (`currentSettings`, `currentObjectType`),
 *    and there's *no* `currentPrompt` (meaning no more siblings), it implies a parent object has just been
 *    fully assembled (all its children processed). Go back to `complete_current_level` to process this
 *    now-completed parent object (popping it from the stack).
 * 5. If none of the above conditions match, it indicates an unexpected state. Go to `handle_error`.
 *
 * @param {GraphStateType} state The current graph state after the `complete_current_level` node.
 * @returns {"extract_settings" | "complete_current_level" | "finalize_object" | "handle_error"} The name of the next node.
 */
export function should_continue_or_finalize(
  state: GraphStateType
): "extract_settings" | "complete_current_level" | "finalize_object" | "handle_error" {
  const logger = createComponentLogger("LangGraph", "should_continue_or_finalize");

  logger.info("Entering Condition Check");
  logger.info("State (after complete_current_level attempt)", { state });

  if (state.error) {
    logger.info("Decision: Error detected -> handle_error");
    return "handle_error";
  }

  const stackIsEmpty = state.contextStack.length === 0;
  const hasCurrentSettings = !!state.currentSettings;
  const hasCurrentObjectType = !!state.currentObjectType;
  const hasCurrentPrompt = !!state.currentPrompt;

  // Priority 1: Finalization (Stack MUST be empty, and settings must exist)
  if (stackIsEmpty && hasCurrentSettings && hasCurrentObjectType) {
    logger.info("Decision: Stack empty, final object ready -> finalize_object");
    return "finalize_object";
  }
  // Priority 2: Next Sibling (Prompt must exist)
  else if (hasCurrentPrompt && hasCurrentObjectType) {
    logger.info("Decision: Prepared for next sibling -> extract_settings");
    return "extract_settings";
  }
  // Priority 3: Parent Assembled (Stack MUST NOT be empty, settings exist, no prompt)
  else if (!stackIsEmpty && hasCurrentSettings && hasCurrentObjectType && !hasCurrentPrompt) {
    logger.info(
      "Decision: Parent assembled, stack not empty, process parent -> complete_current_level"
    );
    return "complete_current_level"; // Loop back to process the assembled parent
  }
  // Error Case: Unexpected state
  else {
    logger.error(
      `Decision: Unexpected state -> handle_error. Stack Empty: ${stackIsEmpty}, Has Settings: ${hasCurrentSettings}, Has Type: ${hasCurrentObjectType}, Has Prompt: ${hasCurrentPrompt}`
    );
    return "handle_error";
  }
}
