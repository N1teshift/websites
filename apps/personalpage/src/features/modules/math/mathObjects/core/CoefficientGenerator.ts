import { NumberSet, CoefficientRule } from "../../types/mathTypes";
import { isCoefficientSettingsCombinationValid } from "../../shared/coefficientConceptualValidator";
import { isSquare, randomInt, randomChoice, getRuleValidator } from "../../shared/numberUtils";

/**
 * Generates a random rational number (fraction) within a specified range [minVal, maxVal].
 * The fraction is represented as an array `[numerator, denominator]`, where denominator is positive.
 *
 * @param {number} [minVal=-10] - The minimum value for the rational number (inclusive).
 * @param {number} [maxVal=10] - The maximum value for the rational number (inclusive).
 * @returns {number[]} A two-element array `[numerator, denominator]` representing the rational number.
 * @throws {Error} If `minVal` is not less than `maxVal`.
 * @throws {Error} If no valid denominator can be found to satisfy the range (should be rare with default `maxDenom`).
 *
 * @remarks
 * The function first selects a random positive denominator (up to `maxDenom=10`).
 * Then, it calculates the corresponding range of valid integer numerators [L, U]
 * such that `minVal <= numerator / denominator <= maxVal`.
 * Finally, it picks a random integer numerator from this range.
 * This ensures the generated fraction lies within the specified bounds.
 */
function generateRational(minVal: number = -10, maxVal: number = 10): number[] {
  if (minVal >= maxVal) {
    throw new Error("Minimum value must be less than the maximum value.");
  }

  let denominator: number;
  let L: number, U: number;
  const maxDenom = 10;

  // Loop until we find a valid denominator where there is at least one integer numerator that satisfies the condition.
  while (true) {
    // Choose a positive denominator (e.g. 1 to maxDenom)
    denominator = randomInt(1, maxDenom);
    L = Math.ceil(minVal * denominator);
    U = Math.floor(maxVal * denominator);

    if (U >= L) {
      break; // Valid range found
    }
  }

  // Choose numerator randomly between L and U (inclusive)
  const numerator = randomInt(L, U);
  return [numerator, denominator];
}

/**
 * Generates a random irrational number of the form `a * sqrt(b)` within a specified range [minVal, maxVal].
 * `b` is a non-square positive integer, and `a` is a non-zero integer.
 * The result is represented as `[a, b]`. Denominators are not used in this `[num, den]` representation for irrationals;
 * instead, `b` (the second element) represents the radicand.
 *
 * @param {number} [minVal=-10] - The minimum value for the irrational number (inclusive).
 * @param {number} [maxVal=10] - The maximum value for the irrational number (inclusive).
 * @returns {number[]} A two-element array `[a, b]` where the number is `a * sqrt(b)`.
 * @throws {Error} If `minVal` is not less than `maxVal`.
 * @throws {Error} If no valid non-square integer `b` can be found.
 * @throws {Error} If no valid non-zero integer coefficient `a` can be found for a chosen `b`.
 * @throws {Error} If the generated candidate `a * sqrt(b)` is unexpectedly out of bounds (internal check).
 *
 * @remarks
 * The process involves:
 * 1. Determining a range of possible non-square positive integers for `b`.
 *    The upper limit for `b` is heuristically `floor(max(abs(minVal), abs(maxVal))^2)`.
 * 2. Randomly selecting a non-square `b` from this range.
 * 3. Calculating the range of possible integer coefficients `a` (excluding 0)
 *    such that `minVal <= a * sqrt(b) <= maxVal`.
 * 4. Randomly selecting an `a` from its valid range.
 * The function returns `[a, b]`.
 */
function generateIrrational(minVal: number = -10, maxVal: number = 10): number[] {
  if (minVal >= maxVal) {
    console.log("Invalid range");
    throw new Error("Minimum value must be less than maximum value.");
  }

  // Determine maximum b based on the larger absolute endpoint
  const maxAbsEndpoint = Math.max(Math.abs(minVal), Math.abs(maxVal));
  const maxB = Math.floor(maxAbsEndpoint * maxAbsEndpoint); // Square of max endpoint
  const minB = 2; // Smallest non-square integer

  // Generate possible non-square b values
  const possibleB: number[] = [];
  for (let b = minB; b <= maxB; b++) {
    if (!isSquare(b)) {
      possibleB.push(b);
    }
  }

  if (possibleB.length === 0) {
    throw new Error(`No valid non-square b found in range [${minB}, ${maxB}]`);
  }

  // Randomly select a b
  const b = possibleB[randomInt(0, possibleB.length - 1)];

  const sqrtB = Math.sqrt(b);

  // Calculate minA and maxA to fit [minVal, maxVal]
  const minA = Math.ceil(minVal / sqrtB);
  const maxA = Math.floor(maxVal / sqrtB);

  // Ensure at least one valid a exists
  if (minA > maxA) {
    throw new Error(`No valid coefficient 'a' found for b = ${b} in range [${minVal}, ${maxVal}]`);
  }

  // Collect possible a values, excluding 0
  const possibleA: number[] = [];
  for (let a = minA; a <= maxA; a++) {
    if (a !== 0) {
      possibleA.push(a);
    }
  }

  if (possibleA.length === 0) {
    throw new Error(
      `No valid nonzero coefficient 'a' found for b = ${b} in range [${minVal}, ${maxVal}]`
    );
  }

  // Randomly select a valid a
  const a = possibleA[randomInt(0, possibleA.length - 1)];

  // Verify the candidate
  const candidate = a * sqrtB;
  if (candidate < minVal || candidate > maxVal) {
    throw new Error(`Generated candidate ${candidate} is out of bounds [${minVal}, ${maxVal}]`);
  }

  return [a, b];
}

/**
 * A record mapping each `NumberSet` type to its corresponding generator function.
 *
 * @remarks
 * - `real`: Randomly selects one of the other concrete types (rational, irrational, integer, or natural if range allows) and calls its generator.
 * - `rational`: Calls `generateRational`.
 * - `irrational`: Calls `generateIrrational`.
 * - `integer`: Generates a random integer in the range and returns it as `[integer, 1]`.
 * - `natural`: Generates a random integer in the range (ensuring it's >= 1) and returns it as `[integer, 1]`.
 */
const numberSetGenerators: Record<NumberSet, (minVal: number, maxVal: number) => number[]> = {
  real: (minVal, maxVal) => {
    // When minVal is negative, don't include 'natural' as an option
    // since natural numbers can't be negative
    const options: NumberSet[] =
      minVal < 0
        ? ["rational", "irrational", "integer"]
        : ["rational", "irrational", "integer", "natural"];
    const randomSet = randomChoice(options);
    return numberSetGenerators[randomSet](minVal, maxVal);
  },
  rational: (minVal, maxVal) => generateRational(minVal, maxVal),
  irrational: (minVal, maxVal) => generateIrrational(minVal, maxVal),
  integer: (minVal, maxVal) => [randomInt(minVal, maxVal), 1],
  natural: (minVal, maxVal) => [randomInt(Math.max(minVal, 1), maxVal), 1],
};

/**
 * Helper function to generate a unit coefficient ([1, 1] or [-1, 1])
 * while respecting optional "positive" or "negative" rules.
 *
 * @param {CoefficientRule[]} rules - An array of rules, potentially including "positive" or "negative".
 * @returns {{ raw: number[]; numberSetUsed: NumberSet }} An object containing the raw unit coefficient `[1, 1]` or `[-1, 1]` and the number set ("integer").
 * @throws {Error} If both "positive" and "negative" rules are provided simultaneously.
 * @throws {Error} If the generated unit value ([1] or [-1]) fails to satisfy other provided rules (e.g., "even", "odd").
 */
function generateUnitCoefficient(rules: CoefficientRule[]): {
  raw: [number, number];
  numberSetUsed: NumberSet;
} {
  const hasPositive = rules.includes("positive");
  const hasNegative = rules.includes("negative");

  if (hasPositive && hasNegative) {
    throw new Error("Cannot satisfy both 'positive' and 'negative' rules simultaneously");
  }

  let unitValue: number;
  if (hasPositive) {
    unitValue = 1;
  } else if (hasNegative) {
    unitValue = -1;
  } else {
    unitValue = randomChoice([-1, 1]);
  }

  const coefficient: [number, number] = [unitValue, 1];
  const numberSetUsedForOutput: NumberSet = "integer"; // Unit coefficients are integers

  // Check if the unit value satisfies all other rules
  if (!rules.every((rule) => getRuleValidator(rule)(coefficient))) {
    throw new Error(`Cannot generate a unit value that satisfies rules: ${rules.join(", ")}`);
  }

  return { raw: coefficient, numberSetUsed: numberSetUsedForOutput };
}

/**
 * Attempts to find a valid integer or natural coefficient deterministically by checking all possibilities
 * within a small range that satisfy the given rules.
 *
 * @param {NumberSet} numberSet - The target number set ("integer" or "natural").
 * @param {number} minVal - The minimum value of the range (inclusive).
 * @param {number} maxVal - The maximum value of the range (inclusive).
 * @param {CoefficientRule[]} rules - The rules the coefficient must satisfy.
 * @returns {{ raw: [number, number]; numberSetUsed: NumberSet } | null} A valid coefficient object if found deterministically within the small range threshold, otherwise null.
 * @throws {Error} If the effective range for natural numbers is invalid (min > max).
 * @throws {Error} If an exhaustive check within a small range fails to find any valid coefficient satisfying the rules.
 *
 * @remarks
 * This function is an optimization for small integer/natural ranges (<= `SMALL_RANGE_THRESHOLD`).
 * It iterates through all numbers in the adjusted range [actualMinForSearch, maxVal],
 * checks if they satisfy all rules, and returns a randomly chosen valid one if found.
 * If the range is large or the number set is not integer/natural, it returns null,
 * indicating that randomized generation should be attempted.
 */
function tryDeterministicIntegerNaturalCoefficient(
  numberSet: NumberSet,
  minVal: number,
  maxVal: number,
  rules: CoefficientRule[]
): { raw: [number, number]; numberSetUsed: NumberSet } | null {
  // Only applies to integer or natural number sets
  if (numberSet !== "integer" && numberSet !== "natural") return null;

  const isNatural = numberSet === "natural";
  // For natural numbers, the effective minimum value is at least 1.
  const actualMinForSearch = isNatural ? Math.max(minVal, 1) : minVal;

  // If the adjusted range is invalid, throw an error immediately.
  if (actualMinForSearch > maxVal) {
    throw new Error(
      `Invalid range for ${numberSet} generation: effective minimum (${actualMinForSearch}) is greater than maximum (${maxVal}). Cannot generate coefficient.`
    );
  }

  // Define a threshold for what's considered a "small enough" range for exhaustive search.
  const SMALL_RANGE_THRESHOLD = 200;
  const rangeSize = maxVal - actualMinForSearch + 1;

  if (rangeSize <= SMALL_RANGE_THRESHOLD) {
    // For small ranges, try every possible value deterministically.
    const possibleIntegers: number[] = [];
    for (let i = actualMinForSearch; i <= maxVal; i++) {
      possibleIntegers.push(i);
    }

    const validCoefficients: [number, number][] = [];
    for (const intVal of possibleIntegers) {
      const candidateCoeff: [number, number] = [intVal, 1]; // Integers are represented as [value, 1]
      if (rules.every((rule) => getRuleValidator(rule)(candidateCoeff))) {
        validCoefficients.push(candidateCoeff);
      }
    }

    if (validCoefficients.length > 0) {
      // Choose one of the valid coefficients randomly
      const chosenCoefficient: [number, number] = randomChoice(validCoefficients);
      return {
        raw: chosenCoefficient,
        numberSetUsed: numberSet,
      };
    } else {
      // If exhaustive search for this small integer/natural range fails,
      // then no solution exists for these specific rules and range.
      throw new Error(
        `No ${numberSet} number found in the range [${actualMinForSearch}, ${maxVal}] (inclusive) that satisfies all rules: ${rules.join(", ")}. Exhaustive check failed.`
      );
    }
  }
  // For large ranges, skip exhaustive search and return null to proceed with random attempts.
  return null;
}

/**
 * Attempts to generate a coefficient randomly for a given number set, range, and rules,
 * retrying up to a maximum number of attempts.
 *
 * @param {NumberSet} numberSet - The requested number set (can be "real", which triggers random selection of a concrete set per attempt).
 * @param {CoefficientRule[]} rules - The rules the coefficient must satisfy.
 * @param {[number, number]} range - The [minVal, maxVal] range (inclusive).
 * @param {number} MAX_ATTEMPTS - The maximum number of random generation attempts.
 * @returns {{ raw: [number, number]; numberSetUsed: NumberSet }} An object containing the raw coefficient and the actual number set it was generated from.
 * @throws {Error} If no valid coefficient satisfying the rules is found within `MAX_ATTEMPTS`.
 * @throws {Error} If an underlying generator (e.g., for rational/irrational) throws an error during an attempt (and max attempts are reached).
 * @throws {Error} If an unsupported `NumberSet` is encountered (should not happen with valid inputs).
 *
 * @remarks
 * This function handles the general case, including rational, irrational, real number sets,
 * and large-range integer/natural sets where deterministic checks are too slow.
 * It loops `MAX_ATTEMPTS` times:
 * 1. If `numberSet` is "real", it randomly picks a concrete set (integer, natural, rational, irrational) for the current attempt.
 * 2. It calls the appropriate generator function (`numberSetGenerators`).
 * 3. It checks if the generated coefficient satisfies all `rules`.
 * 4. If valid, it returns the result.
 * 5. If `MAX_ATTEMPTS` are reached without success, it throws an error.
 */
function tryRandomizedCoefficientGeneration(
  numberSet: NumberSet,
  rules: CoefficientRule[],
  range: [number, number],
  MAX_ATTEMPTS: number
): { raw: [number, number]; numberSetUsed: NumberSet } {
  const [minVal, maxVal] = range;
  let coefficient: [number, number];
  let numberSetUsedForOutput: NumberSet = numberSet; // May be updated if 'real' is requested
  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    attempts++;
    try {
      let setToGenerateFrom: NumberSet = numberSet; // Start with the originally requested set
      if (numberSet === "real") {
        // If "real" is requested, randomly choose a more specific set for this attempt.
        // Don't include 'natural' as an option if minVal is negative,
        // as natural numbers must be positive.
        const validOptions: NumberSet[] =
          minVal < 0
            ? ["rational", "irrational", "integer"]
            : ["rational", "irrational", "integer", "natural"];
        setToGenerateFrom = randomChoice(validOptions);
      }
      numberSetUsedForOutput = setToGenerateFrom; // This is the set we are attempting to generate from

      const generator = numberSetGenerators[setToGenerateFrom];
      if (!generator) {
        throw new Error(`Unsupported NumberSet for generation: ${setToGenerateFrom}`);
      }

      // Generate a candidate coefficient using the chosen generator
      coefficient = generator(minVal, maxVal) as [number, number];

      // Check if the generated coefficient satisfies all specified rules
      if (rules.every((rule) => getRuleValidator(rule)(coefficient))) {
        return { raw: coefficient, numberSetUsed: numberSetUsedForOutput }; // Solution found
      }

      // If nearing max attempts, log detailed information for debugging
      if (attempts === Math.floor(MAX_ATTEMPTS * 0.9)) {
        const value = coefficient[0] / coefficient[1];
        const failedRules = rules.filter((rule) => !getRuleValidator(rule)(coefficient));
        console.warn(
          `[Attempt ${attempts}/${MAX_ATTEMPTS}] Generated coefficient ${coefficient} (value: ${value}) for set '${setToGenerateFrom}' failed rules: ${failedRules.join(", ")}`
        );
      }
    } catch (error: unknown) {
      // Log errors that occur during a specific generation attempt
      // but continue trying until MAX_ATTEMPTS is reached.
      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      if (attempts === MAX_ATTEMPTS) {
        // If it's the last attempt and an error occurred, log it before the final throw.
        console.error(
          `Error during coefficient generation on final attempt (${numberSetUsedForOutput || numberSet}): ${errorMessage}`
        );
      }
      // Optionally, log non-critical errors on other attempts for debugging:
      // else {
      //    console.debug(`Warning during attempt ${attempts} for ${numberSetUsedForOutput || numberSet}: ${errorMessage}. Retrying...`);
      // }
    }
  }
  // If loop completes without returning, it means no valid coefficient was found
  throw new Error(
    `Failed to generate a coefficient in range [${minVal}, ${maxVal}] with requested number set '${numberSet}' that satisfies rules: ${rules.join(", ")} after ${MAX_ATTEMPTS} attempts. Please check if these constraints are mathematically possible or try a wider range/different rules.`
  );
}

export function generateCoefficient(
  numberSet: NumberSet, // The *requested* number set
  rules: CoefficientRule[],
  range: [number, number]
): { raw: [number, number]; numberSetUsed: NumberSet } {
  const [minVal, maxVal] = range;

  // Handle specific case: rule 'unit'
  if (rules.includes("unit")) {
    // Assuming generateUnitCoefficient correctly returns { raw: [number, number]; ... }
    return generateUnitCoefficient(rules);
  }

  // Validate constraints before attempting generation
  if (!isCoefficientSettingsCombinationValid(numberSet, rules, undefined, range)) {
    // Throw an error if basic validation fails
    throw new Error(
      `The requested combination is mathematically impossible or contradictory. ` +
        `Cannot generate a coefficient with NumberSet='${numberSet}', Rules='${rules.join(", ")}', Range=[${minVal}, ${maxVal}]. ` +
        `Please review the constraints.`
    );
  }

  // Proceed with generation if the combination is potentially valid...

  // Try deterministic path for integer/natural sets first
  const deterministicResult = tryDeterministicIntegerNaturalCoefficient(
    numberSet,
    minVal,
    maxVal,
    rules
  );
  if (deterministicResult) {
    return deterministicResult;
  }

  // Fallback to general random generation case
  // Assuming tryRandomizedCoefficientGeneration correctly returns { raw: [number, number]; ... }
  return tryRandomizedCoefficientGeneration(numberSet, rules, range, 1000);
}
