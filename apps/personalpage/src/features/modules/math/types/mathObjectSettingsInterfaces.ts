import {
  CapitalLetters,
  CombinationType,
  CoefficientRule,
  CoefficientsRule,
  FunctionName,
  InequalityType,
  IntervalType,
  NumberSet,
  ObjectType,
  RepresentationType,
  VariableName,
} from "./mathTypes";

/**
 * Aggregates settings for all possible math object types into a single structure.
 * Primarily used as the state representation within the Math Object Generator UI.
 */
export interface MathObjectSettings {
  objectType: ObjectType;
  coefficientSettings: CoefficientSettings;
  coefficientsSettings: CoefficientsSettings;
  termSettings: TermSettings;
  termsSettings: TermsSettings;
  expressionSettings: ExpressionSettings;
  equationSettings: EquationSettings;
  functionSettings: FunctionSettings;
  pointSettings: PointSettings;
  setSettings: SetSettings;
  intervalSettings: IntervalSettings;
  inequalitySettings: InequalitySettings;
  example: string;
  priority: number;
  dependency: string;
}

/**
 * Defines the settings specific to a single coefficient object.
 */
export interface CoefficientSettings {
  /** The set of numbers the coefficient belongs to (e.g., real, integer). */
  numberSet: NumberSet;
  /** The desired format for displaying the coefficient (e.g., fraction, decimal). */
  representationType: RepresentationType;
  /** Specific rules the coefficient must adhere to (e.g., odd, prime, nonzero). */
  rules: CoefficientRule[];
  /** The allowed numerical range [min, max] for the coefficient's value. */
  range: [number, number];
  /** Allows for extensibility if needed, though direct properties are preferred. */
  [key: string]: unknown;
}

/**
 * Defines the settings for a collection of coefficients.
 */
export interface CoefficientsSettings {
  /** An array holding the individual settings for each coefficient in the collection. */
  coefficients: CoefficientSettings[];
  /** The number of coefficients expected in the collection. Should match `coefficients.length`. */
  collectionCount: number;
  /** Rules that apply across the entire collection (e.g., increasing, unique values). */
  rules: CoefficientsRule[];
  /** Allows for extensibility. */
  [key: string]: unknown;
}

/**
 * Defines the settings for a single mathematical term (e.g., a_1 x^2).
 */
export interface TermSettings {
  /** Settings for the coefficients used within this term. */
  coefficients: CoefficientsSettings;
  /** Array of two numbers for additional formating - first number represents the power of which the variable is raised, second represents the root the variable is taken to. */
  power: [number, number];
  /**
   * Specifies the powers of the variable associated with each coefficient.
   * Example: For `a_1 x^3 + a_2 x^1`, termIds would be `["3", "1"]`.
   */
  termIds: string[];
  /** If true, the additional power formatting wraps the root formatting, otherwise the root formatting wraps the power formatting. */
  powerOrder: boolean;
  /** The variable symbol used in the term (e.g., x, y). */
  variableName: VariableName;
  /** Allows for extensibility. */
  [key: string]: unknown;
}

/**
 * Defines the settings for an object composed of multiple terms.
 */
export interface TermsSettings {
  /** An array holding the settings for each individual term within this object. */
  terms: TermSettings[];
  /** Array of two numbers for additional formating - first number represents the power of which the variable is raised, second represents the root the variable is taken to. */
  power: [number, number];
  /** If true, the additional power formatting wraps the root formatting, otherwise the root formatting wraps the power formatting. */
  powerOrder: boolean;
  /** How the individual terms are combined (e.g., addition, multiplication). */
  combinationType: CombinationType;
  /** Allows for extensibility. */
  [key: string]: unknown;
}

/**
 * Defines the settings for a mathematical expression, which can be composed of
 * terms, term collections, or nested expressions.
 */
export interface ExpressionSettings {
  /** An array of the components making up this expression. */
  expressions: (TermSettings | TermsSettings | ExpressionSettings)[];
  /** How the components in the `expressions` array are combined. */
  combinationType: CombinationType;
  /** Array of two numbers for additional formating - first number represents the power of which the variable is raised, second represents the root the variable is taken to. */
  power: [number, number];
  /** If true, the additional power formatting wraps the root formatting, otherwise the root formatting wraps the power formatting. */
  powerOrder: boolean;
  /** Allows for extensibility. */
  [key: string]: unknown;
}

/**
 * Defines the settings for an equation (e.g., expression1 = expression2).
 */
export interface EquationSettings {
  /**
   * An array containing the expression(s) for the equation.
   * - If one expression is provided, it may be split into LHS/RHS implicitly.
   * - If two expressions are provided, they represent LHS and RHS explicitly.
   */
  terms: [ExpressionSettings] | [ExpressionSettings, ExpressionSettings];
  /** Ensures `inequalityType` is not accidentally set on an equation. */
  inequalityType?: never;
  /** Allows for extensibility. */
  [key: string]: unknown;
}

/**
 * Defines the settings for an inequality (e.g., expression1 < expression2).
 */
export interface InequalitySettings {
  /**
   * An array containing the expression(s) for the inequality.
   * - If one expression is provided, it may be split into LHS/RHS implicitly.
   * - If two expressions are provided, they represent LHS and RHS explicitly.
   */
  terms: [ExpressionSettings] | [ExpressionSettings, ExpressionSettings];
  /** The type of inequality relation (e.g., less, greater, leq, geq). */
  inequalityType: InequalityType;
  /** Allows for extensibility. */
  [key: string]: unknown;
}

/**
 * Defines the settings for a mathematical function (e.g., f(x) = expression).
 */
export interface FunctionSettings {
  /** The expression defining the function's rule. */
  expression: ExpressionSettings;
  /** The name used for the function (e.g., f, g). */
  functionName: FunctionName;
  /** The variable name used in the function (e.g., x, y, t). Defaults to "x" if not specified. */
  variableName?: string;
  /** Allows for extensibility. */
  [key: string]: unknown;
}

/**
 * Defines the settings for a geometric point.
 */
export interface PointSettings {
  /** Settings for the coefficients representing the point's coordinates. */
  coefficients: CoefficientsSettings;
  /** The name (typically a capital letter) assigned to the point (e.g., A, B). */
  name: CapitalLetters;
  /** If true, displays the point's name (e.g., "A = (1; 2)"). If false, only shows coordinates "(1; 2)". */
  showName: boolean;
  /** Allows for extensibility. */
  [key: string]: unknown;
}

/**
 * Defines the settings for a mathematical set.
 */
export interface SetSettings {
  /** Settings for the coefficients representing the elements of the set. */
  coefficients: CoefficientsSettings;
  /** The name (typically a capital letter) assigned to the set. */
  name: CapitalLetters;
  /** If true, displays the set's name (e.g., "A = {1, 2}"). If false, only shows elements "{1, 2}". */
  showName: boolean;
  /** Allows for extensibility. */
  [key: string]: unknown;
}

/**
 * Defines the settings for a mathematical interval.
 */
export interface IntervalSettings {
  /** Settings for the coefficients representing the interval's endpoints. */
  coefficients: CoefficientsSettings;
  /** A constraint for the minimum length between the interval endpoints. */
  minimumLength: number;
  /** The type of interval (open, closed, mixed). */
  intervalType: IntervalType;
  /** The name (typically a capital letter) assigned to the interval. */
  name: CapitalLetters;
  /** If true, displays the interval's name (e.g., "A = [1; 2]"). If false, only shows interval "[1; 2]". */
  showName: boolean;
  /** Allows for extensibility. */
  [key: string]: unknown;
}

/**
 * Defines the settings for an exercise, which consists of multiple math objects.
 */
export interface ExerciseSettings {
  /** An array containing the settings for each math object included in the exercise. */
  exerciseMathObjects: MathObjectSettings[];
}

/**
 * Represents the input structure for creating any type of math object.
 * It includes the `objectType` discriminator and the corresponding settings object,
 * along with optional metadata.
 */
export type MathInput =
  | {
      objectType: "coefficient";
      coefficientSettings: CoefficientSettings;
      priority?: number;
      dependency?: string;
      example?: string;
    }
  | {
      objectType: "coefficients";
      coefficientsSettings: CoefficientsSettings;
      priority?: number;
      dependency?: string;
      example?: string;
    }
  | {
      objectType: "term";
      termSettings: TermSettings;
      priority?: number;
      dependency?: string;
      example?: string;
    }
  | {
      objectType: "terms";
      termsSettings: TermsSettings;
      priority?: number;
      dependency?: string;
      example?: string;
    }
  | {
      objectType: "expression";
      expressionSettings: ExpressionSettings;
      priority?: number;
      dependency?: string;
      example?: string;
    }
  | {
      objectType: "equation";
      equationSettings: EquationSettings;
      priority?: number;
      dependency?: string;
      example?: string;
    }
  | {
      objectType: "function";
      functionSettings: FunctionSettings;
      priority?: number;
      dependency?: string;
      example?: string;
    }
  | {
      objectType: "point";
      pointSettings: PointSettings;
      priority?: number;
      dependency?: string;
      example?: string;
    }
  | {
      objectType: "interval";
      intervalSettings: IntervalSettings;
      priority?: number;
      dependency?: string;
      example?: string;
    }
  | {
      objectType: "set";
      setSettings: SetSettings;
      priority?: number;
      dependency?: string;
      example?: string;
    }
  | {
      objectType: "inequality";
      inequalitySettings: InequalitySettings;
      priority?: number;
      dependency?: string;
      example?: string;
    };

/**
 * A union type representing the specific settings interface for any possible math object type.
 * Useful when you have a settings object but don't know its exact type until runtime inspection.
 */
export type MathObjectSettingsType =
  | CoefficientSettings
  | CoefficientsSettings
  | TermSettings
  | TermsSettings
  | EquationSettings
  | FunctionSettings
  | PointSettings
  | SetSettings
  | IntervalSettings
  | InequalitySettings
  | ExpressionSettings;
