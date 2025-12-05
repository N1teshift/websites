import React from "react";
import BaseMathObjectRenderer from "./BaseMathObjectRenderer";
import CoefficientsRenderer from "./CoefficientsRenderer";
import IntervalSettingsContainer from "../containers/IntervalSettingsContainer";
import { IntervalSettings, CoefficientsSettings, MathObjectContainerProps } from "@math/types/index";

/**
 * Renders the settings UI for an `Interval`.
 * Intervals have a name, type (open/closed), minimum length, and endpoints defined by `CoefficientsSettings`.
 *
 * @param {MathObjectContainerProps<IntervalSettings>} props - The component props.
 * @returns {React.ReactElement} The rendered UI for interval settings.
 * @remarks
 * - Uses `BaseMathObjectRenderer` for the overall structure.
 * - Specifies `IntervalSettingsContainer` for the top-level interval settings (name, type, min length).
 * - Does not support the simple/complex interface toggle at the Interval level.
 * - Uses `childrenRenderer` to render the `CoefficientsSettings` for the interval's endpoints
 *   using the `CoefficientsRenderer` component.
 */
const IntervalRenderer: React.FC<MathObjectContainerProps<IntervalSettings>> = ({
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
            objectType: objectType, // Pass root "interval" type
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
            settingsContainer={IntervalSettingsContainer}
            supportsInterfaceToggle={false}
            childrenRenderer={() => renderChildren()}
        />
    );
};

export default IntervalRenderer;



