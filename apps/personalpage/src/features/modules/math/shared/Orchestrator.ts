/**
 * @file Math Object Generation Orchestrator
 * @description Defines functions to manage the generation of math objects based on
 *              input settings (`MathInput`), handling priorities and simple dependencies.
 */
import { MathInput, MathObjects } from "../types/index";
import { generateObjects } from "../mathObjects/core/generateObjectFactory";
import { updateDependentSettings } from "../mathObjects/utils/dependencyUtils";

/**
 * Groups an array of `MathInput` objects into a Map based on their `priority` property.
 *
 * @param {MathInput[]} inputs - An array of math input settings.
 * @returns {Map<number, MathInput[]>} A Map where keys are priority numbers (defaulting to 0)
 *                                    and values are arrays of `MathInput` objects with that priority.
 */
export function groupByPriority(inputs: MathInput[]): Map<number, MathInput[]> {
    const groups = new Map<number, MathInput[]>();
    inputs.forEach(input => {
        const priority = input.priority || 0;
        if (!groups.has(priority)) {
            groups.set(priority, []);
        }
        groups.get(priority)!.push(input);
    });
    return groups;
}

/**
 * Generates math objects by processing input groups in ascending order of priority.
 * It handles simple dependencies by updating settings in a priority group based on
 * the *first* object generated in the immediately preceding priority group.
 *
 * @param {MathInput[]} inputs - The initial array of math input settings.
 * @param {(inputs: MathInput[]) => MathObjects[]} generateObjectsFunc - The function used to generate objects for a group of inputs.
 * @param {(input: MathInput, parent: MathObjects) => void} updateDependentSettingsFunc - The function used to update an input's settings based on a potential parent object.
 * @returns {MathObjects[]} An array containing all generated `MathObjects`, ordered by priority and then by input order within the priority group.
 * @remarks The dependency mechanism is simplified: only the first object generated in the previous priority group
 *          is considered as a potential parent for dependency resolution (`updateDependentSettingsFunc`).
 * @private
 */
function generateByPriority(
    inputs: MathInput[],
    generateObjectsFunc: (inputs: MathInput[]) => MathObjects[],
    updateDependentSettingsFunc: (input: MathInput, parent: MathObjects) => void
): MathObjects[] {
    // Group inputs by their priority value
    const groups = groupByPriority(inputs);
    // Sort priorities from lowest to highest
    const sortedPriorities = Array.from(groups.keys()).sort((a, b) => a - b);

    const generatedObjects: MathObjects[] = [];
    let lastGroupGenerated: MathObjects[] = [];

    // Iterate through each priority group in order
    for (const priority of sortedPriorities) {
        const groupInputs = groups.get(priority)!;

        if (priority === 0) {
            // Priority 0: no dependencies, generate directly
            const groupGenerated = generateObjectsFunc(groupInputs);
            generatedObjects.push(...groupGenerated);
            lastGroupGenerated = groupGenerated;
        } else {
            // Higher priorities: may depend on previous group
            if (lastGroupGenerated.length === 0) {
                // Warn if no previous group exists for dependency resolution
                console.warn(`No generated objects found for dependency resolution at priority ${priority}`);
                continue;
            }
            // Use the first object from the previous group as the parent for dependencies
            const parentObj = lastGroupGenerated[0];
            groupInputs.forEach(dependentInput => {
                updateDependentSettingsFunc(dependentInput, parentObj);
            });
            // Generate objects for this group
            const groupGenerated = generateObjectsFunc(groupInputs);
            generatedObjects.push(...groupGenerated);
            lastGroupGenerated = groupGenerated;
        }
    }
    // Return all generated objects in order
    return generatedObjects;
}

/**
 * Orchestrates the generation of math objects from an array of input settings.
 * It groups inputs by priority, resolves simple dependencies between priority groups,
 * generates the objects, and returns their LaTeX string representations.
 *
 * @param {MathInput[]} inputs - An array of math input settings defining the objects to be generated.
 * @returns {string[]} An array of LaTeX strings, each representing a generated math object.
 * @remarks
 * - Uses `generateByPriority` internally to handle priority grouping and dependency updates.
 * - The dependency update logic relies on `updateDependentSettings` from `../mathObjects/utils/dependencyUtils`.
 * - Object generation is performed by `generateObjects` from `../mathObjects/core/generateObjectFactory`.
 */
export function generate(inputs: MathInput[]): string[] {
    // Use the helper to generate all objects by priority, resolving dependencies
    const generatedObjects = generateByPriority(inputs, generateObjects, updateDependentSettings);

    // Only return the main LaTeX string for each generated object
    return generatedObjects.map(item => item.mathItem || "");
}



