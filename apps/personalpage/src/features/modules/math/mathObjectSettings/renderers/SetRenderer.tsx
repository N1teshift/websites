import React from "react";
import BaseMathObjectRenderer from "./BaseMathObjectRenderer";
import CoefficientsRenderer from "./CoefficientsRenderer";
import SetSettingsContainer from "../containers/SetSettingsContainer";
import { SetSettings, CoefficientsSettings, MathObjectContainerProps } from "@math/types/index";

/**
 * Renders the settings UI for a `Set`.
 * Sets have a name and elements defined by `CoefficientsSettings`.
 *
 * @param {MathObjectContainerProps<SetSettings>} props - The component props.
 * @returns {React.ReactElement} The rendered UI for set settings.
 * @remarks
 * - Uses `BaseMathObjectRenderer` for the overall structure.
 * - Specifies `SetSettingsContainer` for the top-level set settings (name, showName).
 * - Does not support the simple/complex interface toggle at the Set level.
 * - Uses `childrenRenderer` to render the `CoefficientsSettings` for the set's elements
 *   using the `CoefficientsRenderer` component.
 */
const SetRenderer: React.FC<MathObjectContainerProps<SetSettings>> = ({
  containerId,
  settings,
  updateSettings,
  startIndex = 1,
  showDescription = false,
  objectType = null,
}) => {
  const renderChildren = () => {
    const commonProps = {
      containerId: `${containerId}-coefficients`,
      settings: settings.coefficients as CoefficientsSettings,
      updateSettings: (newCoefficients: CoefficientsSettings) =>
        updateSettings({
          ...settings,
          coefficients: newCoefficients,
        }),
      startIndex: startIndex,
      showDescription: true,
      objectType: objectType,
    };

    return (
      <div className="ml-5 mt-1 flex flex-col gap-1">
        <CoefficientsRenderer {...commonProps} />
      </div>
    );
  };

  return (
    <BaseMathObjectRenderer
      containerId={containerId}
      settings={settings}
      updateSettings={updateSettings}
      startIndex={startIndex}
      showDescription={showDescription}
      objectType={objectType}
      settingsContainer={SetSettingsContainer}
      supportsInterfaceToggle={false}
      childrenRenderer={() => renderChildren()}
    />
  );
};

export default SetRenderer;
