/**
 * Substitutes {inputN} placeholders in an array of strings with corresponding generated input values.
 * @param {string[]} targetArray - The array of strings (e.g., question lines, options) containing placeholders.
 * @param {string[]} generatedInputs - The array of generated input values to substitute.
 * @returns {string[]} A new array with placeholders substituted.
 */
export const substituteInputs = (targetArray: string[], generatedInputs: string[]): string[] => {
  console.log("generatedInputs at substitute function:", generatedInputs);
  return targetArray.map((line) =>
    line.replace(/{input(\d+)}/g, (match, mainIndexStr) => {
      const mainIndex = parseInt(mainIndexStr, 10) - 1;
      const replacement = generatedInputs[mainIndex];
      return replacement !== undefined ? replacement : match;
    })
  );
};

/**
 * Constructs a single array by combining question lines and formatted options.
 * Options are interleaved with empty strings, and the final empty string is removed.
 * @param {string[]} question - Array of question lines.
 * @param {string[]} options - Array of option strings.
 * @returns {string[]} The combined array representing the full exercise text structure.
 */
export const constructExerciseArray = (question: string[], options: string[]): string[] =>
  [...question, ...options.flatMap((option) => [option, ""])].slice(0, -1);
