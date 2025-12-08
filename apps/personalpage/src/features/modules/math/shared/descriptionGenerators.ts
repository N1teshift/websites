/**
 * @file Math Object Description Generators
 * @description Provides functions to generate human-readable (LaTeX formatted)
 *              descriptions of various math objects based on their configuration settings.
 *              These descriptions are primarily used for UI display to give users a preview
 *              of the object they are defining.
 */
import { CoefficientsSettings } from "../types/mathObjectSettingsInterfaces";
import {
  CoefficientSettings,
  TermSettings,
  TermsSettings,
  ExpressionSettings,
  EquationSettings,
  InequalitySettings,
  FunctionSettings,
  PointSettings,
  SetSettings,
  IntervalSettings,
  InterfaceType,
} from "@math/types/index";
import {
  getRangeSetDescription,
  getRuleSetDescription,
} from "../mathObjectSettings/utils/descriptionUtils";
import { getNumberSetSymbol } from "../types/mathTypes";
import { getRepresentationPrefix } from "../mathObjectSettings/utils/descriptionUtils";
import { formatCombinationTerm } from "../mathObjects/core/TermFormatter";
import { applyPowerFormatting } from "../mathObjects/utils/formattingUtils";

/**
 * Generates a LaTeX description for a single coefficient based on its settings.
 *
 * @param {CoefficientSettings} settings - The settings for the coefficient.
 * @param {number} index - The numerical index for the coefficient's variable name (e.g., `a_index`).
 * @returns {string} A LaTeX string describing the coefficient (e.g., `$a_1 = \\frac{b}{c} \\in \\mathbf{Z} \\cap [1;10] \\cap \\{ 2n+1 \\mid n \\in \\mathbf{Z} \\}$`).
 */
export const generateCoefficientDescription = (
  settings: CoefficientSettings,
  index: number
): string => {
  const variableName = `a_{${index}}`;

  const representationPrefix = getRepresentationPrefix(settings.representationType, variableName);

  const sets: string[] = [];
  sets.push(getNumberSetSymbol(settings.numberSet));
  sets.push(getRangeSetDescription(settings.range));

  if (settings.rules && settings.rules.length > 0) {
    settings.rules.forEach((rule) => {
      sets.push(getRuleSetDescription(rule));
    });
  }

  const intersection = sets.join(" \\cap ");

  return `$${representationPrefix}${intersection}$`;
};

/**
 * Generates a LaTeX description for a collection of coefficients based on their settings.
 * Handles both simple (all coefficients share settings) and complex (individual settings) modes.
 *
 * @param {CoefficientsSettings} settings - The settings for the collection of coefficients.
 * @param {InterfaceType} interfaceType - The interface mode ("simple" or "complex").
 * @param {number} [startIndex=0] - The starting index for coefficient variable names.
 * @returns {string} A LaTeX string describing the coefficients.
 *                  In simple mode, describes all variables with shared properties.
 *                  In complex mode, concatenates descriptions of individual coefficients.
 */
export const generateCoefficientsDescription = (
  settings: CoefficientsSettings,
  interfaceType: InterfaceType,
  startIndex: number = 0
): string => {
  if (interfaceType === "simple") {
    const first = settings.coefficients[0];

    const variableNames = settings.coefficients
      .map((_, index) => `a_{${startIndex + index}}`)
      .join(", ");

    const representationPrefix = getRepresentationPrefix(first.representationType, variableNames);

    const sets: string[] = [];
    sets.push(getNumberSetSymbol(first.numberSet));
    sets.push(getRangeSetDescription(first.range));

    if (first.rules && first.rules.length > 0) {
      first.rules.forEach((rule) => {
        sets.push(getRuleSetDescription(rule));
      });
    }

    const intersection = sets.join(" \\cap ");
    return `$${representationPrefix}${intersection}$`;
  } else {
    // In complex mode, generate each coefficient's description with a global numbering.
    return settings.coefficients
      .map((coeff, index) => generateCoefficientDescription(coeff, startIndex + index))
      .join("$\\quad \\quad$");
  }
};

/**
 * Generates a LaTeX description for a single term based on its settings.
 *
 * @param {TermSettings} settings - The settings for the term.
 * @param {number} startIndex - The starting index for the term's coefficient variable names.
 * @param {boolean} [wrapInMathMode=true] - If true, wraps the output in `$..$`. Defaults to true.
 * @returns {string} A LaTeX string describing the term (e.g., `$(a_1 x^2 + a_2 x^1)^3$`).
 */
export const generateTermDescription = (
  settings: TermSettings,
  startIndex: number,
  wrapInMathMode = true
): string => {
  if (!settings.termIds) {
    console.warn("Warning: termIds is undefined in settings", settings);
    return "Invalid term settings: termIds is missing.";
  }

  const baseTerm = settings.termIds
    .map((termId, index) => `a_{${startIndex + index}} ${settings.variableName}^{${termId || 0}}`)
    .join(" + ")
    .replace(/\+\s-/g, "- ");

  const formattedTerm = applyPowerFormatting(baseTerm, settings.power, settings.powerOrder);

  return wrapInMathMode ? `$${formattedTerm}$` : formattedTerm;
};

/**
 * Generates a LaTeX description for a collection of terms (`Terms`) based on their settings.
 *
 * @param {TermsSettings} settings - The settings for the terms collection.
 * @param {number} startIndex - The starting index for the first term's coefficient variable names.
 * @param {boolean} [wrapInMathMode=false] - If true, wraps the final output in `$..$`. Defaults to false.
 * @returns {{ termDescription: string; terms: Array<{ termDescription: string; startIndex: number }>; nextIndex: number }}
 *          An object containing:
 *          - `termDescription`: The combined LaTeX string for the terms object.
 *          - `terms`: An array detailing each individual term's description and start index.
 *          - `nextIndex`: The next available coefficient index after all terms have been processed.
 */
export const generateTermsDescription = (
  settings: TermsSettings,
  startIndex: number,
  wrapInMathMode = false
) => {
  let coefficientIndex = startIndex;
  const termInfos = settings.terms.map((term) => {
    const thisStart = coefficientIndex;
    const desc = generateTermDescription(term, thisStart, false);
    // Determine how many coefficients this term uses
    coefficientIndex += term.termIds.length;
    return { termDescription: desc, startIndex: thisStart };
  });

  const formattedCombinationTerm = formatCombinationTerm(
    settings.combinationType,
    termInfos.map((info) => info.termDescription),
    settings.power,
    settings.powerOrder
  );

  return {
    termDescription: wrapInMathMode ? `$${formattedCombinationTerm}$` : formattedCombinationTerm,
    terms: termInfos,
    nextIndex: coefficientIndex,
  };
};

/**
 * Generates a LaTeX description for an expression based on its settings.
 * Recursively handles nested expressions, terms, or terms collections.
 *
 * @param {ExpressionSettings} settings - The settings for the expression.
 * @param {number} [startIndex=1] - The starting index for the first sub-expression's coefficient variable names.
 * @param {boolean} [wrapInMathMode=true] - If true, wraps the final output in `$..$`. Defaults to true.
 * @returns {{ expressionDescription: string; nextIndex: number }}
 *          An object containing:
 *          - `expressionDescription`: The combined LaTeX string for the expression.
 *          - `nextIndex`: The next available coefficient index after all sub-expressions have been processed.
 */
export const generateExpressionDescription = (
  settings: ExpressionSettings,
  startIndex: number = 1,
  wrapInMathMode = true
): { expressionDescription: string; nextIndex: number } => {
  // Add defensive check for missing expressions
  if (!settings || !settings.expressions) {
    console.warn("Expression settings missing 'expressions' array:", settings);
    return {
      expressionDescription: "Invalid expression settings: missing expressions array",
      nextIndex: startIndex,
    };
  }

  let coefficientIndex = startIndex;
  const subExpressionDescriptions: string[] = [];

  settings.expressions.forEach((subExpr) => {
    if ("coefficients" in subExpr && "termIds" in subExpr) {
      const termSubExpr = subExpr as TermSettings;
      const termDesc = generateTermDescription(termSubExpr, coefficientIndex, false);
      subExpressionDescriptions.push(termDesc);
      coefficientIndex += termSubExpr.coefficients.collectionCount;
    } else if ("terms" in subExpr) {
      const termsDescResult = generateTermsDescription(
        subExpr as TermsSettings,
        coefficientIndex,
        false
      );
      subExpressionDescriptions.push(termsDescResult.termDescription);
      coefficientIndex = termsDescResult.nextIndex;
    } else {
      const exprDescResult = generateExpressionDescription(
        subExpr as ExpressionSettings,
        coefficientIndex,
        false
      );
      subExpressionDescriptions.push(exprDescResult.expressionDescription);
      coefficientIndex = exprDescResult.nextIndex;
    }
  });

  const combinedExpression = formatCombinationTerm(
    settings.combinationType,
    subExpressionDescriptions,
    settings.power,
    settings.powerOrder
  );

  const finalExpression = wrapInMathMode ? `$${combinedExpression}$` : combinedExpression;

  return {
    expressionDescription: finalExpression,
    nextIndex: coefficientIndex,
  };
};

/**
 * Generates a LaTeX description for an equation based on its settings.
 * Handles both simple and complex interface modes.
 *
 * @param {EquationSettings} settings - The settings for the equation.
 * @param {InterfaceType} [interfaceType="complex"] - The interface mode.
 * @param {number} [startIndex=1] - The starting index for coefficient variable names.
 * @returns {{ equationDescription: string; coefficientCount: number }}
 *          An object containing:
 *          - `equationDescription`: The LaTeX string for the equation (e.g., `$LHS = RHS$`).
 *          - `coefficientCount`: The total number of coefficients used across both sides.
 */
export const generateEquationDescription = (
  settings: EquationSettings,
  interfaceType: InterfaceType = "complex",
  startIndex: number = 1
): { equationDescription: string; coefficientCount: number } => {
  let coefficientIndex = startIndex;

  if (interfaceType === "simple") {
    const exprSettings = settings.terms[0];
    const midPoint =
      exprSettings.expressions.length === 2 ? 1 : Math.floor(exprSettings.expressions.length / 2);
    const leftSide = exprSettings.expressions.slice(0, midPoint);
    const rightSide = exprSettings.expressions.slice(midPoint);
    const leftExpr = { ...exprSettings, expressions: leftSide };
    const rightExpr = { ...exprSettings, expressions: rightSide };

    const leftDescResult = generateExpressionDescription(leftExpr, coefficientIndex);
    const leftSideDescription = leftDescResult.expressionDescription;
    coefficientIndex = leftDescResult.nextIndex;

    const rightDescResult = generateExpressionDescription(rightExpr, coefficientIndex);
    const rightSideDescription = rightDescResult.expressionDescription;
    coefficientIndex = rightDescResult.nextIndex;

    return {
      equationDescription: `$${leftSideDescription} = ${rightSideDescription}$`,
      coefficientCount: coefficientIndex - 1,
    };
  } else {
    const terms = settings.terms as [ExpressionSettings, ExpressionSettings];
    const leftDescResult = generateExpressionDescription(terms[0], coefficientIndex);
    const leftSideDescription = leftDescResult.expressionDescription;
    coefficientIndex = leftDescResult.nextIndex;

    const rightDescResult = generateExpressionDescription(terms[1], coefficientIndex);
    const rightSideDescription = rightDescResult.expressionDescription;
    coefficientIndex = rightDescResult.nextIndex;

    return {
      equationDescription: `$${leftSideDescription} = ${rightSideDescription}$`,
      coefficientCount: coefficientIndex - 1,
    };
  }
};

const inequalitySymbolMap: Record<string, string> = {
  less: "<",
  greater: ">",
  leq: "\\leq",
  geq: "\\geq",
};

/**
 * Generates a LaTeX description for an inequality based on its settings.
 * Handles both simple and complex interface modes.
 *
 * @param {InequalitySettings} settings - The settings for the inequality.
 * @param {InterfaceType} [interfaceType="complex"] - The interface mode.
 * @param {number} [startIndex=1] - The starting index for coefficient variable names.
 * @returns {{ equationDescription: string; coefficientCount: number }}  *(Note: property name is equationDescription)*
 *          An object containing:
 *          - `equationDescription`: The LaTeX string for the inequality (e.g., `$LHS < RHS$`).
 *          - `coefficientCount`: The total number of coefficients used across both sides.
 */
export const generateInequalityDescription = (
  settings: InequalitySettings,
  interfaceType: InterfaceType = "complex",
  startIndex: number = 1
): { equationDescription: string; coefficientCount: number } => {
  let coefficientIndex = startIndex;

  let leftSideDescription: string, rightSideDescription: string;
  const symbol = inequalitySymbolMap[settings.inequalityType || "less"] || "<";

  if (interfaceType === "simple") {
    const exprSettings = settings.terms[0];
    const midPoint =
      exprSettings.expressions.length === 2 ? 1 : Math.floor(exprSettings.expressions.length / 2);
    const leftExpr = { ...exprSettings, expressions: exprSettings.expressions.slice(0, midPoint) };
    const rightExpr = { ...exprSettings, expressions: exprSettings.expressions.slice(midPoint) };

    const leftDescResult = generateExpressionDescription(leftExpr, coefficientIndex);
    leftSideDescription = leftDescResult.expressionDescription;
    coefficientIndex = leftDescResult.nextIndex;

    const rightDescResult = generateExpressionDescription(rightExpr, coefficientIndex);
    rightSideDescription = rightDescResult.expressionDescription;
    coefficientIndex = rightDescResult.nextIndex;
  } else {
    const terms = settings.terms as [ExpressionSettings, ExpressionSettings];
    const leftDescResult = generateExpressionDescription(terms[0], coefficientIndex);
    leftSideDescription = leftDescResult.expressionDescription;
    coefficientIndex = leftDescResult.nextIndex;

    const rightDescResult = generateExpressionDescription(terms[1], coefficientIndex);
    rightSideDescription = rightDescResult.expressionDescription;
    coefficientIndex = rightDescResult.nextIndex;
  }

  return {
    equationDescription: `$${leftSideDescription} ${symbol} ${rightSideDescription}$`,
    coefficientCount: coefficientIndex - 1,
  };
};

/**
 * Generates a LaTeX description for a function based on its settings.
 *
 * @param {FunctionSettings} settings - The settings for the function.
 * @param {number} [startIndex=1] - The starting index for coefficient variable names within the function's expression.
 * @returns {{ expressionDescription: string; coefficientCount: number }}
 *          An object containing:
 *          - `expressionDescription`: The LaTeX string for the function definition (e.g., `$f(x) = Expression$`).
 *          - `coefficientCount`: The total number of coefficients used in the function's expression.
 */
export const generateFunctionDescription = (
  settings: FunctionSettings,
  startIndex: number = 1
): { expressionDescription: string; coefficientCount: number } => {
  const coefficientIndex = startIndex;
  const exprDescResult = generateExpressionDescription(
    settings.expression,
    coefficientIndex,
    false
  );
  const functionName = settings.functionName || "f";

  return {
    expressionDescription: `$${functionName}(x) = ${exprDescResult.expressionDescription}$`,
    coefficientCount: exprDescResult.nextIndex - 1,
  };
};

/**
 * Generates a LaTeX description for a point based on its settings.
 *
 * @param {PointSettings} settings - The settings for the point.
 * @returns {string} A LaTeX string describing the point (e.g., `$A = (a_1, a_2)$`).
 */
export const generatePointDescription = (settings: PointSettings) => {
  const pointCoordinates = `(a_{1}; a_{2})`;
  return settings.showName ? `$${settings.name} = ${pointCoordinates}$` : `$${pointCoordinates}$`;
};

/**
 * Generates a LaTeX description for a set based on its settings.
 *
 * @param {SetSettings} settings - The settings for the set.
 * @returns {string} A LaTeX string describing the set (e.g., `$A = \\{ a_1, a_2 \\}$`).
 */
export const generateSetDescription = (settings: SetSettings) => {
  const elementsCount = settings.coefficients.collectionCount;
  const setElements = `\\{ ${Array.from({ length: elementsCount }, (_, i) => `a_{${i + 1}}`).join("; ")} \\}`;
  return settings.showName ? `$${settings.name} = ${setElements}$` : `$${setElements}$`;
};

/**
 * Generates a LaTeX description for an interval based on its settings.
 *
 * @param {IntervalSettings} settings - The settings for the interval.
 * @returns {string} A LaTeX string describing the interval (e.g., `$A = [a_1; a_2]$`).
 */
export const generateIntervalDescription = (settings: IntervalSettings) => {
  const interval =
    settings.intervalType === "closed"
      ? `[a_{1}; a_{2}]`
      : settings.intervalType === "open"
        ? `(a_{1}; a_{2})`
        : settings.intervalType === "closed_open"
          ? `[a_{1}; a_{2})`
          : settings.intervalType === "open_closed"
            ? `(a_{1}; a_{2}]`
            : `\\text{Invalid Interval Type}`;
  return settings.showName ? `$${settings.name} = ${interval}$` : `$${interval}$`;
};
