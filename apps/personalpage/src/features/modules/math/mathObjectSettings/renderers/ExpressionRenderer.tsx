import React from "react";
import BaseMathObjectRenderer from "./BaseMathObjectRenderer";
import TermRenderer from "./TermRenderer";
import TermsRenderer from "./TermsRenderer";
import ExpressionSettingsContainer from "../containers/ExpressionSettingsContainer";
import InterfaceToggleSwitch from "../ui/InterfaceToggleSwitch";
import {
  ExpressionSettings,
  TermSettings,
  TermsSettings,
  DEFAULT_TERM_SETTINGS,
  DEFAULT_TERMS_SETTINGS,
  MathObjectContainerProps,
} from "@math/types/index";
//import { useInterfaceType } from "../hooks/useInterfaceType";

/**
 * Renders the settings UI for an `Expression`.
 * Expressions are composed of an array of sub-elements, each being either a `Term` or `Terms`.
 *
 * @param {MathObjectContainerProps<ExpressionSettings>} props - The component props.
 * @returns {React.ReactElement} The rendered UI for expression settings.
 * @remarks
 * - Uses `BaseMathObjectRenderer` for the overall structure and `ExpressionSettingsContainer`
 *   for top-level expression settings (e.g., combination type, overall power).
 * - Does *not* support the simple/complex toggle at the main Expression level.
 * - Uses the `childrenRenderer` prop to iterate through the `settings.expressions` array:
 *   - For each sub-expression, it determines if it represents a single `Term` or a collection (`Terms`).
 *   - It renders either `TermRenderer` or `TermsRenderer` accordingly.
 *   - Each sub-renderer is wrapped in an `InterfaceToggleSwitch`, allowing the user to dynamically
 *     change a sub-expression between being a single `Term` (simple) and a collection (`Terms` - complex).
 *   - Switching the toggle resets the settings for that specific sub-expression to the defaults for the new type.
 *   - Manages `startIndex` propagation for unique variable naming across sub-expressions.
 */
const ExpressionRenderer: React.FC<MathObjectContainerProps<ExpressionSettings>> = ({
  containerId,
  settings,
  updateSettings,
  startIndex = 1,
  showDescription = false,
  objectType = null,
}) => {
  const renderChildren = () => {
    let currentStartIndex = startIndex;

    return settings.expressions.map((expr, index) => {
      const subContainerId = `${containerId}-expr-${index}`;
      const isTermSettings = "coefficients" in expr && "termIds" in expr;

      // Get interface context without modifying it automatically
      //const { setInterfaceType } = useInterfaceType(subContainerId);

      const commonProps = {
        containerId: subContainerId,
        updateSettings: (newExprSettings: TermSettings | TermsSettings) => {
          updateSettings({
            ...settings,
            expressions: settings.expressions.map((e, i) => (i === index ? newExprSettings : e)),
          });
        },
        startIndex: currentStartIndex,
        showDescription: true,
      };

      // Calculate coefficient count for this sub-container
      const coefficientCount =
        "coefficients" in expr && "termIds" in expr
          ? (expr as TermSettings).coefficients.collectionCount
          : (expr as TermsSettings).terms.reduce(
              (sum, term) => sum + term.coefficients.collectionCount,
              0
            );
      currentStartIndex += coefficientCount;

      return (
        <div key={index} className="mt-1">
          <InterfaceToggleSwitch
            containerId={subContainerId}
            initialType={isTermSettings ? "simple" : "complex"}
            onChange={(newInterface) => {
              // Initialize with appropriate default settings based on interface type
              const newSettings =
                newInterface === "simple"
                  ? { ...DEFAULT_TERM_SETTINGS }
                  : { ...DEFAULT_TERMS_SETTINGS };

              // Update the expression
              commonProps.updateSettings(newSettings);
            }}
          >
            {isTermSettings ? (
              <TermRenderer {...commonProps} settings={expr as TermSettings} objectType="term" />
            ) : (
              <TermsRenderer {...commonProps} settings={expr as TermsSettings} objectType="terms" />
            )}
          </InterfaceToggleSwitch>
        </div>
      );
    });
  };

  return (
    <BaseMathObjectRenderer
      containerId={containerId}
      settings={settings}
      updateSettings={updateSettings}
      startIndex={startIndex}
      showDescription={showDescription}
      objectType={objectType}
      settingsContainer={ExpressionSettingsContainer}
      supportsInterfaceToggle={false}
      childrenRenderer={() => renderChildren()}
    />
  );
};

export default ExpressionRenderer;
