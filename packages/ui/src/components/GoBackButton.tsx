import React from "react";
import Link from "next/link";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";
import { Button } from "./Button";

interface GoBackButtonProps {
    target?: string;
    absolute?: boolean;
}

const GoBackButton = ({ target = "/", absolute = true }: GoBackButtonProps) => {
    const { t } = useFallbackTranslation();

    const containerClass = absolute ? "absolute top-4 left-4 z-50" : "flex items-center";

    return (
        <div className={containerClass}>
            <Link href={target}>
                <Button variant="subliminal">
                    {t("go_back")}
                </Button>
            </Link>
        </div>
    );
};

export default GoBackButton;

