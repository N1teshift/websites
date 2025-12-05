import React from "react";
import { useFallbackTranslation } from "@/features/i18n";

interface ButtonProps {
    onClick: () => void;
    label?: string;
    backgroundColor?: "red" | "blue" | "green" | "yellow" | "purple" | "gray" | "black" | "white";
    textColor?: "white" | "black";
    disabled?: boolean;
    icon?: React.ReactNode;
    type?: "button" | "submit" | "reset";
    cornerMode?: "rounded" | "slight";
    widthMode?: "fit-content" | "full-width";
}

const Button: React.FC<ButtonProps> = ({
    onClick,
    label = "Save Exercise",
    backgroundColor = "green",
    textColor = "white",
    disabled = false,
    icon,
    type = "button",
    cornerMode = "rounded",
    widthMode = "fit-content",
}) => {
    const { t } = useFallbackTranslation();

    // Map prop values to Tailwind color classes
    const bgMap: Record<string, string> = {
        red: "bg-red-500",
        blue: "bg-blue-500",
        green: "bg-green-600",
        yellow: "bg-yellow-400",
        purple: "bg-purple-500",
        gray: "bg-gray-400",
        black: "bg-black",
        white: "bg-white",
    };
    const textMap: Record<string, string> = {
        white: "text-white",
        black: "text-black",
    };
    const base = `mt-0.5 px-3 py-1.5 ${cornerMode === "slight" ? "rounded-md" : "rounded-2xl"} font-bold text-base outline-none transition duration-300 shadow-md`;
    const enabled = `${bgMap[backgroundColor] || "bg-green-600"} ${textMap[textColor] || "text-white"} hover:bg-gray-800 cursor-pointer${textColor === "black" ? " hover:text-white" : ""}`;
    const disabledCls = "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none";
    const className = `${base} ${disabled ? disabledCls : enabled}`;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${className} ${widthMode === "full-width" ? "w-full" : "w-fit"}`}
            aria-label={label}
        >
            <span className="flex items-center justify-center gap-x-2 w-full">
                <span className="text-center">{t(label)}</span>
                {icon && <span className="flex-shrink-0">{icon}</span>}
            </span>
        </button>
    );
};

export default Button;
