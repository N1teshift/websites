import { Coefficient, Coefficients, Term, Terms, Expression, Equation, Function, Point, Interval, Set, Inequality } from "../objects/index";
import {
    CoefficientSettings, CoefficientsSettings, TermSettings, TermsSettings, ExpressionSettings,
    EquationSettings, FunctionSettings, PointSettings, SetSettings, IntervalSettings, InequalitySettings,
    MathObjectSettingsType, MathInput, MathObjects, ExpressionComponent
} from "@math/types/index";

type GeneratorConstructor<T, S> = new (settings: S) => BaseObjectGenerator<T, S>;

/**
 * Type mapping from MathInput object types to their corresponding generator constructor types.
 * This ensures type safety by matching each object type with its specific generator and settings.
 */
type GeneratorMap = {
    coefficient: GeneratorConstructor<Coefficient, CoefficientSettings>;
    coefficients: GeneratorConstructor<Coefficients, CoefficientsSettings>;
    term: GeneratorConstructor<Term, TermSettings>;
    terms: GeneratorConstructor<Terms, TermsSettings>;
    expression: GeneratorConstructor<Expression, ExpressionSettings>;
    equation: GeneratorConstructor<Equation, EquationSettings>;
    function: GeneratorConstructor<Function, FunctionSettings>;
    point: GeneratorConstructor<Point, PointSettings>;
    interval: GeneratorConstructor<Interval, IntervalSettings>;
    set: GeneratorConstructor<Set, SetSettings>;
    inequality: GeneratorConstructor<Inequality, InequalitySettings>;
};

/**
 * @abstract
 * @class BaseObjectGenerator
 * @description An abstract base class defining the template method pattern for generating math objects.
 * Each specific math object type (Coefficient, Term, Equation, etc.) should have a corresponding
 * generator class that extends this base class.
 *
 * @template T - The type of the math object being generated (e.g., `Coefficient`, `Term`).
 * @template S - The type of the settings object used to configure the generation (e.g., `CoefficientSettings`, `TermSettings`).
 */
abstract class BaseObjectGenerator<T, S> {
    /** The settings object provided during construction, guiding the generation process. */
    protected settings: S;
    /** The math object instance being generated. Initialized in `initiateObject`. */
    protected object: T | null = null;

    /**
     * Creates an instance of BaseObjectGenerator.
     * @param {S} settings - The settings object specific to the math object type being generated.
     */
    constructor(settings: S) {
        this.settings = settings;
    }

    /**
     * Abstract method to initialize the specific math object instance.
     * Subclasses must implement this to create `this.object` using `new SpecificObject(this.settings)`.
     * @abstract
     */
    abstract initiateObject(): void;

    /**
     * Abstract method to generate any prerequisite materials or dependencies needed before generating the object's main content.
     * For example, a `TermGenerator` might generate its `Coefficients` here.
     * If no materials are needed, this can be an empty implementation.
     * @abstract
     */
    abstract generateMaterials(): void;

    /**
     * Abstract method to generate the actual content of the math object.
     * This typically involves calling the `generate` method on `this.object`, potentially passing in materials generated in `generateMaterials`.
     * @abstract
     */
    abstract generateContent(): void;

    /**
     * Template method that orchestrates the generation of the math object.
     * It calls `initiateObject`, `generateMaterials`, and `generateContent` in sequence.
     * @returns {T} The fully generated math object instance.
     * @throws {Error} If `this.object` is null after the generation process (should not happen if implemented correctly).
     */
    public generate(): T {
        this.initiateObject();    // Initialize the object
        this.generateMaterials(); // Generate materials
        this.generateContent();   // Populate the content
        if (this.object === null) {
            // This should ideally be prevented by correct implementation of initiateObject
            throw new Error("Object generation failed: object instance is null after generation steps.");
        }
        return this.object;      // Return the generated object
    }
}

/**
 * Concrete generator for `Coefficient` objects.
 * @class CoefficientGenerator
 * @extends BaseObjectGenerator<Coefficient, CoefficientSettings>
 */
class CoefficientGenerator extends BaseObjectGenerator<Coefficient, CoefficientSettings> {
    /** Initializes a new Coefficient object. */
    initiateObject(): void {this.object = new Coefficient(this.settings)}
    /** Coefficients have no prerequisite materials to generate. */
    generateMaterials(): void {}
    /** Calls the generate method on the Coefficient instance. */
    generateContent(): void {this.object!.generate();}
}

/**
 * Concrete generator for `Coefficients` objects.
 * @class CoefficientsGenerator
 * @extends BaseObjectGenerator<Coefficients, CoefficientsSettings>
 */
class CoefficientsGenerator extends BaseObjectGenerator<Coefficients, CoefficientsSettings> {
    /** Initializes a new Coefficients object. */
    initiateObject(): void {this.object = new Coefficients(this.settings)}
    /** Coefficients collections have no prerequisite materials to generate. */
    generateMaterials(): void {}
    /** Calls the generate method on the Coefficients instance. */
    generateContent(): void {this.object!.generate()}
}

/**
 * Concrete generator for `Term` objects.
 * @class TermGenerator
 * @extends BaseObjectGenerator<Term, TermSettings>
 */
class TermGenerator extends BaseObjectGenerator<Term, TermSettings> {
    /** The Coefficients object needed to generate the Term. */
    private coefficients: Coefficients | null = null;

    /** Initializes a new Term object. */
    initiateObject(): void {
        this.object = new Term(this.settings);
    }

    /** Generates the required Coefficients based on `this.settings.coefficients`. */
    generateMaterials(): void {
        this.coefficients = new Coefficients(this.settings.coefficients);
        this.coefficients.generate();
    }

    /** Calls the generate method on the Term instance, passing the generated Coefficients. */
    generateContent(): void {
        if (!this.coefficients) {
            throw new Error("TermGenerator Error: Coefficients must be generated before generating Term content.");
        }
        this.object!.generate(this.coefficients);
    }
}

/**
 * Concrete generator for `Terms` objects (collections of terms, e.g., polynomials).
 * @class TermsGenerator
 * @extends BaseObjectGenerator<Terms, TermsSettings>
 */
class TermsGenerator extends BaseObjectGenerator<Terms, TermsSettings> {
    /** An array of Coefficients objects, one for each Term in the collection. */
    private coefficientsArray: Coefficients[] = []; // Renamed for clarity

    /** Initializes a new Terms object. */
    initiateObject(): void {
        this.object = new Terms(this.settings);
    }

    /** Generates an array of Coefficients objects, one for each term defined in `this.settings.terms`. */
    generateMaterials(): void {
        if (!this.settings.terms) {
            throw new Error("TermsGenerator Error: Terms settings array is missing.");
        }
        this.coefficientsArray = this.settings.terms.map(termSetting => {
            if (!termSetting.coefficients) {
                 throw new Error(`TermsGenerator Error: Coefficients settings missing for term: ${JSON.stringify(termSetting)}`);
            }
            const coefficients = new Coefficients(termSetting.coefficients);
            coefficients.generate();
            return coefficients;
        });
    }

    /** Calls the generate method on the Terms instance, passing the array of generated Coefficients. */
    generateContent(): void {
        if (!this.coefficientsArray || this.coefficientsArray.length === 0) {
            // Check if coefficientsArray is null or empty
            throw new Error("TermsGenerator Error: Coefficients array must be generated before generating Terms content.");
        }
        this.object!.generate(this.coefficientsArray);
    }
}

/**
 * Concrete generator for `Expression` objects.
 * @class ExpressionGenerator
 * @extends BaseObjectGenerator<Expression, ExpressionSettings>
 */
class ExpressionGenerator extends BaseObjectGenerator<Expression, ExpressionSettings> {
    /** An array holding the generated sub-components (Terms, Terms, or nested Expressions). */
    private subComponents: ExpressionComponent[] = [];

    /** Initializes a new Expression object. */
    initiateObject(): void {
        this.object = new Expression(this.settings);
    }

    /** Recursively generates each sub-component defined in `this.settings.expressions`. */
    generateMaterials(): void {
        if (!this.settings.expressions) {
            throw new Error("ExpressionGenerator Error: Expressions array is missing in settings.");
        }
        this.subComponents = this.settings.expressions.map(subSettings => {
            // Use type guards or discriminant properties to determine the type of subSettings
            // For now, using 'in' checks which might be brittle.
            // Consider adding an explicit 'objectType' to nested settings if not already present.
            if ("expressions" in subSettings) { // It's another Expression
                const exprGen = new ExpressionGenerator(subSettings as ExpressionSettings);
                return exprGen.generate();
            } else if ("terms" in subSettings) { // It's a Terms object
                const termsGen = new TermsGenerator(subSettings as TermsSettings);
                return termsGen.generate();
            } else if ("coefficients" in subSettings) { // It's likely a Term object
                // Need to ensure this is indeed TermSettings and not something else with coefficients
                const termGen = new TermGenerator(subSettings as TermSettings);
                return termGen.generate();
            } else {
                throw new Error(`ExpressionGenerator Error: Unknown sub-component type in expressions array: ${JSON.stringify(subSettings)}`);
            }
        });
    }

    /** Calls the generate method on the Expression instance, passing the array of generated sub-components. */
    generateContent(): void {
        if (this.subComponents.length === 0 && this.settings.expressions?.length > 0) {
             // If subComponents is empty but settings.expressions was not, generation likely failed.
            throw new Error("ExpressionGenerator Error: Sub-components array is empty despite settings having expressions. Material generation might have failed.");
        }
        // It's valid for an expression to have zero components if settings.expressions was empty.
        this.object!.generate(this.subComponents);
    }
}

/**
 * Concrete generator for `Equation` objects.
 * @class EquationGenerator
 * @extends BaseObjectGenerator<Equation, EquationSettings>
 */
export class EquationGenerator extends BaseObjectGenerator<Equation, EquationSettings> {
    /** An array holding the two generated Expressions representing the LHS and RHS of the equation. */
    private sides: Expression[] = [];

    /** Initializes a new Equation object. */
    initiateObject(): void {
        this.object = new Equation(this.settings);
    }

    /**
     * Generates the left-hand side (LHS) and right-hand side (RHS) Expressions.
     * Handles both simple mode (one ExpressionSettings split into two) and complex mode (two separate ExpressionSettings).
     * @throws {Error} If simple mode settings do not contain exactly two sub-expressions.
     */
    generateMaterials(): void {
        if (!this.settings.terms) {
            throw new Error("EquationGenerator Error: Terms (representing sides) are missing in settings.");
        }
        // Explicitly check length for tuple types, which is valid typescript
        if (this.settings.terms.length === 1 && this.settings.terms[0]) {
            // SIMPLE MODE: One ExpressionSettings that needs to be split.
            const exprSettings = this.settings.terms[0];
            if (!exprSettings.expressions || exprSettings.expressions.length !== 2) {
                throw new Error("EquationGenerator Error: Simple equation mode requires settings with exactly 2 expressions (LHS and RHS) defined within the first 'terms' element.");
            }
            const leftGen = new ExpressionGenerator({ ...exprSettings, expressions: [exprSettings.expressions[0]] });
            const rightGen = new ExpressionGenerator({ ...exprSettings, expressions: [exprSettings.expressions[1]] });
            this.sides = [leftGen.generate(), rightGen.generate()];
        } else if (this.settings.terms.length === 2 && this.settings.terms[0] && this.settings.terms[1]) {
            // COMPLEX MODE: Two ExpressionSettings provided, one for each side.
            const leftGen = new ExpressionGenerator(this.settings.terms[0] as ExpressionSettings);
            const rightGen = new ExpressionGenerator(this.settings.terms[1] as ExpressionSettings);
            this.sides = [leftGen.generate(), rightGen.generate()];
        } else {
            throw new Error(`EquationGenerator Error: Invalid number of terms provided (${this.settings.terms?.length ?? 0}). Expected 1 (for simple mode) or 2 (for complex mode).`);
        }
    }

    /** Calls the generate method on the Equation instance, passing the generated LHS and RHS Expressions. */
    generateContent(): void {
        if (this.sides.length !== 2) {
            throw new Error("EquationGenerator Error: Exactly two sides (LHS and RHS) must be generated before generating Equation content.");
        }
        this.object!.generate(this.sides);
    }
}

/**
 * Concrete generator for `Inequality` objects.
 * @class InequalityGenerator
 * @extends BaseObjectGenerator<Inequality, InequalitySettings>
 */
export class InequalityGenerator extends BaseObjectGenerator<Inequality, InequalitySettings> {
     /** An array holding the two generated Expressions representing the LHS and RHS of the inequality. */
    private sides: Expression[] = [];

    /** Initializes a new Inequality object. */
    initiateObject(): void {
        this.object = new Inequality(this.settings);
    }

    /**
     * Generates the left-hand side (LHS) and right-hand side (RHS) Expressions for the inequality.
     * Handles splitting a single ExpressionSettings or using two separate ones, similar to EquationGenerator.
     * @throws {Error} If settings are missing or invalid.
     */
    generateMaterials(): void {
         if (!this.settings.terms) {
            throw new Error("InequalityGenerator Error: Terms (representing sides) are missing in settings.");
        }
        // Explicitly check length for tuple types, which is valid typescript
        if (this.settings.terms.length === 1 && this.settings.terms[0]) {
            // SIMPLE MODE: Split one ExpressionSettings
            const exprSettings = this.settings.terms[0];
             if (!exprSettings.expressions || exprSettings.expressions.length < 2) {
                 throw new Error("InequalityGenerator Error: Simple inequality mode requires settings with at least 2 expressions to split into LHS and RHS.");
            }
            const midPoint = exprSettings.expressions.length === 2 ? 1 : Math.floor(exprSettings.expressions.length / 2);
            const leftGen = new ExpressionGenerator({ ...exprSettings, expressions: exprSettings.expressions.slice(0, midPoint) });
            const rightGen = new ExpressionGenerator({ ...exprSettings, expressions: exprSettings.expressions.slice(midPoint) });
            this.sides = [leftGen.generate(), rightGen.generate()];
        } else if (this.settings.terms.length === 2 && this.settings.terms[0] && this.settings.terms[1]) {
            // COMPLEX MODE: Two ExpressionSettings provided.
             const leftGen = new ExpressionGenerator(this.settings.terms[0] as ExpressionSettings);
            const rightGen = new ExpressionGenerator(this.settings.terms[1] as ExpressionSettings);
            this.sides = [leftGen.generate(), rightGen.generate()];
        } else {
             throw new Error(`InequalityGenerator Error: Invalid number of terms provided (${this.settings.terms?.length ?? 0}). Expected 1 (for simple mode) or 2 (for complex mode).`);
        }
    }

    /** Calls the generate method on the Inequality instance, passing the generated LHS and RHS Expressions. */
    generateContent(): void {
        if (this.sides.length !== 2) {
            throw new Error("InequalityGenerator Error: Exactly two sides (LHS and RHS) must be generated before generating Inequality content.");
        }
        this.object!.generate(this.sides);
    }
}

/**
 * Concrete generator for `Function` objects.
 * @class FunctionGenerator
 * @extends BaseObjectGenerator<Function, FunctionSettings>
 */
export class FunctionGenerator extends BaseObjectGenerator<Function, FunctionSettings> {
    /** The Expression object representing the function's body/rule. */
    private expression: Expression | null = null;

    /** Initializes a new Function object. */
    initiateObject(): void {
        this.object = new Function(this.settings);
    }

    /** Generates the Expression defined in `this.settings.expression`. */
    generateMaterials(): void {
        if (!this.settings.expression) {
            throw new Error("FunctionGenerator Error: Expression settings are missing.");
        }
        const exprGen = new ExpressionGenerator(this.settings.expression);
        this.expression = exprGen.generate();
    }

    /** Calls the generate method on the Function instance, passing the generated Expression. */
    generateContent(): void {
        if (!this.expression) {
            throw new Error("FunctionGenerator Error: Expression must be generated before generating Function content.");
        }
        this.object!.generate(this.expression);
    }
}

/**
 * Concrete generator for `Point` objects.
 * @class PointGenerator
 * @extends BaseObjectGenerator<Point, PointSettings>
 */
export class PointGenerator extends BaseObjectGenerator<Point, PointSettings> {
    /** The Coefficients object representing the point's coordinates. */
    private coefficients: Coefficients | null = null;

    /** Initializes a new Point object. */
    initiateObject(): void {
        this.object = new Point(this.settings);
    }

    /** Generates the Coefficients for the coordinates based on `this.settings.coefficients`. */
    generateMaterials(): void {
         if (!this.settings.coefficients) {
            throw new Error("PointGenerator Error: Coefficients settings are missing.");
        }
        this.coefficients = new Coefficients(this.settings.coefficients);
        this.coefficients.generate();
    }

    /** Calls the generate method on the Point instance, passing the generated Coefficients (coordinates). */
    generateContent(): void {
        if (!this.coefficients) {
            throw new Error("PointGenerator Error: Coefficients must be generated before generating Point content.");
        }
        this.object!.generate(this.coefficients);
    }
}

/**
 * Concrete generator for `Interval` objects.
 * @class IntervalGenerator
 * @extends BaseObjectGenerator<Interval, IntervalSettings>
 */
class IntervalGenerator extends BaseObjectGenerator<Interval, IntervalSettings> {
     /** The Coefficients object representing the interval's endpoints. */
    private coefficients: Coefficients | null = null;

    /** Initializes a new Interval object. */
    initiateObject(): void {
        this.object = new Interval(this.settings);
    }

    /** Generates the Coefficients for the endpoints based on `this.settings.coefficients`. */
    generateMaterials(): void {
         if (!this.settings.coefficients) {
            throw new Error("IntervalGenerator Error: Coefficients settings are missing.");
        }
        this.coefficients = new Coefficients(this.settings.coefficients);
        this.coefficients.generate();
        
        // Validate minimumLength constraint if specified
        if (this.settings.minimumLength !== undefined && this.coefficients.generatedItems.length >= 2) {
            const endpoint1 = this.parseCoefficientToNumber(this.coefficients.generatedItems[0]);
            const endpoint2 = this.parseCoefficientToNumber(this.coefficients.generatedItems[1]);
            
            if (!isNaN(endpoint1) && !isNaN(endpoint2)) {
                const intervalLength = Math.abs(endpoint2 - endpoint1);
                if (intervalLength < this.settings.minimumLength) {
                    throw new Error(
                        `IntervalGenerator Error: Generated interval length (${intervalLength.toFixed(2)}) ` +
                        `is less than required minimumLength (${this.settings.minimumLength}). ` +
                        `Endpoints: [${this.coefficients.generatedItems[0]}, ${this.coefficients.generatedItems[1]}]`
                    );
                }
            }
        }
    }
    
    /**
     * Parses a coefficient string representation to a numeric value.
     * Handles decimals, integers, and simple fractions (e.g., "3/4").
     * @param coefficientString - The string representation of the coefficient.
     * @returns The numeric value, or NaN if parsing fails.
     * @private
     */
    private parseCoefficientToNumber(coefficientString: string): number {
        // Try direct parsing first (handles decimals and integers)
        const directParse = parseFloat(coefficientString);
        if (!isNaN(directParse)) {
            return directParse;
        }
        
        // Try parsing fractions (e.g., "3/4", "\\frac{3}{4}")
        const fractionMatch = coefficientString.match(/(?:\\frac\{(\d+(?:\.\d+)?)\}\{(\d+(?:\.\d+)?)\}|(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?))/);
        if (fractionMatch) {
            const numerator = parseFloat(fractionMatch[1] || fractionMatch[3] || '0');
            const denominator = parseFloat(fractionMatch[2] || fractionMatch[4] || '1');
            if (denominator !== 0) {
                return numerator / denominator;
            }
        }
        
        // If all parsing attempts fail, return NaN
        return NaN;
    }

    /** Calls the generate method on the Interval instance, passing the generated Coefficients (endpoints). */
    generateContent(): void {
        if (!this.coefficients) {
            // Error message was incorrect in original code
            throw new Error("IntervalGenerator Error: Coefficients must be generated before generating Interval content.");
        }
        // Use the pre-generated coefficients to generate the interval
        this.object!.generate(this.coefficients);
    }
}

/**
 * Concrete generator for `Set` objects.
 * @class SetGenerator
 * @extends BaseObjectGenerator<Set, SetSettings>
 */
export class SetGenerator extends BaseObjectGenerator<Set, SetSettings> {
    /** The Coefficients object representing the set's elements. */
    private coefficients: Coefficients | null = null;

    /** Initializes a new Set object. */
    initiateObject(): void {
        this.object = new Set(this.settings);
    }

    /** Generates the Coefficients for the elements based on `this.settings.coefficients`. */
    generateMaterials(): void {
        if (!this.settings.coefficients) {
            throw new Error("SetGenerator Error: Coefficients settings are missing.");
        }
        this.coefficients = new Coefficients(this.settings.coefficients);
        this.coefficients.generate();
    }

    /** Calls the generate method on the Set instance, passing the generated Coefficients (elements). */
    generateContent(): void {
        if (!this.coefficients) {
            throw new Error("SetGenerator Error: Coefficients must be generated before generating Set content.");
        }
        this.object!.generate(this.coefficients);
    }
}

/**
 * Mapping from ObjectType to the corresponding generator constructor.
 * Uses the GeneratorMap type to ensure type safety for each object type.
 */
const generatorMap: GeneratorMap = {
    coefficient: CoefficientGenerator,
    coefficients: CoefficientsGenerator,
    term: TermGenerator,
    terms: TermsGenerator,
    expression: ExpressionGenerator,
    equation: EquationGenerator,
    function: FunctionGenerator,
    point: PointGenerator,
    set: SetGenerator,
    interval: IntervalGenerator,
    inequality: InequalityGenerator,
};

/**
 * Type-safe helper function to create a generator instance with proper typing.
 * This function ensures that the settings type matches the generator's expected type.
 */
function createGenerator<T extends MathObjects, S extends MathObjectSettingsType>(
    GeneratorClass: GeneratorConstructor<T, S>,
    settings: S
): BaseObjectGenerator<T, S> {
    return new GeneratorClass(settings);
}

/**
 * Factory function to create and generate a single math object based on MathInput settings.
 *
 * @param {MathInput} input - An object containing the `objectType` and its corresponding settings object (e.g., `coefficientSettings`, `termSettings`).
 * @returns {MathObjects} The generated math object instance (e.g., a Coefficient, Term, Equation).
 * @throws {Error} If the `objectType` in the input is not recognized or supported by the factory.
 * @throws {Error} If the specific settings object corresponding to the `objectType` is missing in the input.
 */
function generateObjectFactory(input: MathInput): MathObjects {
    const GeneratorClass = generatorMap[input.objectType];
    if (!GeneratorClass) {
        throw new Error(`Unsupported object type: ${input.objectType}`);
    }

    const settings = extractSpecificSettings(input);
    if (!settings) {
        // This should ideally be caught by TypeScript types, but good to have a runtime check
        throw new Error(`Settings for object type '${input.objectType}' are missing in the input object.`);
    }

    // Use type-safe helper to create generator with proper typing
    // The switch statement in extractSpecificSettings ensures settings matches the objectType
    switch (input.objectType) {
        case "coefficient":
            return createGenerator(GeneratorClass as GeneratorConstructor<Coefficient, CoefficientSettings>, settings as CoefficientSettings).generate();
        case "coefficients":
            return createGenerator(GeneratorClass as GeneratorConstructor<Coefficients, CoefficientsSettings>, settings as CoefficientsSettings).generate();
        case "term":
            return createGenerator(GeneratorClass as GeneratorConstructor<Term, TermSettings>, settings as TermSettings).generate();
        case "terms":
            return createGenerator(GeneratorClass as GeneratorConstructor<Terms, TermsSettings>, settings as TermsSettings).generate();
        case "expression":
            return createGenerator(GeneratorClass as GeneratorConstructor<Expression, ExpressionSettings>, settings as ExpressionSettings).generate();
        case "equation":
            return createGenerator(GeneratorClass as GeneratorConstructor<Equation, EquationSettings>, settings as EquationSettings).generate();
        case "function":
            return createGenerator(GeneratorClass as GeneratorConstructor<Function, FunctionSettings>, settings as FunctionSettings).generate();
        case "point":
            return createGenerator(GeneratorClass as GeneratorConstructor<Point, PointSettings>, settings as PointSettings).generate();
        case "interval":
            return createGenerator(GeneratorClass as GeneratorConstructor<Interval, IntervalSettings>, settings as IntervalSettings).generate();
        case "set":
            return createGenerator(GeneratorClass as GeneratorConstructor<Set, SetSettings>, settings as SetSettings).generate();
        case "inequality":
            return createGenerator(GeneratorClass as GeneratorConstructor<Inequality, InequalitySettings>, settings as InequalitySettings).generate();
        default:
            const exhaustiveCheck: never = input;
            throw new Error(`Unhandled object type in generateObjectFactory: ${typeof exhaustiveCheck === 'object' && exhaustiveCheck !== null && 'objectType' in exhaustiveCheck ? String((exhaustiveCheck as { objectType: unknown }).objectType) : 'unknown'}`);
    }
}

/**
 * Generates an array of math objects from an array of MathInput configurations.
 *
 * @param {MathInput[]} inputs - An array of MathInput objects, each specifying a math object to generate.
 * @returns {MathObjects[]} An array containing the generated math object instances in the same order as the inputs.
 */
export function generateObjects(inputs: MathInput[]): MathObjects[] {
    // Add dependency handling here? Or assume inputs are ordered correctly?
    return inputs.map(input => generateObjectFactory(input));
}

/**
 * Helper function to extract the specific settings object from a MathInput object
 * based on its `objectType`.
 *
 * @param {MathInput} input - The MathInput object.
 * @returns {MathObjectSettingsType} The specific settings object (e.g., CoefficientSettings, TermSettings) corresponding to the input's objectType.
 * @throws {Error} If the specific settings object is unexpectedly missing (should be caught by types ideally).
 */
function extractSpecificSettings(input: MathInput): MathObjectSettingsType {
    switch (input.objectType) {
        case "coefficient": return input.coefficientSettings;
        case "coefficients": return input.coefficientsSettings;
        case "term": return input.termSettings;
        case "terms": return input.termsSettings;
        case "expression": return input.expressionSettings;
        case "equation": return input.equationSettings;
        case "function": return input.functionSettings;
        case "point": return input.pointSettings;
        case "interval": return input.intervalSettings;
        case "set": return input.setSettings;
        case "inequality": return input.inequalitySettings;
        default:
            // This should be unreachable if MathInput is exhaustive and input is valid
            const exhaustiveCheck: never = input;
            // Construct error message safely
            const objectTypeName = (typeof exhaustiveCheck === 'object' && exhaustiveCheck !== null && 'objectType' in exhaustiveCheck)
                ? String((exhaustiveCheck as { objectType: unknown }).objectType)
                : 'unknown';
            throw new Error(`Unhandled object type in extractSpecificSettings: ${objectTypeName}`);
    }
}



