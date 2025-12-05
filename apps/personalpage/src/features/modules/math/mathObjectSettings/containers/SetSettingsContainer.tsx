import React from "react";
import BaseMathObjectSettingsContainer from "./BaseMathObjectSettingsContainer";
import Dropdown from "@components/ui/Dropdown";
import BooleanToggle from "@components/ui/BooleanToggle";
import { SetSettings, MathObjectContainerProps, CapitalLetters, capitalLettersOptions } from "@math/types/index";

/**
 * Container component for managing settings for a `Set`.
 * Allows configuration of the set's name and whether to show the name.
 *
 * @param {MathObjectContainerProps<SetSettings>} props - The component props, including settings, update callbacks, and display options.
 * @returns {React.ReactElement} The rendered set settings UI.
 * @remarks
 * - Wraps content in `BaseMathObjectSettingsContainer`.
 * - Provides UI controls:
 *   - `Dropdown` for selecting the set `name` (e.g., A, B, C).
 *   - `BooleanToggle` to control `showName`.
 */
const SetSettingsContainer: React.FC<MathObjectContainerProps<SetSettings>> = ({
    containerId,
    settings,
    updateSettings,
    startIndex = 1,
    showDescription = false,
    //objectType = null,
}) => {
    const handleNameChange = (newName: string) => {
        updateSettings({ ...settings, name: newName as CapitalLetters });
    };

    const handleShowNameChange = (newShowName: boolean) => {
        updateSettings({ ...settings, showName: newShowName });
    };

    return (
        <BaseMathObjectSettingsContainer
            containerId={containerId}
            settings={settings}
            updateSettings={updateSettings}
            startIndex={startIndex}
            showDescription={showDescription}
            objectType="set"
        >
            {(props) => (
                <>
                        <Dropdown
                            label={"set_name"}
                            options={capitalLettersOptions.map(letter => ({
                                label: letter,
                                value: letter,
                            }))}
                            value={props.settings.name}
                        onChange={handleNameChange}
                            labelPosition="above"
                        />
                        <BooleanToggle
                            value={settings.showName}
                            setValue={handleShowNameChange}
                            uniqueId="setShowNameToggle"
                            label={"name_galininkas"}
                            trueLabel={"show"}
                            falseLabel={"hide"}
                            layout="horizontal"
                            labelPosition="above"
                        />
                </>
            )}
        </BaseMathObjectSettingsContainer>
    );
};

export default SetSettingsContainer;



