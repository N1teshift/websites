import React from "react";
import BaseMathObjectRenderer from "./BaseMathObjectRenderer";
import CoefficientRenderer from "./CoefficientRenderer";
import CoefficientsSettingsContainer from "../containers/CoefficientsSettingsContainer";
import { MathObjectContainerProps, CoefficientsSettings } from "@math/types/index";
import { getDefaultSettings } from "../utils/interfaceDefaults";
import useInterfaceType from "../hooks/useInterfaceType";

/**
 * Renders the settings UI for a collection of `Coefficients`.
 *
 * @param {MathObjectContainerProps<CoefficientsSettings>} props - The component props.
 * @returns {React.ReactElement} The rendered UI for coefficients settings.
 * @remarks
 * - Uses `BaseMathObjectRenderer` for the main structure and `CoefficientsSettingsContainer` for the top-level controls (count, rules).
 * - Enables the simple/complex interface toggle.
 * - The `onInterfaceChange` handler resets top-level settings (like rules) to defaults for the new interface,
 *   preserving the `collectionCount` and the existing array of individual coefficient settings.
 * - Uses the `childrenRenderer` prop of the base renderer to display individual `CoefficientRenderer` components:
 *   - **Simple Mode:** Renders only one `CoefficientRenderer` for the first coefficient. Any changes made here
 *     are duplicated across all coefficients in the collection.
 *   - **Complex Mode:** Renders a separate `CoefficientRenderer` for each coefficient in the collection,
 *     allowing independent configuration.
 */
const CoefficientsRenderer: React.FC<MathObjectContainerProps<CoefficientsSettings>> = ({
  containerId,
  settings,
  updateSettings,
  startIndex = 1,
  showDescription = false,
  objectType = null,
}) => {
  const { interfaceType } = useInterfaceType(containerId);

  const renderChildren = () => {
    if (interfaceType === "simple") {
      return (
        <div className="ml-5">
          <CoefficientRenderer
            containerId={`${containerId}-coefficient-single`}
            settings={settings.coefficients[0]}
            updateSettings={(newCoefficient) => {
              // In simple mode, update all coefficients to match the new settings
              const updatedCoefficients = Array(settings.collectionCount)
                .fill(null)
                .map(() => ({ ...newCoefficient }));
              updateSettings({
                ...settings,
                coefficients: updatedCoefficients,
              });
            }}
            startIndex={startIndex}
            showDescription={false}
            objectType={objectType}
          />
        </div>
      );
    } else {
      let currentIndex: number = startIndex ?? 1;
      return (
        <div className="mt-1">
          {settings.coefficients.map((coefficient, index) => {
            const coeffStartIndex = currentIndex;
            currentIndex += 1;
            return (
              <div key={index} className="ml-5">
                <CoefficientRenderer
                  containerId={`${containerId}-coefficient-${index}`}
                  settings={coefficient}
                  updateSettings={(newCoefficient) =>
                    updateSettings({
                      ...settings,
                      coefficients: settings.coefficients.map((coeff, idx) =>
                        idx === index ? newCoefficient : coeff
                      ),
                    })
                  }
                  startIndex={coeffStartIndex}
                  showDescription={false}
                  objectType={objectType}
                />
              </div>
            );
          })}
        </div>
      );
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
      settingsContainer={CoefficientsSettingsContainer}
      supportsInterfaceToggle={true}
      onInterfaceChange={(newInterface, updateSettings) => {
        const defaultSettings = getDefaultSettings<CoefficientsSettings>(
          "coefficients",
          newInterface
        );
        updateSettings({
          ...defaultSettings,
          collectionCount: settings.collectionCount,
          rules: settings.rules,
          coefficients: settings.coefficients.map((coefficient) => ({
            ...coefficient,
            interfaceType: newInterface, // Ensure each coefficient uses the new interface type
          })),
        });
      }}
      childrenRenderer={() => renderChildren()}
    />
  );
};

export default CoefficientsRenderer;
