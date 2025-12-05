import React from "react";
import BaseMathObjectSettingsContainer from "./BaseMathObjectSettingsContainer";
import { Dropdown } from "@websites/ui";
import {
    InequalitySettings, MathObjectContainerProps, InequalityType, inequalityTypeOptions
} from "@math/types/index";

/**
 * Container component for managing settings for an `Inequality`.
 * Allows setting the `inequalityType` (e.g., less, greater, leq, geq).
 *
 * @param {MathObjectContainerProps<InequalitySettings>} props - The component props, including settings, update callbacks, and display options.
 * @returns {React.ReactElement} The rendered inequality settings UI.
 * @remarks
 * - Wraps content in `BaseMathObjectSettingsContainer`.
 * - Provides a `Dropdown` to select the inequality type from `inequalityTypeOptions`.
 */
const InequalitySettingsContainer: React.FC<MathObjectContainerProps<InequalitySettings>> = ({
    containerId,
    settings,
    updateSettings,
    startIndex = 1,
    showDescription = false,
    //objectType = null,
}) => {
    const handleInequalityTypeChange = (newInequalityType: InequalityType) => {
        updateSettings({ ...settings, inequalityType: newInequalityType });
    };

    return (
        <BaseMathObjectSettingsContainer
            containerId={containerId}
            settings={settings}
            updateSettings={updateSettings}
            startIndex={startIndex}
            showDescription={showDescription}
            objectType="inequality"
        >
            {(props) => (
                <>
                        <Dropdown
                            label={"inequality_type"}
                            options={inequalityTypeOptions.map(option => ({
                                label: option,
                                value: option,
                            }))}
                            value={props.settings.inequalityType || "less"}
                        onChange={(value) => handleInequalityTypeChange(value as InequalityType)}
                        labelPosition="left"
                        />
                </>
            )}
        </BaseMathObjectSettingsContainer>
    );
};

export default InequalitySettingsContainer;



