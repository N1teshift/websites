import React from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";


export interface PowerInputProps {
    label: string; // main label (translated)
    power: [number, number]; // [power, root], defaults to [1, 1]
    setPower: (value: [number, number]) => void; // updates the power array
    disabled?: boolean; // disables input fields if true
    labelPosition?: "above" | "left"; // label position, defaults to "above"
}

const PowerInput: React.FC<PowerInputProps> = ({
    label,
    power = [1, 1],
    setPower,
    disabled = false,
    labelPosition = "above"
}) => {
    const { t } = useFallbackTranslation();

    const handlePowerChange = (index: number, value: string) => {
        const newPower = [...power];
        const parsedValue = value === "" ? 0 : parseInt(value, 10);

        if (index === 0) {
            newPower[index] = parsedValue;
        } else {
            newPower[index] = parsedValue < 1 ? 1 : parsedValue;
        }

        setPower(newPower as [number, number]);
    };

    return (
        <div className={`${labelPosition === "left" ? "flex items-center space-x-4" : "flex flex-col"}`}>
            {/* Main Label */}
            <label className={`font-semibold ${disabled ? "text-text-muted" : "text-text-primary"} whitespace-nowrap text-center`}>
                {t(label)}
            </label>

            {/* Input Container */}
            <div className="flex space-x-4">
                {/* Order Input */}
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium">{t("power")}</label>
                    <input
                        type="number"
                        value={power?.[0] ?? 0}
                        onChange={(e) => handlePowerChange(0, e.target.value)}
                        disabled={disabled}
                        className={`border rounded bg-surface-card focus:outline-none text-center
                            ${disabled ? "border-border-default text-text-muted cursor-not-allowed" : "border-border-default text-text-primary"}
                            w-12`}
                        placeholder={t("power")}
                    />
                </div>

                {/* Root Input */}
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium">{t("root")}</label>
                    <input
                        type="number"
                        value={power?.[1] ?? 1}
                        onChange={(e) => handlePowerChange(1, e.target.value)}
                        disabled={disabled}
                        className={`border rounded bg-surface-card focus:outline-none text-center
                            ${disabled ? "border-border-default text-text-muted cursor-not-allowed" : "border-border-default text-text-primary"}
                            w-12`}
                        placeholder={t("root")}
                        min={1}
                    />
                </div>
            </div>
        </div>
    );
};

export default PowerInput;



