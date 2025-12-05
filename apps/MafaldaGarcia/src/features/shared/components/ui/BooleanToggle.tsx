import React from "react";
import { useFallbackTranslation } from "@/features/i18n";

interface BooleanToggleProps {
    value: boolean;
    setValue: (value: boolean) => void;
    uniqueId: string;
    label: string;
    trueLabel: string;
    falseLabel: string;
    layout?: "vertical" | "horizontal";
    labelPosition?: "above" | "left";
    disabled?: boolean;
}

/**
 * A toggle switch component for boolean values, using radio buttons.
 * Allows selection between a "true" and "false" state, with customizable labels.
 *
 * @param props The component props.
 * @param props.value The current boolean value.
 * @param props.setValue Callback function to update the boolean value.
 * @param props.uniqueId A unique identifier for the radio button group.
 * @param props.label The main label for the toggle (translation key).
 * @param props.trueLabel Label for the "true" option (translation key).
 * @param props.falseLabel Label for the "false" option (translation key).
 * @param props.layout Optional. Layout of the radio options ("vertical" or "horizontal"). Defaults to "vertical".
 * @param props.labelPosition Optional. Position of the main label ("above" or "left"). Defaults to "above".
 * @param props.disabled Optional. If true, the toggle is disabled. Defaults to false.
 * @returns A React element representing the boolean toggle.
 */
const BooleanToggle: React.FC<BooleanToggleProps> = ({
    value,
    setValue,
    uniqueId,
    label,
    trueLabel,
    falseLabel,
    layout = "vertical",
    labelPosition = "above",
    disabled = false
}) => {
    const { t } = useFallbackTranslation();

    return (
        <div className={`${labelPosition === "left" ? "flex items-center space-x-4" : "flex flex-col"}`}>
            {/* Main Label */}
            <label className={`font-semibold ${disabled ? "text-gray-400" : "text-black"} whitespace-nowrap`}>
                {t(label)}
            </label>
            <div className={`flex ${layout === "horizontal" ? "flex-row gap-4" : "flex-col gap-2"}`}>
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name={`toggle-${uniqueId}`}
                        value="true"
                        checked={value === true}
                        onChange={() => setValue(true)}
                        className="accent-blue-500"
                    />
                    <span>{t(trueLabel)}</span>
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name={`toggle-${uniqueId}`}
                        value="false"
                        checked={value === false}
                        onChange={() => setValue(false)}
                        className="accent-blue-500"
                    />
                    <span>{t(falseLabel)}</span>
                </label>
            </div>
        </div>
    );
};

export default BooleanToggle;