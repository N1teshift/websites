import React from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";

interface DropdownOption {
    label: string;
    value: string;
}

interface DropdownProps {
    label: string;
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean; // Optional disabled prop
    labelPosition?: "above" | "left";
}

/**
 * A general-purpose dropdown (select) component.
 *
 * @param props The component props.
 * @param props.label The label for the dropdown, which will be translated.
 * @param props.options An array of options for the dropdown, each with a label (for translation) and a value.
 * @param props.value The currently selected value.
 * @param props.onChange Callback function triggered when the selected value changes.
 * @param props.disabled Optional. If true, the dropdown is disabled. Defaults to false.
 * @param props.labelPosition Optional. Position of the label relative to the dropdown ("above" or "left"). Defaults to "above".
 * @returns A React element representing the dropdown.
 */
const Dropdown: React.FC<DropdownProps> = ({ label, options, value, onChange, disabled = false, labelPosition = "above" }) => {
    const { t } = useFallbackTranslation();

    return (
        <div className={`mb-0 ${labelPosition === "left" ? "flex items-center space-x-2" : "flex flex-col items-center"}`}>
            <label className={`font-semibold ${disabled ? "text-gray-400" : "text-black"} whitespace-nowrap`}>
                {t(label)}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`border rounded bg-white focus:outline-none text-center
            ${disabled ? "border-gray-300 text-gray-400 cursor-not-allowed" : "border-gray-500 text-black"}
            min-w-fit w-auto`}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value} className="text-black">
                        {t(option.label)}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Dropdown;
