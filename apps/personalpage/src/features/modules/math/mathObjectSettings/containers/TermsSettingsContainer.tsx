import React from "react";
import BaseMathObjectSettingsContainer from "./BaseMathObjectSettingsContainer";
import { PowerInput, PowerOrderToggle } from "../ui";
import { Dropdown } from "@websites/ui";
import { combinationTypeOptions, CombinationType, TermsSettings, MathObjectContainerProps } from "@math/types/index";

/**
 * Container component for managing settings for `Terms` (a collection or combination of individual terms).
 * Allows configuration of the overall power/root applied to the combination and the type of combination used.
 *
 * @param {MathObjectContainerProps<TermsSettings>} props - The component props, including settings, update callbacks, and display options.
 * @returns {React.ReactElement} The rendered terms settings UI.
 * @remarks
 * - Wraps content in `BaseMathObjectSettingsContainer`.
 * - Provides UI controls for:
 *   - `power`: Overall power/root applied to the combined result (using `PowerInput`).
 *   - `powerOrder`: Order of applying power vs. root (using `PowerOrderToggle`).
 *   - `combinationType`: How the individual terms within the collection are combined
 *     (e.g., addition, multiplication), selected via a `Dropdown`.
 */
const TermsSettingsContainer: React.FC<MathObjectContainerProps<TermsSettings>> = ({
    containerId,
    settings,
    updateSettings,
    startIndex = 1,
    showDescription = false,
    objectType = "terms",
}) => {
    const handlePowerChange = (newPower: [number, number]) => {
        updateSettings({ ...settings, power: newPower });
    };

    const handlePowerOrderChange = (newPowerOrder: boolean) => {
        updateSettings({ ...settings, powerOrder: newPowerOrder });
    };

    const handleCombinationTypeChange = (newCombinationType: string) => {
        updateSettings({ ...settings, combinationType: newCombinationType as CombinationType });
    };

    return (
        <BaseMathObjectSettingsContainer
            containerId={containerId}
            settings={settings}
            updateSettings={updateSettings}
            startIndex={startIndex}
            showDescription={showDescription}
            objectType={objectType}
        >
            {(props) => (
                <div className="flex flex-row items-center gap-4">
                    <PowerInput
                        label={"power_settings"}
                        power={props.settings.power}
                        setPower={handlePowerChange}
                        labelPosition="above"
                    />
                    <PowerOrderToggle
                        powerOrder={props.settings.powerOrder}
                        setPowerOrder={handlePowerOrderChange}
                        uniqueId={`${props.containerId}-powerOrder`} // Use containerId
                        layout="horizontal"
                        labelPosition="above"
                    />
                    <Dropdown
                        label={"combination_type"}
                        options={combinationTypeOptions.map((option) => ({
                            label: option,
                            value: option,
                        }))}
                        value={props.settings.combinationType}
                        onChange={handleCombinationTypeChange}
                    />
                </div>
            )}
        </BaseMathObjectSettingsContainer>
    );
};

export default TermsSettingsContainer;



