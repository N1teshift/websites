import React from "react";
import BaseMathObjectRenderer from "./BaseMathObjectRenderer";
import CoefficientsRenderer from "./CoefficientsRenderer";
import PointSettingsContainer from "../containers/PointSettingsContainer";
import { PointSettings, CoefficientsSettings, MathObjectContainerProps } from "@math/types/index";

/**
 * Renders the settings UI for a `Point`.
 * Points have a name and coordinates defined by `CoefficientsSettings`.
 *
 * @param {MathObjectContainerProps<PointSettings>} props - The component props.
 * @returns {React.ReactElement} The rendered UI for point settings.
 * @remarks
 * - Uses `BaseMathObjectRenderer` for the overall structure.
 * - Specifies `PointSettingsContainer` for the top-level point settings (name, showName).
 * - Does not support the simple/complex interface toggle at the Point level.
 * - Uses `childrenRenderer` to render the `CoefficientsSettings` for the point's coordinates
 *   using the `CoefficientsRenderer` component.
 */
const PointRenderer: React.FC<MathObjectContainerProps<PointSettings>> = ({
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
            settingsContainer={PointSettingsContainer}
            supportsInterfaceToggle={false}
            childrenRenderer={() => renderChildren()}
        />
    );
};

export default PointRenderer;



