/**
 * @file Number Utilities
 * @description Provides various helper functions for numerical operations,
 *              random number generation, and mathematical property checks.
 */
import { CoefficientRule } from "../types/mathTypes";

/**
 * Selects and returns a random element from an array.
 *
 * @template T - The type of elements in the array.
 * @param {T[]} choices - The array to choose from.
 * @returns {T} A randomly selected element from the array.
 */
export function randomChoice<T>(choices: T[]): T {
    return choices[Math.floor(Math.random() * choices.length)];
}

/**
 * Generates a random integer within a specified range (inclusive).
 *
 * @param {number} minVal - The minimum possible value (inclusive).
 * @param {number} maxVal - The maximum possible value (inclusive).
 * @returns {number} A random integer between `minVal` and `maxVal`.
 */
export function randomInt(minVal: number, maxVal: number): number {
    return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
}

/**
 * Checks if a given number is a prime number.
 *
 * @param {number} num - The number to check.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
export function isPrime(num: number): boolean {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
}

/**
 * Checks if a given number is a perfect square (positive or negative).
 * For example, 9 and -9 would both return true.
 *
 * @param {number} num - The number to check.
 * @returns {boolean} True if the number or its absolute value is a perfect square, false otherwise.
 */
export function isSquare(num: number): boolean {
    return num < 0 
        ? Number.isInteger(Math.sqrt(Math.abs(num))) 
        : Number.isInteger(Math.sqrt(num));
}

/**
 * Checks if a given number is a perfect cube.
 *
 * @param {number} num - The number to check.
 * @returns {boolean} True if the number is a perfect cube, false otherwise.
 */
export function isCube(num: number): boolean {
    const cbrt = Math.cbrt(num);
    return Number.isInteger(cbrt);
}

/**
 * **Important:** Returns a validator function specifically designed to check if a *fraction* `a/b`
 * satisfies a given `CoefficientRule`.
 *
 * @param {CoefficientRule} rule - The coefficient rule to check against.
 * @returns {(values: [number, number]) => boolean} A function that takes a two-element array `[numerator, denominator]`
 *          and returns true if the fraction `numerator / denominator` satisfies the rule.
 * @throws {Error} If the input array to the returned validator does not have exactly two elements.
 * @throws {Error} If the denominator is zero.
 * @throws {Error} If the provided `rule` is unknown.
 * @remarks This function is intended for validating fractional representations and will likely produce
 *          incorrect results or errors if used with single numbers or arrays not representing a fraction.
 */
export function getRuleValidator(rule: CoefficientRule): (values: [number, number]) => boolean {
    return (values: [number, number]) => {
        // Ensure the input is treated as [numerator, denominator]
        if (values.length !== 2) {
            throw new Error(`Coefficient array must contain exactly two elements [numerator, denominator], but got ${values.length}`);
        }

        const [a, b] = values;
        if (b === 0) {
            throw new Error("Division by zero is not allowed for denominator");
        }

        const result = a / b;

        switch (rule) {
            case "unit":
                return result === 1 || result === -1;
            case "even":
                return result % 2 === 0;
            case "odd":
                return result % 2 !== 0;
            case "prime":
                return isPrime(result);
            case "positive":
                return result > 0;
            case "negative":
                return result < 0;
            case "nonzero":
                return result !== 0;
            case "square":
                return isSquare(result);
            case "cube":
                return isCube(result);
            default:
                throw new Error(`Unknown rule: ${rule}`);
        }
    };
}

/**
 * Calculates the greatest common divisor (GCD) of two integers using the Euclidean algorithm.
 *
 * @param {number} a - The first integer.
 * @param {number} b - The second integer.
 * @returns {number} The greatest common divisor of the absolute values of `a` and `b`.
 */
export function gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

/**
 * Counts the number of decimal places in a given number.
 *
 * @param {number} num - The number to analyze.
 * @returns {number} The count of digits after the decimal point.
 */
export function countDecimalPlaces(num: number): number {
    const str = num.toString();
    const decimalIndex = str.indexOf('.');
    return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
}



