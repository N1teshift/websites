import React from "react";
import BaseMathObjectSettingsContainer from "./BaseMathObjectSettingsContainer";
import Dropdown from "@components/ui/Dropdown";
import { FunctionSettings, MathObjectContainerProps, FunctionName, functionNameOptions } from "@math/types/index";

/**
 * Container component for managing settings for a `Function`.
 * Currently, only allows setting the `functionName` (e.g., f, g, h).
 *
 * @param {MathObjectContainerProps<FunctionSettings>} props - The component props, including settings, update callbacks, and display options.
 * @returns {React.ReactElement} The rendered function settings UI.
 * @remarks
 * - Wraps content in `BaseMathObjectSettingsContainer`.
 * - Provides a `Dropdown` to select the function name from `functionNameOptions`.
 */
const FunctionSettingsContainer: React.FC<MathObjectContainerProps<FunctionSettings>> = ({
    containerId,
    settings,
    updateSettings,
    startIndex = 1,
    showDescription = false,
    //objectType = null,
}) => {
    const handleVariableNameChange = (newFunctionName: string) => {
        updateSettings({ ...settings, functionName: newFunctionName as FunctionName });
    };

    return (
        <BaseMathObjectSettingsContainer
            containerId={containerId}
            settings={settings}
            updateSettings={updateSettings}
            startIndex={startIndex}
            showDescription={showDescription}
            objectType="function"
        >
            {(props) => (
                <>
                        <Dropdown
                            label={"function_name"}
                            options={functionNameOptions.map(option => ({
                                label: option,
                                value: option,
                            }))}
                            value={props.settings.functionName || "f"}
                            onChange={handleVariableNameChange}
                            labelPosition={"above"}
                        />
                </>
            )}
        </BaseMathObjectSettingsContainer>
    );
};

export default FunctionSettingsContainer;



