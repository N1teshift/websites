import React from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";


export interface PowerOrderToggleProps {
    powerOrder: boolean; // current boolean state, false usually means power first, true means root first
    setPowerOrder: (value: boolean) => void; // updates the powerOrder state
    uniqueId: string; // unique identifier for the radio button group name attribute
    layout?: "vertical" | "horizontal"; // layout direction for the radio buttons, defaults to "vertical"
    labelPosition?: "above" | "left"; // position of the main label ("first_f") relative to the options, defaults to "above"
    disabled?: boolean; // disables the radio buttons if true, defaults to false
}


const PowerOrderToggle: React.FC<PowerOrderToggleProps> = ({
    powerOrder,
    setPowerOrder,
    uniqueId,
    layout = "vertical",
    labelPosition = "above",
    disabled = false
}) => {
    const { t } = useFallbackTranslation();

    return (
        <div className={`${labelPosition === "left" ? "flex items-center space-x-4" : "flex flex-col"}`}>
            {/* Main Label */}
            <label className={`font-semibold ${disabled ? "text-text-muted" : "text-text-primary"} whitespace-nowrap text-center`}>
                {t("first_f")}
            </label>

            {/* Toggle Container */}
            <div className={`flex ${layout === "horizontal" ? "flex-row gap-2" : "flex-col gap-2"}`}>
                {/* Order Option */}
                <label className="flex items-center gap-1">
                    <input
                        type="radio"
                        name={`powerOrder-${uniqueId}`}
                        value="false"
                        checked={powerOrder === false}
                        onChange={() => setPowerOrder(false)}
                        disabled={disabled}
                        className={`accent-blue-500 ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                    />
                    <span className={`${disabled ? "text-text-muted" : "text-text-primary"}`}>{t("power")}</span>
                </label>

                {/* Root Option */}
                <label className="flex items-center gap-1">
                    <input
                        type="radio"
                        name={`powerOrder-${uniqueId}`}
                        value="true"
                        checked={powerOrder === true}
                        onChange={() => setPowerOrder(true)}
                        disabled={disabled}
                        className={`accent-blue-500 ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                    />
                    <span className={`${disabled ? "text-text-muted" : "text-text-primary"}`}>{t("root")}</span>
                </label>
            </div>
        </div>
    );
};

export default PowerOrderToggle;



