/**
 * @file Provides validation functions for the *settings* part of mathematical objects.
 * It ensures that the settings object received (e.g., from an LLM) conforms to the expected
 * structure and basic types for a specific `ObjectType` before it is used further.
 * Uses Zod schemas for robust type-safe validation instead of cast-based logic.
 */
import { z } from "zod";
import {
  ObjectType, MathObjectSettingsType, CoefficientSettings, IntervalSettings, InequalitySettings,
  EquationSettings, FunctionSettings, TermSettings, TermsSettings, ExpressionSettings, PointSettings, SetSettings,
  CoefficientsSettings
} from "@math/types/index";

/**
 * Zod schema for CoefficientSettings.
 * Validates that rules array contains only valid CoefficientRule values.
 * Validates that range is exactly [number, number].
 */
const CoefficientSettingsSchema: z.ZodType<CoefficientSettings> = z.object({
  numberSet: z.enum(["real", "rational", "irrational", "integer", "natural"]),
  representationType: z.enum(["fraction", "mixed", "decimal", "root", "logarithm"]),
  rules: z.array(z.enum(["odd", "even", "square", "cube", "prime", "nonzero", "positive", "negative", "unit"])),
  range: z.tuple([z.number(), z.number()]),
}).passthrough();

/**
 * Zod schema for CoefficientsSettings.
 * Note: The coefficients array may be missing during validation but will default to an empty array.
 * Validates that coefficients array contains only valid CoefficientSettings objects.
 * Validates that collectionCount is a positive integer.
 * Validates that rules array contains only valid CoefficientsRule values.
 */
const CoefficientsSettingsSchema: z.ZodType<CoefficientsSettings> = z.object({
  coefficients: z.array(CoefficientSettingsSchema).default([]).transform(val => val ?? []),
  collectionCount: z.number().int().positive(),
  rules: z.array(z.enum(["increasing", "decreasing", "neq"])),
}).passthrough() as z.ZodType<CoefficientsSettings>;

/**
 * Zod schema for TermSettings.
 * Only supports nested types: coefficient, coefficients, term (via the coefficients field).
 * Validates that power is exactly [number, number].
 */
const TermSettingsSchema: z.ZodType<TermSettings> = z.object({
  coefficients: CoefficientsSettingsSchema,
  power: z.tuple([z.number(), z.number()]),
  termIds: z.array(z.string()),
  powerOrder: z.boolean(),
  variableName: z.enum(["x", "y", "z", "a", "b", "c", "d"]),
}).passthrough();

/**
 * Zod schema for TermsSettings.
 * Validates that power is exactly [number, number].
 */
const TermsSettingsSchema: z.ZodType<TermsSettings> = z.object({
  terms: z.array(TermSettingsSchema),
  power: z.tuple([z.number(), z.number()]),
  powerOrder: z.boolean(),
  combinationType: z.enum(["addition", "subtraction", "multiplication", "division", "power", "root_sq_div", "none"]),
}).passthrough();

/**
 * Zod schema for ExpressionSettings.
 * Uses lazy evaluation to handle recursive structures (expressions can contain nested expressions).
 * Validates that power is exactly [number, number].
 */
const ExpressionSettingsSchema: z.ZodType<ExpressionSettings> = z.lazy(() => z.object({
  expressions: z.array(z.union([
    TermSettingsSchema,
    TermsSettingsSchema,
    ExpressionSettingsSchema,
  ])),
  combinationType: z.enum(["addition", "subtraction", "multiplication", "division", "power", "root_sq_div", "none"]),
  power: z.tuple([z.number(), z.number()]),
  powerOrder: z.boolean(),
}).passthrough());

/**
 * Zod schema for EquationSettings.
 */
const EquationSettingsSchema: z.ZodType<EquationSettings> = z.object({
  terms: z.union([
    z.tuple([ExpressionSettingsSchema]),
    z.tuple([ExpressionSettingsSchema, ExpressionSettingsSchema]),
  ]),
}).passthrough();

/**
 * Zod schema for InequalitySettings.
 */
const InequalitySettingsSchema: z.ZodType<InequalitySettings> = z.object({
  terms: z.union([
    z.tuple([ExpressionSettingsSchema]),
    z.tuple([ExpressionSettingsSchema, ExpressionSettingsSchema]),
  ]),
  inequalityType: z.enum(["less", "greater", "leq", "geq"]),
}).passthrough();

/**
 * Zod schema for FunctionSettings.
 */
const FunctionSettingsSchema: z.ZodType<FunctionSettings> = z.object({
  expression: ExpressionSettingsSchema,
  functionName: z.enum(["f", "g", "h", "p", "q", "r", "s", "t", "v"]),
}).passthrough();

/**
 * Zod schema for PointSettings.
 */
const PointSettingsSchema: z.ZodType<PointSettings> = z.object({
  coefficients: CoefficientsSettingsSchema,
  name: z.enum(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]),
  showName: z.boolean(),
}).passthrough();

/**
 * Zod schema for SetSettings.
 */
const SetSettingsSchema: z.ZodType<SetSettings> = z.object({
  coefficients: CoefficientsSettingsSchema,
  name: z.enum(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]),
  showName: z.boolean(),
}).passthrough();

/**
 * Zod schema for IntervalSettings.
 */
const IntervalSettingsSchema: z.ZodType<IntervalSettings> = z.object({
  coefficients: CoefficientsSettingsSchema,
  minimumLength: z.number(),
  intervalType: z.enum(["open", "closed", "closed_open", "open_closed"]),
  name: z.enum(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]),
  showName: z.boolean(),
}).passthrough();

/**
 * Mapping from ObjectType to its corresponding Zod schema.
 */
const schemaMap: Record<ObjectType, z.ZodType<MathObjectSettingsType>> = {
  coefficient: CoefficientSettingsSchema,
  coefficients: CoefficientsSettingsSchema,
  term: TermSettingsSchema,
  terms: TermsSettingsSchema,
  expression: ExpressionSettingsSchema,
  equation: EquationSettingsSchema,
  function: FunctionSettingsSchema,
  inequality: InequalitySettingsSchema,
  point: PointSettingsSchema,
  interval: IntervalSettingsSchema,
  set: SetSettingsSchema,
};

/**
 * Central validation function for mathematical object settings.
 * Takes an unknown settings object and the expected `ObjectType`, then validates
 * it against the appropriate Zod schema.
 * 
 * @param {unknown} settings The settings object to validate (typically parsed from JSON).
 * @param {ObjectType} objectType The expected type of the object these settings belong to.
 * @returns {MathObjectSettingsType} The validated settings object, properly typed.
 * @throws {Error} If the settings object fails validation or if the `objectType` is unrecognized.
 */
export function validateObjectSettings(settings: unknown, objectType: ObjectType): MathObjectSettingsType {
  const schema = schemaMap[objectType];
  if (!schema) {
    // This should never happen as schemaMap covers all ObjectType values
    throw new Error(`Unrecognized object type: ${String(objectType)}`);
  }

  try {
    return schema.parse(settings) as MathObjectSettingsType;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new Error(`Invalid ${objectType} settings: ${errorMessages}`);
    }
    throw error;
  }
}




