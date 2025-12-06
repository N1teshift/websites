import React from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";

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
                    className={`font-semibold ${disabled ? "text-gray-400" : "text-black"} text-center`}
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
                className={`border rounded bg-white focus:outline-none text-center
          ${disabled ? "border-gray-300 text-gray-400 cursor-not-allowed" : "border-gray-500 text-black"}
          w-10`}
            />
        </div>
    );
};

export default NumberInput;
