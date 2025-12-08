import React from "react";
import BaseMathObjectRenderer from "./BaseMathObjectRenderer";
import ExpressionRenderer from "./ExpressionRenderer";
import EquationSettingsContainer from "../containers/EquationSettingsContainer";
import {
  EquationSettings,
  ExpressionSettings,
  TermSettings,
  TermsSettings,
  MathObjectContainerProps,
  DEFAULT_SIMPLE_EQUATION_SETTINGS,
  DEFAULT_COMPLEX_EQUATION_SETTINGS,
} from "@math/types/index";
import useInterfaceType from "../hooks/useInterfaceType";

/**
 * Renders the settings UI for an `Equation`.
 * Equations consist of two sides (Left Hand Side and Right Hand Side), each represented by an `Expression`.
 *
 * @param {MathObjectContainerProps<EquationSettings>} props - The component props.
 * @returns {React.ReactElement} The rendered UI for equation settings.
 * @remarks
 * - Uses `BaseMathObjectRenderer` for the overall structure.
 * - Specifies `EquationSettingsContainer` for any top-level equation settings (though currently minimal).
 * - Enables the simple/complex interface toggle.
 * - When the interface type changes:
 *   - To "simple": Resets settings to `DEFAULT_SIMPLE_EQUATION_SETTINGS`.
 *   - To "complex": Resets settings to `DEFAULT_COMPLEX_EQUATION_SETTINGS`.
 * - Uses `childrenRenderer` to display `ExpressionRenderer` components for the sides:
 *   - **Simple Mode:** Renders a single `ExpressionRenderer` where the `EquationSettings.terms[0]` (an `ExpressionSettings`)
 *     is expected to define both LHS and RHS internally.
 *   - **Complex Mode:** Renders two separate `ExpressionRenderer` components, one for each `ExpressionSettings`
 *     in `EquationSettings.terms` (representing LHS and RHS respectively). It manages `startIndex` to attempt unique
 *     variable naming across sides.
 */
const EquationRenderer: React.FC<MathObjectContainerProps<EquationSettings>> = ({
  containerId,
  settings,
  updateSettings,
  startIndex = 1,
  showDescription = false,
  objectType = null,
}) => {
  const { interfaceType } = useInterfaceType(containerId);

  const renderChildren = () => {
    let currentStartIndex = startIndex;

    if (interfaceType === "simple") {
      const exprSettings = settings.terms[0];
      const commonProps = {
        containerId: `${containerId}-expression`,
        settings: exprSettings as ExpressionSettings,
        updateSettings: (newExprSettings: ExpressionSettings) =>
          updateSettings({
            ...settings,
            terms: [newExprSettings] as [ExpressionSettings],
          }),
        startIndex: currentStartIndex,
        showDescription: false,
        objectType: objectType, // Pass root "equation" type
      };

      return <ExpressionRenderer {...commonProps} />;
    } else {
      const terms = settings.terms as [ExpressionSettings, ExpressionSettings];
      return terms.map((side, sideIndex) => {
        const subContainerId = `${containerId}-side-${sideIndex}`;
        const commonProps = {
          containerId: subContainerId,
          settings: side as ExpressionSettings,
          updateSettings: (newSideSettings: ExpressionSettings) =>
            updateSettings({
              ...settings,
              terms: terms.map((s, i) => (i === sideIndex ? newSideSettings : s)) as [
                ExpressionSettings,
                ExpressionSettings,
              ],
            }),
          startIndex: currentStartIndex,
          showDescription: true,
          objectType: objectType, // Pass root "equation" type
        };

        const coefficientCount = side.expressions.reduce(
          (sum, expr) =>
            sum +
            ("coefficients" in expr && "termIds" in expr
              ? (expr as TermSettings).coefficients.collectionCount
              : (expr as TermsSettings).terms.reduce(
                  (s, t) => s + t.coefficients.collectionCount,
                  0
                )),
          0
        );
        currentStartIndex += coefficientCount;

        return (
          <div key={sideIndex} className="mt-1">
            <ExpressionRenderer {...commonProps} />
            {sideIndex === 0}
          </div>
        );
      });
    }
  };

  return (
    <BaseMathObjectRenderer
      containerId={containerId}
      settings={settings}
      updateSettings={updateSettings}
      startIndex={startIndex}
      showDescription={showDescription}
      objectType={objectType}
      settingsContainer={EquationSettingsContainer}
      supportsInterfaceToggle={true}
      onInterfaceChange={(newInterface) => {
        if (newInterface === "simple") {
          updateSettings(DEFAULT_SIMPLE_EQUATION_SETTINGS);
        } else {
          // Use the default complex settings directly
          updateSettings(DEFAULT_COMPLEX_EQUATION_SETTINGS);
        }
      }}
      childrenRenderer={() => renderChildren()}
    />
  );
};

export default EquationRenderer;
