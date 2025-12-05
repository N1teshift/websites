import React from "react";
import BaseMathObjectSettingsContainer from "./BaseMathObjectSettingsContainer";
import { NumberInput, Dropdown } from "@websites/ui";
import { PowerInput, PowerOrderToggle } from "../ui";
import {
    ExpressionSettings, CombinationType, combinationTypeOptions, MathObjectContainerProps, DEFAULT_TERM_SETTINGS
} from "@math/types/index";
import useInterfaceType from "../hooks/useInterfaceType";
import useCollectionCountSync from "../hooks/useCollectionCountSync";

/**
 * Container component for managing settings for an `Expression`.
 * Expressions can represent combinations of terms or other expressions.
 * This container handles the number of sub-expressions, the overall power/root applied
 * to the expression, and the type of combination used (e.g., addition, multiplication).
 *
 * @param {MathObjectContainerProps<ExpressionSettings>} props - The component props, including settings, update callbacks, and display options.
 * @returns {React.ReactElement} The rendered expression settings UI.
 * @remarks
 * - Wraps content in `BaseMathObjectSettingsContainer`.
 * - Determines if the expression is part of a simple-mode equation or inequality (`isSimpleParent`)
 *   to disable irrelevant controls (like combination type or power).
 * - Uses `useCollectionCountSync` to manage the `expressions` array (containing sub-terms/expressions)
 *   based on a count input, dynamically adjusting `combinationType` as needed.
 * - Provides UI controls: `NumberInput` for count, `PowerInput` and `PowerOrderToggle` for overall power/root,
 *   and `Dropdown` for `combinationType` (filtered based on the expression count).
 * - Conditionally renders most controls based on whether it's part of a simple equation/inequality.
 */
const ExpressionSettingsContainer: React.FC<MathObjectContainerProps<ExpressionSettings>> = ({
    containerId,
    settings,
    updateSettings,
    startIndex = 1,
    showDescription = false,
    objectType = null,
}) => {
    const parentContainerId = containerId.includes("-expression") || containerId.includes("-side-")
        ? containerId.split(/-(expression|side-\d+)/)[0]
        : containerId;
    const { interfaceType: parentInterfaceType } = useInterfaceType(parentContainerId);

    // Disable settings if parent is "equation" or "inequality" in "simple" mode
    const isSimpleParent = parentInterfaceType === "simple" && (objectType === "equation" || objectType === "inequality");

    /**
     * Handle additional updates when expression count changes
     */
    const handleExpressionCountChanges = (newCount: number) => {
        // Determine the appropriate combination type based on the new count
        const newCombinationType = newCount === 1
            ? "none"
            : ["none", "root_sq_div"].includes(settings.combinationType)
                ? "addition"
                : settings.combinationType;
        
        return { combinationType: newCombinationType };
    };

    // Create a synthetic count property since we don't have one in the type
    const settingsWithCount = {
        ...settings,
        // Using the array length directly as our count reference
        _expressionCount: settings.expressions.length
    };

    // Use the common collection count sync hook
    const { handleCountChange } = useCollectionCountSync(
        settingsWithCount,
        updateSettings,
        "_expressionCount",
        "expressions",
        DEFAULT_TERM_SETTINGS,
        parentInterfaceType,
        handleExpressionCountChanges
    );

    const handlePowerChange = (newPower: [number, number]) => {
        updateSettings({ ...settings, power: newPower });
    };

    const handlePowerOrderChange = (newPowerOrder: boolean) => {
        updateSettings({ ...settings, powerOrder: newPowerOrder });
    };

    const handleCombinationTypeChange = (newCombinationType: string) => {
        updateSettings({ ...settings, combinationType: newCombinationType as CombinationType });
    };

    const filteredCombinationOptions = combinationTypeOptions.filter((option) => {
        if (settings.expressions.length === 1) return option === "none" || option === "root_sq_div";
        if (settings.expressions.length === 2) return option !== "root_sq_div" && option !== "none";
        return option === "addition" || option === "subtraction" || option === "multiplication";
    }).map((option) => ({
        label: option,
        value: option,
    }));

    return (
        <BaseMathObjectSettingsContainer
            containerId={containerId}
            settings={settings}
            updateSettings={updateSettings}
            startIndex={startIndex}
            showDescription={showDescription}
            objectType="expression"
        >
            {(props) => {
                return (
                    <>
                        <NumberInput
                            label={"expression_count"}
                            value={props.settings.expressions.length}
                            onChange={handleCountChange}
                            min={isSimpleParent ? 2 : 1}
                            disabled={isSimpleParent}
                        />
                        {!isSimpleParent && (
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
                                    uniqueId={`${props.containerId}-powerOrder`}
                                    layout="horizontal"
                                    labelPosition="above"
                                />
                                <Dropdown
                                    label={"combination_type"}
                                    options={filteredCombinationOptions}
                                    value={props.settings.combinationType}
                                    onChange={handleCombinationTypeChange}
                                />
                            </>
                        )}
                    </>
                );
            }}
        </BaseMathObjectSettingsContainer>
    );
};

export default ExpressionSettingsContainer;



