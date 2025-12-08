import {
  CoefficientSettings,
  CoefficientsSettings,
  EquationSettings,
  ExpressionSettings,
  FunctionSettings,
  InequalitySettings,
  IntervalSettings,
  MathObjectSettings,
  PointSettings,
  SetSettings,
  TermSettings,
  TermsSettings,
} from "./mathObjectSettingsInterfaces";
import { CombinationType } from "./mathTypes";

/**
 * Default settings for a single Coefficient object.
 */
export const DEFAULT_COEFFICIENT_SETTINGS: CoefficientSettings = {
  numberSet: "integer",
  representationType: "decimal",
  rules: [],
  range: [-10, 10],
};

/**
 * Default settings for a Coefficients object, containing one default coefficient.
 */
export const DEFAULT_COEFFICIENTS_SETTINGS: CoefficientsSettings = {
  coefficients: [DEFAULT_COEFFICIENT_SETTINGS],
  collectionCount: 1,
  rules: [],
};

/**
 * Default settings for a single Term object.
 */
export const DEFAULT_TERM_SETTINGS: TermSettings = {
  coefficients: DEFAULT_COEFFICIENTS_SETTINGS,
  power: [1, 1],
  termIds: ["2"], // Example: ax^2
  powerOrder: true,
  variableName: "x",
};

/**
 * Default settings for a Terms object, combining two default terms with addition.
 */
export const DEFAULT_TERMS_SETTINGS: TermsSettings = {
  terms: [DEFAULT_TERM_SETTINGS, DEFAULT_TERM_SETTINGS],
  power: [1, 1],
  powerOrder: true,
  combinationType: "addition" as CombinationType,
};

/**
 * Default settings for an Expression object, containing a single default term.
 */
export const DEFAULT_EXPRESSION_SETTINGS: ExpressionSettings = {
  expressions: [DEFAULT_TERM_SETTINGS],
  combinationType: "none",
  power: [1, 1],
  powerOrder: true,
};

/**
 * Default settings for an Equation object intended for the 'simple' UI mode.
 * Contains a single expression setting that internally holds two terms to be split.
 */
export const DEFAULT_SIMPLE_EQUATION_SETTINGS: EquationSettings = {
  terms: [
    {
      expressions: [
        { ...DEFAULT_TERM_SETTINGS }, // First TermSettings for left side
        { ...DEFAULT_TERM_SETTINGS }, // Second TermSettings for right side
      ],
      combinationType: "addition",
      power: [1, 1],
      powerOrder: true,
    },
  ],
};

/**
 * Default settings for an Equation object intended for the 'complex' UI mode.
 * Explicitly defines separate left and right side expressions.
 */
export const DEFAULT_COMPLEX_EQUATION_SETTINGS: EquationSettings = {
  terms: [
    {
      expressions: [{ ...DEFAULT_TERMS_SETTINGS }], // Left side starts with TermsSettings to match complex interface
      combinationType: "none",
      power: [1, 1],
      powerOrder: true,
    },
    {
      expressions: [{ ...DEFAULT_TERMS_SETTINGS }], // Right side starts with TermsSettings to match complex interface
      combinationType: "none",
      power: [1, 1],
      powerOrder: true,
    },
  ],
};

/**
 * Default settings for an Inequality object intended for the 'simple' UI mode.
 * Contains a single expression setting that internally holds two terms to be split.
 */
export const DEFAULT_SIMPLE_INEQUALITY_SETTINGS: InequalitySettings = {
  terms: [
    {
      expressions: [
        { ...DEFAULT_TERM_SETTINGS }, // First TermSettings for left side
        { ...DEFAULT_TERM_SETTINGS }, // Second TermSettings for right side
      ],
      combinationType: "addition",
      power: [1, 1],
      powerOrder: true,
    },
  ],
  inequalityType: "less",
};

/**
 * Default settings for an Inequality object intended for the 'complex' UI mode.
 * Explicitly defines separate left and right side expressions.
 */
export const DEFAULT_COMPLEX_INEQUALITY_SETTINGS: InequalitySettings = {
  terms: [
    {
      expressions: [{ ...DEFAULT_TERM_SETTINGS }], // Left side starts with one TermSettings
      combinationType: "none",
      power: [1, 1],
      powerOrder: true,
    },
    {
      expressions: [{ ...DEFAULT_TERM_SETTINGS }], // Right side starts with one TermSettings
      combinationType: "none",
      power: [1, 1],
      powerOrder: true,
    },
  ],
  inequalityType: "less",
};

/**
 * Default settings for a Function object.
 */
export const DEFAULT_FUNCTION_SETTINGS: FunctionSettings = {
  expression: {
    expressions: [{ ...DEFAULT_TERM_SETTINGS }],
    combinationType: "none",
    power: [1, 1],
    powerOrder: true,
  },
  functionName: "f",
  variableName: "x",
};

/**
 * Default settings for a Point object (assumed 2D).
 */
export const DEFAULT_POINT_SETTINGS: PointSettings = {
  coefficients: {
    coefficients: [DEFAULT_COEFFICIENT_SETTINGS, DEFAULT_COEFFICIENT_SETTINGS],
    collectionCount: 2,
    rules: [],
  },
  name: "A",
  showName: true,
};

/**
 * Default settings for a Set object.
 */
export const DEFAULT_SET_SETTINGS: SetSettings = {
  coefficients: DEFAULT_COEFFICIENTS_SETTINGS,
  name: "A",
  showName: true,
};

/**
 * Default settings for an Interval object.
 */
export const DEFAULT_INTERVAL_SETTINGS: IntervalSettings = {
  coefficients: {
    coefficients: [DEFAULT_COEFFICIENT_SETTINGS, DEFAULT_COEFFICIENT_SETTINGS],
    collectionCount: 2,
    rules: ["increasing", "neq"], // Ensure endpoints are ordered and distinct
  },
  minimumLength: 1,
  intervalType: "closed",
  name: "A",
  showName: true,
};

/**
 * Default settings aggregated into the `MathObjectSettings` structure,
 * providing initial values for all possible math object type settings.
 * Used as the initial state in the Math Object Generator UI.
 */
export const DEFAULT_MATH_OBJECT_SETTINGS: MathObjectSettings = {
  objectType: "coefficient",
  coefficientSettings: DEFAULT_COEFFICIENT_SETTINGS,
  coefficientsSettings: DEFAULT_COEFFICIENTS_SETTINGS,
  termSettings: DEFAULT_TERM_SETTINGS,
  termsSettings: DEFAULT_TERMS_SETTINGS,
  expressionSettings: DEFAULT_EXPRESSION_SETTINGS,
  equationSettings: DEFAULT_SIMPLE_EQUATION_SETTINGS, // Using simple default
  inequalitySettings: DEFAULT_SIMPLE_INEQUALITY_SETTINGS, // Using simple default
  functionSettings: DEFAULT_FUNCTION_SETTINGS,
  pointSettings: DEFAULT_POINT_SETTINGS,
  setSettings: DEFAULT_SET_SETTINGS,
  intervalSettings: DEFAULT_INTERVAL_SETTINGS,
  example: "",
  priority: 0,
  dependency: "none",
};
