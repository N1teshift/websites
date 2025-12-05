import React from "react";
import BaseMathObjectSettingsContainer from "./BaseMathObjectSettingsContainer";
import { Dropdown, CheckboxGroup } from "@components/ui";
import RangeInput from "../ui/RangeInput";
import {
    numberSetOptions, coeficientRuleOptions, RepresentationType, CoefficientSettings, MathObjectContainerProps
} from "../../types/index";
import useInterfaceType from "../hooks/useInterfaceType";
import { useCoefficientSettings } from "../hooks/coefficientHooks";

/**
 * Container component for managing and displaying settings for a single coefficient.
 * It utilizes the `BaseMathObjectSettingsContainer` for common layout and description rendering.
 * Depending on the `interfaceType` (simple/complex) retrieved from context,
 * it renders different sets of UI controls for number set, representation type, rules, and range.
 *
 * @param {MathObjectContainerProps<CoefficientSettings>} props - The component props, including settings, update callbacks, and display options.
 * @returns {React.ReactElement} The rendered coefficient settings UI wrapped in a base container.
 * @remarks
 * - Uses the `useInterfaceType` hook to determine if the simple or complex UI should be shown.
 * - Leverages the `useCoefficientSettings` hook to manage state, derive available options (e.g., for representation type),
 *   handle disabled states for rules, and process updates to the settings.
 * - The UI consists of `Dropdown` for number set and representation type, `CheckboxGroup` for rules,
 *   and a custom `RangeInput` component.
 */
const CoefficientSettingsContainer: React.FC<MathObjectContainerProps<CoefficientSettings>> = ({
    containerId,
    settings,
    updateSettings,
    startIndex = 1,
    showDescription = false,
}) => {
    const { interfaceType } = useInterfaceType(containerId);
    
    // Use the combined coefficient settings hook
    const {
        representationTypeOptions,
        disabledOptions,
        handleRulesChange,
        handleNumberSetChange,
        handleRangeChange
    } = useCoefficientSettings(settings, updateSettings, interfaceType);

    /**
     * Renders the simple interface mode UI for coefficient settings
     */
    const renderSimpleMode = () => (
        <div className="flex flex-row items-center gap-4">
            <Dropdown
                label="number_set"
                value={settings.numberSet}
                options={[...numberSetOptions].map(opt => ({ value: opt, label: opt }))}
                onChange={handleNumberSetChange}
            />
            <RangeInput
                label="range"
                range={settings.range}
                setRange={handleRangeChange}
            />
        </div>
    );

    /**
     * Renders the complex interface mode UI for coefficient settings
     */
    const renderComplexMode = () => (
        <div className="flex flex-row items-center gap-4">
            <div className="flex flex-row items-center gap-4 flex-grow">
                <Dropdown
                    label="number_set"
                    value={settings.numberSet}
                    options={[...numberSetOptions].map(opt => ({ value: opt, label: opt }))}
                    onChange={handleNumberSetChange}
                />
                {representationTypeOptions.length > 0 && (
                    <Dropdown
                        label="representation_type"
                        value={settings.representationType}
                        options={representationTypeOptions}
                        onChange={(value) => updateSettings({ 
                            ...settings, 
                            representationType: value as RepresentationType 
                        })}
                    />
                )}
                <CheckboxGroup
                    label="coefficient_constraints"
                    options={[...coeficientRuleOptions]}
                    selectedOptions={settings.rules}
                    onChange={handleRulesChange}
                    disabledOptions={disabledOptions}
                />
            </div>
            <RangeInput
                label="range"
                range={settings.range}
                setRange={handleRangeChange}
            />
        </div>
    );

    return (
        <BaseMathObjectSettingsContainer
            containerId={containerId}
            settings={settings}
            updateSettings={updateSettings}
            startIndex={startIndex}
            showDescription={showDescription}
            objectType="coefficient"
        >
            {() => (
                <div>
                    {interfaceType === "simple" ? renderSimpleMode() : renderComplexMode()}
                </div>
            )}
        </BaseMathObjectSettingsContainer>
    );
};

export default CoefficientSettingsContainer;



