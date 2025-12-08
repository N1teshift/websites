import React from "react";
import {
  CoefficientSettings,
  CoefficientsSettings,
  TermSettings,
  TermsSettings,
  EquationSettings,
  FunctionSettings,
  PointSettings,
  SetSettings,
  IntervalSettings,
  InequalitySettings,
  ExpressionSettings,
  MathObjectSettingsType,
  InterfaceType,
} from "@math/types/index";
import { parseAndRenderMath } from "@math/shared/components";
import {
  generateCoefficientDescription,
  generateCoefficientsDescription,
  generateTermDescription,
  generateTermsDescription,
  generateExpressionDescription,
  generateEquationDescription,
  generateInequalityDescription,
  generateFunctionDescription,
  generatePointDescription,
  generateSetDescription,
  generateIntervalDescription,
} from "../../shared/descriptionGenerators";

export interface MathObjectDescriptionProps {
  /** The type of the math object (e.g., "coefficient", "term"). */
  objectType: string;
  /** The interface complexity ("simple" or "complex"). */
  interfaceType: InterfaceType;
  /** The starting index for generating variable names (e.g., `x_1`, `x_2`). */
  startIndex: number;
  /** The specific settings object for the math object type. */
  settings: MathObjectSettingsType;
}

/**
 * React component that displays a dynamically generated LaTeX description
 * of a math object based on its type and settings.
 *
 * @param {MathObjectDescriptionProps} props - The component props.
 * @returns {React.ReactElement} A div containing the rendered LaTeX description.
 * @remarks
 * Uses helper functions from `../../shared/descriptionGenerators` to create the
 * description string, which is then parsed and rendered using `@components/mathParser`.
 */
const MathObjectDescription: React.FC<MathObjectDescriptionProps> = ({
  objectType,
  interfaceType,
  startIndex,
  settings,
}) => {
  let description = "";

  switch (objectType) {
    case "coefficient":
      description = generateCoefficientDescription(settings as CoefficientSettings, 1);
      break;
    case "coefficients":
      description = generateCoefficientsDescription(
        settings as CoefficientsSettings,
        interfaceType,
        startIndex
      );
      break;
    case "term":
      description = generateTermDescription(settings as TermSettings, startIndex);
      break;
    case "terms":
      const termsDescResult = generateTermsDescription(settings as TermsSettings, startIndex, true);
      description = termsDescResult.termDescription;
      break;
    case "expression":
      const expressionDescResult = generateExpressionDescription(
        settings as ExpressionSettings,
        startIndex,
        true
      );
      description = expressionDescResult.expressionDescription;
      break;
    case "equation":
      const equationDescResult = generateEquationDescription(
        settings as EquationSettings,
        interfaceType,
        startIndex
      );
      description = equationDescResult.equationDescription;
      break;
    case "inequality":
      const inequalityDescResult = generateInequalityDescription(
        settings as InequalitySettings,
        interfaceType,
        startIndex
      );
      description = inequalityDescResult.equationDescription;
      break;
    case "function":
      const functionDescResult = generateFunctionDescription(
        settings as FunctionSettings,
        startIndex
      );
      description = functionDescResult.expressionDescription;
      break;
    case "point":
      description = generatePointDescription(settings as PointSettings);
      break;
    case "set":
      description = generateSetDescription(settings as SetSettings);
      break;
    case "interval":
      description = generateIntervalDescription(settings as IntervalSettings);
      break;

    default:
      description = "$\\text{Unknown Object Type}$";
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Description */}
      <div className="text-sm text-text-secondary bg-surface-card p-2 rounded-md border border-border-default">
        {parseAndRenderMath(description)}
      </div>
    </div>
  );
};

export default MathObjectDescription;
