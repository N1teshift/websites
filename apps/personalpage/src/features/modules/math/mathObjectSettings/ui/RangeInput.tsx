import React from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";


export interface RangeInputProps {
    label: string;                // main label (translated)
    range: number[];              // [min, max], defaults to [0, 0]
    setRange: (value: number[]) => void; // updates the range array
    disabled?: boolean;           // disables the input fields if true, defaults to false
    labelPosition?: "above" | "left"; // position of the main label relative to the inputs, defaults to "above"
}

const RangeInput: React.FC<RangeInputProps> = ({ label, range, setRange, disabled = false, labelPosition = "above" }) => {
    const { t } = useFallbackTranslation();

    const handleRangeChange = (index: number, value: string) => {
        let newValue = value === "" ? 0 : parseFloat(value);

        // If updating the min value, ensure it's less than the current max.
        if (index === 0 && newValue >= range[1]) {
            newValue = range[1] - 1;
        }
        // If updating the max value, ensure it's greater than the current min.
        if (index === 1 && newValue <= range[0]) {
            newValue = range[0] + 1;
        }

        const newRange = [...range];
        newRange[index] = newValue;
        setRange(newRange);
    };

    const inputClasses = `border rounded bg-surface-card focus:outline-none text-center w-16
  ${disabled ? "border-border-default text-text-muted cursor-not-allowed" : "border-border-default text-text-primary"}`;



    return (
        <div className={`${labelPosition === "left" ? "flex items-center space-x-4" : "flex flex-col items-center"}`}>
            {/* Label */}
            <label className={`font-semibold ${disabled ? "text-text-muted" : "text-text-primary"} whitespace-nowrap`}>
                {t(label)}
            </label>

            {/* Input Container */}
            <div className="flex space-x-2">
                {/* Min Input */}
                <input
                    type="number"
                    value={range[0] !== undefined ? range[0] : ""}
                    onChange={(e) => handleRangeChange(0, e.target.value)}
                    disabled={disabled}
                    className={inputClasses}
                    placeholder="Min"
                />

                {/* Max Input */}
                <input
                    type="number"
                    value={range[1] !== undefined ? range[1] : ""}
                    onChange={(e) => handleRangeChange(1, e.target.value)}
                    disabled={disabled}
                    className={inputClasses}
                    placeholder="Max"
                />
            </div>
        </div>
    );
};

export default RangeInput;



