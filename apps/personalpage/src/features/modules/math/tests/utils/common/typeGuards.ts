import { MathInput, CoefficientSettings } from "@math/types/mathObjectSettingsInterfaces";
import { TestCase } from "../../cases/TestCase";

export function isCoef(obj: MathInput): obj is Extract<MathInput, { objectType: "coefficient"; coefficientSettings: CoefficientSettings }> {
  return obj && obj.objectType === "coefficient" && 'coefficientSettings' in obj;
}

/**
 * Type guard to check if an object is a valid TestCase
 * @param obj The object to check
 * @returns True if the object is a TestCase, false otherwise
 */
export function isTestCase(obj: unknown): obj is TestCase<Record<string, unknown>> {
  return typeof obj === 'object' && // Check if it's an object type
         obj !== null &&            // Ensure it's not null
         'name' in obj && typeof obj.name === 'string' &&        // Check for name property and type
         'prompt' in obj && typeof obj.prompt === 'string' &&     // Check for prompt property and type
         'objectType' in obj && typeof obj.objectType === 'string'; // Check for objectType property and type
}



