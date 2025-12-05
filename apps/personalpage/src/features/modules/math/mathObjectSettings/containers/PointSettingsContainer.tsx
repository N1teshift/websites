import React from "react";
import BaseMathObjectSettingsContainer from "./BaseMathObjectSettingsContainer";
import { Dropdown, BooleanToggle } from "@components/ui";
import { CapitalLetters, capitalLettersOptions, PointSettings, MathObjectContainerProps } from "../../types/index";

/**
 * Container component for managing settings for a `Point`.
 * Allows configuration of the point's name and whether to show the name.
 *
 * @param {MathObjectContainerProps<PointSettings>} props - The component props, including settings, update callbacks, and display options.
 * @returns {React.ReactElement} The rendered point settings UI.
 * @remarks
 * - Wraps content in `BaseMathObjectSettingsContainer`.
 * - Provides UI controls:
 *   - `Dropdown` for selecting the point `name` (e.g., A, B, C).
 *   - `BooleanToggle` to control `showName`.
 */
const PointSettingsContainer: React.FC<MathObjectContainerProps<PointSettings>> = ({
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
            objectType="point"
        >
            {(props) => (
                <>
                        <Dropdown
                            label={"point_name"}
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
                            uniqueId="pointShowNameToggle"
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

export default PointSettingsContainer;



