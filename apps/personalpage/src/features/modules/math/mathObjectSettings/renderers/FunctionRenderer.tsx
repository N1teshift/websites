import React from "react";
import BaseMathObjectRenderer from "./BaseMathObjectRenderer";
import ExpressionRenderer from "./ExpressionRenderer";
import FunctionSettingsContainer from "../containers/FunctionSettingsContainer";
import { FunctionSettings, ExpressionSettings, MathObjectContainerProps } from "@math/types/index";

/**
 * Renders the settings UI for a `Function`.
 * Functions have a name (e.g., f, g) and an `Expression` that defines their rule.
 *
 * @param {MathObjectContainerProps<FunctionSettings>} props - The component props.
 * @returns {React.ReactElement} The rendered UI for function settings.
 * @remarks
 * - Uses `BaseMathObjectRenderer` for the overall structure.
 * - Specifies `FunctionSettingsContainer` for the top-level function settings (currently just the name).
 * - Does not support the simple/complex interface toggle at the Function level.
 * - Uses `childrenRenderer` to render the `Expression` settings for the function's body
 *   using the `ExpressionRenderer` component.
 */
const FunctionRenderer: React.FC<MathObjectContainerProps<FunctionSettings>> = ({
  containerId,
  settings,
  updateSettings,
  startIndex = 1,
  showDescription = false,
  objectType = null,
}) => {
  const renderChildren = () => {
    const currentStartIndex = startIndex;
    const exprSettings = settings.expression;
    const commonProps = {
      containerId: `${containerId}-expression`,
      settings: exprSettings as ExpressionSettings,
      updateSettings: (newExprSettings: ExpressionSettings) =>
        updateSettings({
          ...settings,
          expression: newExprSettings,
        }),
      startIndex: currentStartIndex,
      showDescription: true,
      objectType: objectType, // Pass root "function" type
    };

    return <ExpressionRenderer {...commonProps} />;
  };

  return (
    <BaseMathObjectRenderer
      containerId={containerId}
      settings={settings}
      updateSettings={updateSettings}
      startIndex={startIndex}
      showDescription={showDescription}
      objectType={objectType}
      settingsContainer={FunctionSettingsContainer}
      supportsInterfaceToggle={false} // No simple/complex toggle for now
      childrenRenderer={() => renderChildren()}
    />
  );
};

export default FunctionRenderer;
