import React from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";

interface CheckboxGroupProps {
    label: string;
    options: string[];
    selectedOptions: string[];
    onChange: (option: string) => void;
    disabledOptions?: string[];
    lockedOptions?: string[];
    className?: string;
}

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
            <label className="font-semibold text-text-primary">{t(label)}</label>
            <div className="flex flex-row flex-wrap">
                {options.map((option) => {
                    const isDisabled = disabledOptions.includes(option);
                    const isChecked = selectedOptions.includes(option) || lockedOptions.includes(option);
                    const isLocked = lockedOptions.includes(option);

                    return (
                        <label
                            key={option}
                            className={`flex items-center whitespace-nowrap ${isDisabled ? "text-text-muted cursor-not-allowed" : "text-text-primary cursor-pointer"
                                } hover:bg-surface-button-hover p-1 rounded`}
                        >
                            <input
                                type="checkbox"
                                value={option}
                                checked={isChecked}
                                onChange={() => !isLocked && onChange(option)}
                                disabled={isDisabled}
                                className={`mr-2 h-4 w-4 rounded border-border-default focus:ring-brand ${isDisabled
                                    ? isChecked
                                        ? "bg-surface-button border-border-default cursor-not-allowed"
                                        : "bg-surface-card border-border-default cursor-not-allowed"
                                    : isChecked
                                        ? "bg-brand border-brand cursor-pointer"
                                        : "bg-surface-card border-border-default cursor-pointer"
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

