import {
    Coefficient, Coefficients, Term, Terms,
    Equation, Function, Point, Interval, Set,
    Inequality, Expression
} from "../mathObjects/objects/index"
import { MathObjectSettingsType } from "./mathObjectSettingsInterfaces";

// Types

/**
 * Defines the set of possible mathematical object types that can be generated or handled.
 * Used throughout the system to identify the kind of math object being dealt with.
 */
export const objectTypeOptions = ["coefficient", "coefficients", "term", "terms", "expression", "equation", "function", "point", "set", "interval", "inequality"] as const;

/**
 * Represents one of the specific mathematical object types.
 * @example
 * let objType: ObjectType = "equation";
 */
export type ObjectType = typeof objectTypeOptions[number];

/**
 * Defines the standard sets of numbers used in mathematical contexts.
 */
export const numberSetOptions = ["real", "rational", "irrational", "integer", "natural"] as const;

/**
 * Represents one of the standard sets of numbers (e.g., real, integer).
 * Used to constrain the types of numbers allowed for coefficients or variables.
 * @example
 * let set: NumberSet = "integer";
 */
export type NumberSet = typeof numberSetOptions[number];

/**
 * A mapping from `NumberSet` types to their standard LaTeX symbols.
 * @example
 * const realSymbol = numberSetSymbols["real"]; // "\\mathbf{R}"
 */
export const numberSetSymbols: Record<NumberSet, string> = {
    real: "\\mathbf{R}",
    rational: "\\mathbf{Q}",
    irrational: "\\mathbf{I}", // Note: Standard symbol varies, using I here.
    integer: "\\mathbf{Z}",
    natural: "\\mathbf{N}" // Typically includes 0 in programming contexts, adjust if needed.
};

/**
 * Retrieves the standard LaTeX symbol for a given number set.
 * 
 * @param set - The number set type (e.g., "real", "integer").
 * @returns The LaTeX string representing the symbol (e.g., "\\mathbf{R}") or the original set name if no symbol is defined.
 * @example
 * const symbol = getNumberSetSymbol("rational"); // Returns "\\mathbf{Q}"
 */
export const getNumberSetSymbol = (set: NumberSet): string => {
    return numberSetSymbols[set] || set;  // Fallback to the set name if not found
};

/**
 * Defines rules that can apply to individual coefficients.
 */
export const coeficientRuleOptions = ["odd", "even", "square", "cube", "prime", "nonzero", "positive", "negative", "unit"] as const;

/**
 * Represents a specific rule applied to an individual coefficient (e.g., must be odd, must be prime).
 * @example
 * let rule: CoefficientRule = "prime";
 */
export type CoefficientRule = typeof coeficientRuleOptions[number];

/**
 * Defines rules that apply across a collection of coefficients.
 */
export const coefficientsRuleOptions = ["increasing", "decreasing", "neq"] as const;

/**
 * Represents a specific rule applied across a collection of coefficients (e.g., must be strictly increasing).
 * @example
 * let rule: CoefficientsRule = "increasing";
 */
export type CoefficientsRule = typeof coefficientsRuleOptions[number];

/**
 * Defines how a numerical value (like a coefficient) should be represented.
 */
export const representationTypeOptions = ["fraction", "mixed", "decimal", "root", "logarithm"] as const;

/**
 * Represents the desired format for displaying a numerical value.
 * @example
 * let format: RepresentationType = "fraction";
 */
export type RepresentationType = typeof representationTypeOptions[number];

/**
 * Defines the types of mathematical intervals based on endpoint inclusion.
 */
export const intervalTypeOptions = ["open", "closed", "closed_open", "open_closed"] as const;

/**
 * Represents the type of a mathematical interval (e.g., open (a, b), closed [a, b]).
 * @example
 * let type: IntervalType = "closed";
 */
export type IntervalType = typeof intervalTypeOptions[number];

/**
 * Defines the dimensionality of a point.
 */
export const pointTypeOptions = ["2D", "3D"] as const;

/**
 * Represents the dimensionality of a point (e.g., 2D for (x, y)).
 * @example
 * let type: PointType = "2D";
 */
export type PointType = typeof pointTypeOptions[number];

/**
 * Defines the standard inequality relations.
 */
export const inequalityTypeOptions = ["less", "greater", "leq", "geq"] as const;

/**
 * Represents an inequality relation (e.g., less than '<', greater than or equal '\\geq').
 * @example
 * let relation: InequalityType = "leq";
 */
export type InequalityType = typeof inequalityTypeOptions[number];

/**
 * Defines forms or standards for mathematical terms.
 */
export const termFormOptions = ["standard", "nonstandard"] as const;

/**
 * Represents the form of a mathematical term.
 * @remarks Currently seems less utilized, might need clarification.
 * @example
 * let form: TermForm = "standard";
 */
export type TermForm = typeof termFormOptions[number];

/**
 * Defines how multiple terms or expressions are combined.
 */
export const combinationTypeOptions = ["addition", "subtraction", "multiplication", "division", "power", "root_sq_div", "none"] as const;

/**
 * Represents the operation used to combine multiple mathematical components.
 * @example
 * let operation: CombinationType = "addition";
 */
export type CombinationType = typeof combinationTypeOptions[number];

/**
 * Defines common variable names used in mathematical expressions.
 */
export const variableNameOptions = ["x", "y", "z", "a", "b", "c", "d"] as const;

/**
 * Represents a standard variable name.
 * @example
 * let variable: VariableName = "x";
 */
export type VariableName = typeof variableNameOptions[number];

/**
 * Defines common function names.
 */
export const functionNameOptions = ["f", "g", "h", "p", "q", "r", "s", "t", "v"] as const;

/**
 * Represents a standard function name.
 * @example
 * let funcName: FunctionName = "f";
 */
export type FunctionName = typeof functionNameOptions[number];

/**
 * Defines common names (typically capital letters) used for points.
 */
export const pointNameOptions = ["A", "B", "C", "D", "E", "F", "G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W"] as const;

/**
 * Represents a standard name for a point.
 * @example
 * let name: PointName = "A";
 */
export type PointName = typeof pointNameOptions[number];

/**
 * Defines the set of standard capital letters, often used for naming sets or points.
 */
export const capitalLettersOptions = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"] as const;

/**
 * Represents a single capital letter.
 * @example
 * let letter: CapitalLetters = "C";
 */
export type CapitalLetters = typeof capitalLettersOptions[number];

/**
 * Defines types of dependencies or relationships between math objects.
 * @remarks The meaning of "upper_minus:0.1" etc. might need further clarification.
 */
export const dependencyTypeOptions = ["belongs_to", "doesnt_belong", "upper_minus:0.1", "lower_minus:0.1", "upper_minus:1", "lower_minus:1"] as const;

/**
 * Represents a type of dependency between math objects, or "none".
 * @example
 * let dep: DependencyType = "belongs_to";
 */
export type DependencyType = (typeof dependencyTypeOptions)[number] | "none";

/**
 * Defines the complexity level of the user interface for settings.
 */
export const interfaceTypeOptions = ["simple", "complex"] as const;

/**
 * Represents the UI mode for displaying settings.
 * - `simple`: A simplified view.
 * - `complex`: Shows all available settings and options.
 * @example
 * let mode: InterfaceType = "complex";
 */
export type InterfaceType = typeof interfaceTypeOptions[number];

/**
 * A union type representing any of the possible concrete math object classes.
 */
export type MathObjects = Coefficient | Coefficients | Term | Terms | Equation | Function | Point | Interval | Set | Inequality | Expression;

/**
 * Defines the common props required by container components responsible for rendering
 * the settings UI for a specific type of math object.
 * 
 * @template T - The specific type of MathObjectSettings this container manages.
 */
export interface MathObjectContainerProps<T extends MathObjectSettingsType> {
    /** A unique identifier for this container instance. */
    containerId: string;
    /** The current settings state for the math object. */
    settings: T;
    /** Callback function to update the settings state. */
    updateSettings: (newSettings: T) => void;
    /** The starting index for coefficient numbering (e.g., a_1, a_2...). */
    startIndex: number;
    /** Flag indicating whether the object's description should be displayed. */
    showDescription: boolean;
    /** The type of math object being configured (or null if none). */
    objectType: ObjectType | null;
    /** The current interface complexity mode ('simple' or 'complex'). */
    interfaceType?: InterfaceType;
}

/**
 * Represents the components that can make up a mathematical expression.
 * An Expression itself can contain other Terms, Terms objects, or nested Expressions.
 */
export type ExpressionComponent = Term | Terms | Expression;

/**
 * Defines standard named numerical ranges used in testing.
 */
export const RANGE_TYPES = {
    /** Represents a wide range including negative, zero, and positive values. */
    fullRange: [-100, 100],
    /** Represents a range of strictly negative values. */
    negRange: [-100, -1],
    /** Represents a range of strictly positive values. */
    posRange: [1, 100],
    /** A smaller default range often used for simpler test cases. */
    defaultRange: [-10, 10]
  } as const;
  
  /**
   * Represents one of the named standard ranges defined in `RANGE_TYPES`.
   * @example
   * let rangeKey: RangeType = "negRange";
   */
  export type RangeType = keyof typeof RANGE_TYPES;



