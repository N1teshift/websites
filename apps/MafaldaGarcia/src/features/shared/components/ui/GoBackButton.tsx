import React from "react";
import Link from "next/link";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";

interface GoBackButtonProps {
    target?: string; // Optional target prop, default is "/"
    absolute?: boolean; // New prop to control absolute positioning
}

/** Go back button linking to a target page (default: "/"). */
const GoBackButton = ({ target = "/", absolute = true }: GoBackButtonProps) => {
    const { t } = useFallbackTranslation();

    // Absolute if true, else inline
    const buttonClass = absolute ? "absolute top-4 left-4" : "flex items-center";

    return (
        <div className={buttonClass}>
            <Link href={target} className="px-4 py-2 rounded text-black bg-gray-100 border border-black hover:bg-gray-200">
                {t("go_back")}
            </Link>
        </div>
    );
};

export default GoBackButton;
