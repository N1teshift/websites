import React, { useEffect } from "react";
import BaseMathObjectSettingsContainer from "./BaseMathObjectSettingsContainer";
import {
    coefficientsRuleOptions, CoefficientsRule, CoefficientsSettings, MathObjectContainerProps, DEFAULT_COEFFICIENT_SETTINGS
} from "@math/types/index";
import useInterfaceType from "../hooks/useInterfaceType";
import { NumberInput, CheckboxGroup } from "@components/ui";
import useCollectionCountSync from "../hooks/useCollectionCountSync";

/**
 * Container component for managing settings for a collection of coefficients (`CoefficientsSettings`).
 * It wraps the UI in a `BaseMathObjectSettingsContainer` and provides controls for `collectionCount`
 * and `rules` applicable to the set of coefficients.
 *
 * @param {MathObjectContainerProps<CoefficientsSettings>} props - The component props, including settings, update callbacks, and display options.
 * @returns {React.ReactElement} The rendered coefficients settings UI.
 * @remarks
 * - Determines if settings should be "locked" (non-editable count/rules) if the parent `objectType`
 *   is "interval" or "point", as these often have fixed coefficient requirements.
 * - Includes an effect to synchronize the `rules` array based on the parent `objectType` (e.g., intervals require "increasing" and "neq").
 * - Uses the `useCollectionCountSync` hook to manage the number of individual coefficient settings within the `coefficients` array
 *   based on `collectionCount`, and to synchronize them with the `interfaceType`.
 * - Provides custom logic for handling mutually exclusive `CoefficientsRule` options (e.g., "increasing" vs. "decreasing").
 * - Conditionally renders UI for count and rules, hiding them if the settings are considered locked.
 */
const CoefficientsSettingsContainer: React.FC<MathObjectContainerProps<CoefficientsSettings>> = ({
    containerId,
    settings,
    updateSettings,
    startIndex = 1,
    showDescription = false,
    objectType = null,
}) => {
    const { interfaceType } = useInterfaceType(containerId);
    
    // Lock settings when used for intervals or points
    const isLocked = objectType === "interval" || objectType === "point";
    const disabledOptions = isLocked ? [...coefficientsRuleOptions] : [];

    // Sync coefficientsRules based on objectType
    useEffect(() => {
        if (objectType === "interval" && !settings.rules.every(rule => ["increasing", "neq"].includes(rule))) {
            updateSettings({ ...settings, rules: ["increasing", "neq"] as CoefficientsRule[] });
        } else if (objectType === "point" && settings.rules.length > 0) {
            updateSettings({ ...settings, rules: [] });
        }
    }, [objectType, settings, updateSettings]);

    // Use the common collection count sync hook with type assertion
    const typedUpdateSettings = (newSettings: Record<string, unknown>) => {
        updateSettings(newSettings as unknown as CoefficientsSettings);
    };

    const { handleCountChange } = useCollectionCountSync<
        typeof DEFAULT_COEFFICIENT_SETTINGS,
        Record<string, unknown>
    >(
        settings as unknown as Record<string, unknown>,
        typedUpdateSettings,
        "collectionCount",
        "coefficients",
        DEFAULT_COEFFICIENT_SETTINGS,
        interfaceType
    );

    const handleCheckboxChange = (option: CoefficientsRule) => {
        if (isLocked) return;
        
        let updatedRules = [...settings.rules];
        
        // Handle mutual exclusivity
        if (option === "increasing") updatedRules = updatedRules.filter(rule => rule !== "decreasing");
        if (option === "decreasing") updatedRules = updatedRules.filter(rule => rule !== "increasing");
        
        // Toggle the selected option
        updatedRules = settings.rules.includes(option)
            ? updatedRules.filter(rule => rule !== option)
            : [...updatedRules, option];
            
        updateSettings({ ...settings, rules: updatedRules });
    };

    return (
        <BaseMathObjectSettingsContainer
            containerId={containerId}
            settings={settings}
            updateSettings={updateSettings}
            startIndex={startIndex}
            showDescription={showDescription}
            objectType="coefficients"
        >
            {(props) => (
                <>
                    {objectType !== "point" && objectType !== "interval" && (
                        <>
                            <NumberInput
                                label={"collection_count"}
                                value={props.settings.collectionCount}
                                onChange={(value) => handleCountChange(value as number)}
                                min={1}
                                disabled={isLocked}
                            />
                            <CheckboxGroup
                                label={"coefficients_set_constraints"}
                                options={[...coefficientsRuleOptions]}
                                selectedOptions={props.settings.rules}
                                onChange={(option: string) => handleCheckboxChange(option as CoefficientsRule)}
                                disabledOptions={disabledOptions}
                                lockedOptions={[]}
                            />
                        </>
                    )}
                </>
            )}
        </BaseMathObjectSettingsContainer>
    );
};

export default CoefficientsSettingsContainer;



