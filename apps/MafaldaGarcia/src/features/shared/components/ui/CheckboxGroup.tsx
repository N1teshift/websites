import React from "react";
import { useFallbackTranslation } from "@/features/i18n";

interface CheckboxGroupProps {
    label: string;
    options: string[];
    selectedOptions: string[];
    onChange: (option: string) => void;
    disabledOptions?: string[];
    lockedOptions?: string[];
    className?: string;
}

/**
 * Renders a group of checkboxes with a label.
 * Supports disabling and locking individual options.
 *
 * @param props The component props.
 * @param props.label The label for the checkbox group (translation key).
 * @param props.options An array of strings representing the available checkbox options (translation keys).
 * @param props.selectedOptions An array of strings representing the currently selected options.
 * @param props.onChange Callback function triggered when a checkbox state changes (only for non-locked options).
 * @param props.disabledOptions Optional. An array of option strings that should be disabled.
 * @param props.lockedOptions Optional. An array of option strings that should be checked and disabled (locked).
 * @param props.className Optional. Additional CSS classes for the container div.
 * @returns A React element representing the checkbox group.
 */
const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
    label,
    options,
    selectedOptions,
    onChange,
    disabledOptions = [],
    lockedOptions = [],
    className = "",
}) => {
    const { t } = useFallbackTranslation();

    return (
        <div className={`flex flex-col ${className}`}>
            <label className="font-semibold text-black">{t(label)}</label>
            <div className="flex flex-row flex-wrap">
                {options.map((option) => {
                    const isDisabled = disabledOptions.includes(option);
                    const isChecked = selectedOptions.includes(option) || lockedOptions.includes(option);
                    const isLocked = lockedOptions.includes(option);

                    return (
                        <label
                            key={option}
                            className={`flex items-center whitespace-nowrap ${isDisabled ? "text-gray-400 cursor-not-allowed" : "text-gray-800 cursor-pointer"
                                } hover:bg-gray-100 p-1 rounded`}
                        >
                            <input
                                type="checkbox"
                                value={option}
                                checked={isChecked}
                                onChange={() => !isLocked && onChange(option)}
                                disabled={isDisabled}
                                className={`mr-2 h-4 w-4 rounded border-gray-300 focus:ring-blue-500 ${isDisabled
                                        ? isChecked
                                            ? "bg-gray-300 border-gray-400 cursor-not-allowed"
                                            : "bg-gray-100 border-gray-200 cursor-not-allowed"
                                        : isChecked
                                            ? "bg-blue-500 border-blue-600 cursor-pointer"
                                            : "bg-white border-gray-400 cursor-pointer"
                                    }`}
                            />
                            <span>{t(option)}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

export default CheckboxGroup;