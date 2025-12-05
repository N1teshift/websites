import React from "react";
import BaseMathObjectRenderer from "./BaseMathObjectRenderer";
import CoefficientSettingsContainer from "../containers/CoefficientSettingsContainer";
import { CoefficientSettings, MathObjectContainerProps } from "@math/types/index";
import { getDefaultSettings } from "../utils/interfaceDefaults";

/**
 * Renders the settings UI for a `Coefficient`.
 *
 * @param {MathObjectContainerProps<CoefficientSettings>} props - The component props.
 * @returns {React.ReactElement} The rendered UI for coefficient settings.
 * @remarks
 * - Uses `BaseMathObjectRenderer` to provide the overall structure.
 * - Specifies `CoefficientSettingsContainer` to render the actual form controls.
 * - Enables the simple/complex interface toggle (`supportsInterfaceToggle`).
 * - Provides an `onInterfaceChange` handler that resets settings (like rules and representation type)
 *   to the defaults for the chosen interface type, while preserving the core `numberSet` and `range`.
 */
const CoefficientRenderer: React.FC<MathObjectContainerProps<CoefficientSettings>> = ({
    containerId,
    settings,
    updateSettings,
    startIndex = 1,
    showDescription = false,
    objectType = null,
}) => {
    return (
        <BaseMathObjectRenderer
            containerId={containerId}
            settings={settings}
            updateSettings={updateSettings}
            startIndex={startIndex}
            showDescription={showDescription}
            objectType={objectType}
            settingsContainer={CoefficientSettingsContainer}
            supportsInterfaceToggle={true}
            onInterfaceChange={(newInterface, updateSettings) => {
                const defaultSettings = getDefaultSettings<CoefficientSettings>("coefficient", newInterface);
                updateSettings({
                    ...defaultSettings,
                    numberSet: settings.numberSet,
                    range: settings.range,
                });
            }}
        />
    );
};

export default CoefficientRenderer;



