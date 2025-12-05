import React from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";

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

