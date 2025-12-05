import React from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";

interface IconButtonProps {
    icon: React.ReactNode;
    onClick: () => void;
    color?: "red" | "blue" | "green" | "yellow" | "purple" | "gray" | "black" | "white";
    size?: "small" | "medium" | "large";
    title?: string;
    disabled?: boolean;
    className?: string;
    variant?: "outline" | "filled";
}

const IconButton: React.FC<IconButtonProps> = ({
    icon,
    onClick,
    color = "gray",
    size = "medium",
    title,
    disabled = false,
    className = "",
    variant = "outline",
}) => {
    const { t } = useFallbackTranslation();

    const colorMap: Record<string, { base: string; hover: string; bg: string; filled: string; filledHover: string }> = {
        red: {
            base: "text-red-500",
            hover: "hover:text-red-700",
            bg: "hover:bg-red-50",
            filled: "bg-red-500 text-white",
            filledHover: "hover:bg-red-600"
        },
        blue: {
            base: "text-blue-500",
            hover: "hover:text-blue-700",
            bg: "hover:bg-blue-50",
            filled: "bg-blue-500 text-white",
            filledHover: "hover:bg-blue-600"
        },
        green: {
            base: "text-green-500",
            hover: "hover:text-green-700",
            bg: "hover:bg-green-50",
            filled: "bg-green-500 text-white",
            filledHover: "hover:bg-green-600"
        },
        yellow: {
            base: "text-yellow-500",
            hover: "hover:text-yellow-700",
            bg: "hover:bg-yellow-50",
            filled: "bg-yellow-500 text-white",
            filledHover: "hover:bg-yellow-600"
        },
        purple: {
            base: "text-purple-500",
            hover: "hover:text-purple-700",
            bg: "hover:bg-purple-50",
            filled: "bg-purple-500 text-white",
            filledHover: "hover:bg-purple-600"
        },
        gray: {
            base: "text-gray-500",
            hover: "hover:text-gray-700",
            bg: "hover:bg-gray-50",
            filled: "bg-gray-500 text-white",
            filledHover: "hover:bg-gray-600"
        },
        black: {
            base: "text-black",
            hover: "hover:text-gray-700",
            bg: "hover:bg-gray-50",
            filled: "bg-black text-white",
            filledHover: "hover:bg-gray-800"
        },
        white: {
            base: "text-white",
            hover: "hover:text-gray-200",
            bg: "hover:bg-gray-800",
            filled: "bg-white text-gray-900",
            filledHover: "hover:bg-gray-100"
        }
    };

    const sizeMap: Record<string, { padding: string; iconSize: string }> = {
        small: { padding: "p-1", iconSize: "w-3.5 h-3.5" },
        medium: { padding: "p-1.5", iconSize: "w-[18px] h-[18px]" },
        large: { padding: "p-2", iconSize: "w-6 h-6" }
    };

    const colorClasses = colorMap[color];
    const sizeClasses = sizeMap[size];
    const baseClasses = "transition-colors duration-200 rounded-full outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
    
    let enabledClasses: string;
    if (variant === "filled") {
        enabledClasses = `${colorClasses.filled} ${colorClasses.filledHover} cursor-pointer shadow-md hover:shadow-lg`;
    } else {
        enabledClasses = `${colorClasses.base} ${colorClasses.hover} ${colorClasses.bg} cursor-pointer`;
    }
    
    const disabledClasses = "text-gray-300 cursor-not-allowed";

    const buttonClasses = `${baseClasses} ${sizeClasses.padding} ${disabled ? disabledClasses : enabledClasses} ${className}`;

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={buttonClasses}
            title={title ? t(title) : undefined}
            aria-label={title ? t(title) : "Icon button"}
        >
            <div 
                className={`flex items-center justify-center ${sizeClasses.iconSize}`}
            >
                {icon}
            </div>
        </button>
    );
};

export default IconButton;

