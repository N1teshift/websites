import React from "react";
import BaseMathObjectSettingsContainer from "./BaseMathObjectSettingsContainer";
import { Dropdown, BooleanToggle, NumberInput } from "@websites/ui";
import {
  IntervalType,
  intervalTypeOptions,
  CapitalLetters,
  capitalLettersOptions,
  IntervalSettings,
  MathObjectContainerProps,
} from "@math/types/index";

/**
 * Container component for managing settings for an `Interval`.
 * Allows configuration of the interval's name, whether to show the name,
 * its type (open, closed, open-closed, closed-open), and its minimum length.
 *
 * @param {MathObjectContainerProps<IntervalSettings>} props - The component props, including settings, update callbacks, and display options.
 * @returns {React.ReactElement} The rendered interval settings UI.
 * @remarks
 * - Wraps content in `BaseMathObjectSettingsContainer`.
 * - Provides UI controls:
 *   - `Dropdown` for selecting the interval `name` (e.g., A, B, C).
 *   - `BooleanToggle` to control `showName`.
 *   - `Dropdown` to select the `intervalType` (open, closed, etc.).
 *   - `NumberInput` to set the `minimumLength` of the interval.
 */
const IntervalSettingsContainer: React.FC<MathObjectContainerProps<IntervalSettings>> = ({
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

  const handleIntervalTypeChange = (newIntervalType: string) => {
    updateSettings({ ...settings, intervalType: newIntervalType as IntervalType });
  };

  const handleMinimumLengthChange = (newMinimumLength: number) => {
    updateSettings({ ...settings, minimumLength: newMinimumLength });
  };

  return (
    <BaseMathObjectSettingsContainer
      containerId={containerId}
      settings={settings}
      updateSettings={updateSettings}
      startIndex={startIndex}
      showDescription={showDescription}
      objectType="interval"
    >
      {(props) => (
        <>
          <Dropdown
            label={"interval_name"}
            options={capitalLettersOptions.map((letter) => ({
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
            uniqueId="intervalShowNameToggle"
            label={"name_galininkas"}
            trueLabel={"show"}
            falseLabel={"hide"}
            layout="horizontal"
            labelPosition="above"
          />
          <Dropdown
            label={"interval_type"}
            options={intervalTypeOptions.map((option) => ({
              label: option,
              value: option,
            }))}
            value={props.settings.intervalType}
            onChange={handleIntervalTypeChange}
          />
          <NumberInput
            label={"minimum_length"}
            value={props.settings.minimumLength}
            onChange={handleMinimumLengthChange}
            min={1}
          />
        </>
      )}
    </BaseMathObjectSettingsContainer>
  );
};

export default IntervalSettingsContainer;
