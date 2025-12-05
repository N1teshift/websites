import React from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";

interface NumberInputProps {
    label?: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    placeholder = "",
    disabled = false,
    required = false,
    className = ""
}) => {
    const { t } = useFallbackTranslation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const parsedValue = parseInt(e.target.value, 10);
        onChange(isNaN(parsedValue) ? (min || 0) : parsedValue);
    };

    return (
        <div className={`flex flex-col items-center ${className}`}>
            {label && (
                <label
                    className={`font-semibold ${disabled ? "text-text-muted" : "text-text-primary"} text-center`}
                >
                    {t(label)}
                </label>
            )}
            <input
                type="number"
                value={value}
                onChange={handleChange}
                min={min}
                max={max}
                step={step}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                className={`border rounded bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand text-center
          ${disabled ? "border-border-default text-text-muted cursor-not-allowed opacity-60" : "border-border-default text-text-primary"}
          w-10`}
            />
        </div>
    );
};

export default NumberInput;

