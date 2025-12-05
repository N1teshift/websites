import { MathObject } from "./MathObject";
import { generateCoefficient, formatCoefficient } from "../core/index";
import { CoefficientSettings } from "@math/types/index";

/**
 * Represents a single mathematical coefficient (e.g., a number like 5, 3/4, or sqrt(2)).
 * Extends the base `MathObject` class to provide specific generation and formatting logic for coefficients.
 */
export class Coefficient extends MathObject<CoefficientSettings> {
    /** 
     * The approximate numerical value of the coefficient.
     * Calculated based on its raw numerical representation and number set.
     */
    public approxValue: number = 0;

    /**
     * Constructs a new Coefficient instance.
     * 
     * @param settings - The settings configuration for this coefficient.
     */
    constructor(settings: CoefficientSettings) {
        super("coefficient", settings);
    }

    /**
     * Generates the string representation of the coefficient.
     * This involves generating a raw numerical value based on the settings
     * and then formatting it according to the specified representation type.
     * It also calculates and stores the `approxValue`.
     * 
     * @returns An array containing a single string: the formatted coefficient.
     * @protected
     */
    protected getParts(): string[] {
        const generated = generateCoefficient(this.settings.numberSet, this.settings.rules, this.settings.range);
        const formatted = formatCoefficient(generated.raw, this.settings.representationType, generated.numberSetUsed);
        this.approxValue = this.calculateApproxValue(generated.raw);
        return [formatted];
    }

    /**
     * Formats the coefficient object from its parts.
     * Since a single coefficient has only one part (itself), this method simply returns that part.
     * 
     * @param parts - An array containing the single formatted string representation of the coefficient.
     * @returns The formatted coefficient string.
     * @protected
     */
    protected formatObject(parts: string[]): string {
        return parts[0];
    }

    /**
     * Calculates the approximate numerical value of the coefficient based on its raw internal representation.
     * The raw representation is typically `[numerator, denominator]`, but interpretation depends on the number set.
     * 
     * @param rawCoefficient - An array of numbers representing the coefficient, usually `[numerator, denominator]`.
     *                         For irrational numbers, `denominator` might be the radicand for a square root.
     * @returns The approximate numerical value.
     * @throws Error if division by zero occurs for rational types.
     * @throws Error if an unknown number set is encountered.
     * @private
     */
    private calculateApproxValue(rawCoefficient: number[]): number {
        const [numerator, denominator] = rawCoefficient;

        if (denominator === 0 && (this.settings.numberSet === "rational" || this.settings.numberSet === "real")) {
            throw new Error("Division by zero is not allowed for rational/real numbers");
        }

        switch (this.settings.numberSet) {
            case "integer":
            case "natural":
                return numerator;
            case "real":
            case "rational":
                // Ensure denominator is not zero, though already checked for explicit rational/real.
                return denominator !== 0 ? numerator / denominator : NaN; // Or handle error appropriately
            case "irrational":
                // Assuming the form is numerator * sqrt(denominator)
                if (denominator < 0) throw new Error("Cannot take square root of a negative number for irrational representation.");
                return numerator * Math.sqrt(denominator);
            default:
                // This attempts to provide a type-safe way to handle exhaustiveness
                // At runtime, it will throw if a new NumberSet was added without updating this switch.
                const exhaustiveCheck: never = this.settings.numberSet;
                throw new Error(`Unknown number set: ${exhaustiveCheck}`);
        }
    }
}



