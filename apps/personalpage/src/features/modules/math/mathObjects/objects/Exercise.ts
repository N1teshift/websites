import { MathObjects } from "@math/types/mathTypes";

import { MathObject } from "./MathObject"
import { ExerciseSettings } from "../../types/mathObjectSettingsInterfaces";
// import { generateExercise } from "../core/index"; // Assuming a utility function exists or will exist

/**
 * @class Exercise
 * @description Represents a mathematical exercise composed of multiple generated math objects (like equations, terms, etc.).
 *
 * @remarks
 * This class takes an array of already generated `MathObject` instances.
 * It extracts their string representations (`generatedItem`) and potentially formats them
 * into a complete exercise string using settings like instructions or question templates.
 * The formatting logic (`generateExercise`) is currently commented out.
 * Note: This class currently does *not* extend `MathObject` itself, which might be intended
 * if its structure or generation process differs significantly.
 */
export class Exercise {
	/** The configuration settings specific to this exercise format. */
	public settings: ExerciseSettings;
	/** An array holding the string representations (`generatedItem`) of the input math objects. */
	public generatedItems: string[] = [];
	/** The final formatted string representing the complete exercise. */
	public exercise: string = "";

	/**
	 * Creates an instance of Exercise.
	 * @param {ExerciseSettings} settings - The settings for this exercise object, potentially including instructions, templates, etc.
	 *
	 * @example
	 * const settings: ExerciseSettings = {
	 *   objectType: 'exercise',
	 *   complexity: 'simple',
	 *   instructions: "Solve the following equation:"
	 * };
	 * const exercise = new Exercise(settings);
	 */
	constructor(settings: ExerciseSettings) {
		this.settings = settings;
	}

	/**
	 * Generates the exercise string by combining the provided math objects based on settings.
	 * @param {MathObjects[]} objects - An array of already generated `MathObject` instances that form the content of the exercise.
	 *
	 * @remarks
	 * Currently, this method primarily extracts the `generatedItem` from each input object.
	 * The call to a formatting function (`generateExercise`) is commented out and would need
	 * to be implemented to produce the final `this.exercise` string.
	 */
	public generate(objects: MathObjects[]): void {
		// Ensure we are working with MathObject instances and filter out any potential null/undefined items
		this.generatedItems = (objects as MathObject[])
			.map(obj => obj?.generatedItem) // Use optional chaining
			.filter((item): item is string => typeof item === 'string');

		// TODO: Implement and uncomment the actual exercise formatting logic
		// this.exercise = generateExercise(this.generatedItems, this.settings);

		// Basic placeholder joining generated items until formatting logic exists:
		this.exercise = this.generatedItems.join("; "); // Join items with a semicolon and space
	}
}



