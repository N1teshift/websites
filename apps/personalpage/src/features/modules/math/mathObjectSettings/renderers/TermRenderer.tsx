import React from "react";
import { TermSettings, MathObjectContainerProps } from "@math/types/index";
import TermSettingsContainer from "../containers/TermSettingsContainer";
import BaseMathObjectRenderer from "./BaseMathObjectRenderer";
import CoefficientsRenderer from "./CoefficientsRenderer";

/**
 * Renders the settings UI for a `Term`.
 * Terms have settings for variable name, overall power, term IDs (exponents),
 * and underlying `CoefficientsSettings`.
 *
 * @param {MathObjectContainerProps<TermSettings>} props - The component props.
 * @returns {React.ReactElement} The rendered UI for term settings.
 * @remarks
 * - Uses `BaseMathObjectRenderer` for the overall structure.
 * - Specifies `TermSettingsContainer` for the top-level term settings (variable, power, term IDs).
 * - Does not support the simple/complex interface toggle at the Term level.
 * - Uses `childrenRenderer` to render the `CoefficientsSettings` associated with the term
 *   using the `CoefficientsRenderer` component.
 */
const TermRenderer: React.FC<MathObjectContainerProps<TermSettings>> = ({
    containerId,
    settings,
    updateSettings,
    startIndex = 1,
    showDescription = false,
    //objectType = null,
}) => {
    return (
        <BaseMathObjectRenderer
            containerId={containerId}
            settings={settings}
            updateSettings={updateSettings}
            startIndex={startIndex}
            showDescription={showDescription}
            objectType="term"
            settingsContainer={TermSettingsContainer}
            supportsInterfaceToggle={false}
            childrenRenderer={({ containerId, settings, updateSettings, startIndex }) => (
                <div className="ml-5 mt-1">
                    <CoefficientsRenderer
                        containerId={`${containerId}-coefficients`}
                        settings={settings.coefficients}
                        updateSettings={(newSettings) => updateSettings({ ...settings, coefficients: newSettings })}
                        startIndex={startIndex}
                        showDescription={true}
                        objectType="coefficients"
                    />
                </div>
            )}
        />
    );
};

export default TermRenderer;



