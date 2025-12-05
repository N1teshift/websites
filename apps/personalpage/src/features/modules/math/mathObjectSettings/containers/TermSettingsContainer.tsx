import React from "react";
import { PowerInput, PowerOrderToggle, TermIdsInput } from "../ui";
import { Dropdown } from "@websites/ui";
import BaseMathObjectSettingsContainer from "./BaseMathObjectSettingsContainer";
import { VariableName, variableNameOptions, TermSettings, MathObjectContainerProps } from "@math/types/index";

/**
 * Container component for managing settings for a `Term`.
 * A term is typically a coefficient multiplied by a variable raised to a power (e.g., ax^n),
 * and can also have an overall power/root applied to the entire term.
 *
 * @param {MathObjectContainerProps<TermSettings>} props - The component props, including settings, update callbacks, and display options.
 * @returns {React.ReactElement} The rendered term settings UI.
 * @remarks
 * - Wraps content in `BaseMathObjectSettingsContainer`.
 * - Provides UI controls for:
 *   - `power`: Overall power/root of the term (using `PowerInput`).
 *   - `powerOrder`: Order of applying power vs. root (using `PowerOrderToggle`).
 *   - `termIds`: Array of exponents for individual variable components, managed by `TermIdsInput`,
 *     which is synchronized with the `collectionCount` from the nested `coefficients` settings.
 *   - `variableName`: The variable symbol (e.g., x, y) selected via a `Dropdown`.
 */
const TermSettingsContainer: React.FC<MathObjectContainerProps<TermSettings>> = ({
    containerId,
    settings,
    updateSettings,
    startIndex = 1,
    showDescription = false,
    objectType = "term",
}) => {

    const handlePowerChange = (newPower: [number, number]) => {
        updateSettings({ ...settings, power: newPower });
    };

    const handlePowerOrderChange = (newPowerOrder: boolean) => {
        updateSettings({ ...settings, powerOrder: newPowerOrder });
    };

    const handleTermIdsChange = (newTermIds: string[]) => {
        updateSettings({ ...settings, termIds: newTermIds });
    };

    const handleVariableNameChange = (newVariable: string) => {
        updateSettings({ ...settings, variableName: newVariable as VariableName });
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
                <>
                    <PowerInput
                        label={"power_settings"}
                        power={props.settings.power}
                        setPower={handlePowerChange}
                        labelPosition="above"
                    />
                    <PowerOrderToggle
                        powerOrder={props.settings.powerOrder}
                        setPowerOrder={handlePowerOrderChange}
                        uniqueId={containerId}
                        labelPosition="above"
                        layout="horizontal"
                    />
                    <TermIdsInput
                        termIds={props.settings.termIds}
                        setTermIds={handleTermIdsChange}
                        collectionCount={props.settings.coefficients.collectionCount}
                    />
                    <Dropdown
                        label={"variable"}
                        options={variableNameOptions.map((option) => ({ label: option, value: option }))}
                        value={props.settings.variableName || variableNameOptions[0]}
                        onChange={handleVariableNameChange}
                    />
                </>
            )}
        </BaseMathObjectSettingsContainer>
    );
};

export default TermSettingsContainer;



