import React from "react";

export interface Option {
    label: string;
    value: string;
}

interface BaseToggleSwitchProps {
    value: string;
    options: readonly [Option, Option];
    onChange: (newValue: string) => void;
    widthClass?: string;
}

/**
 * A base toggle switch component that allows switching between two options.
 *
 * @param props The component props.
 * @param props.value The currently selected value.
 * @param props.options A tuple of two `Option` objects, each with a label and value.
 * @param props.onChange Callback function triggered when the switch value changes.
 * @param props.widthClass Optional. CSS class for controlling the width of the switch. Defaults to "w-20".
 * @returns A React element representing the toggle switch.
 */
const BaseToggleSwitch: React.FC<BaseToggleSwitchProps> = ({
    value,
    options,
    onChange,
    widthClass = "w-20",
}) => {
    const isLeftSelected = value === options[0].value;

    const toggle = () => {
        onChange(isLeftSelected ? options[1].value : options[0].value);
    };

    return (
        <div className="flex flex-col items-center mt-5">
            <button
                type="button"
                onClick={toggle}
                className={`relative inline-flex items-center h-6 ${widthClass} rounded transition-colors duration-300 focus:outline-none`}
            >
                {/* Sliding bubble */}
                <span
                    className={`absolute bottom-5 h-6 w-20 bg-white rounded-full shadow transform transition-transform duration-300 ${isLeftSelected ? "translate-y-5" : "translate-y-0"
                        }`}
                />

                {/* Left label */}
                <span
                    className={`absolute text-xs transition-colors duration-300 ${isLeftSelected ? "font-bold text-gray-800" : "text-gray-600"
                        }`}
                >
                    {options[0].label}
                </span>

                {/* Right label */}
                <span
                    className={`absolute bottom-6 text-xs transition-colors duration-300 ${!isLeftSelected ? "font-bold text-gray-800" : "text-gray-600"
                        }`}
                >
                    {options[1].label}
                </span>
            </button>
        </div>
    );
};

export default BaseToggleSwitch;
