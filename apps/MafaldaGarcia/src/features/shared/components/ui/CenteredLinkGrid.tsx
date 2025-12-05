import React from "react";
import Link from "next/link";
import { useFallbackTranslation } from "@/features/i18n";

interface LinkItem {
    href: string;
    titleKey: string;
    highlighted?: boolean;
}

interface CenteredLinkGridProps {
    links: LinkItem[];
}

/**
 * Displays a grid of centered link cards.
 * Each card is a link with a title (translated).
 * Optionally, cards can have a highlighted animated border.
 *
 * @param props The component props.
 * @param props.links An array of link items, each specifying the href, translation key for the title, and optional highlight status.
 * @returns A React element representing the grid of links.
 */
const CenteredLinkGrid: React.FC<CenteredLinkGridProps> = ({ links }) => {
    // Use fallback translation for link titles - they can be in any namespace
    const { t } = useFallbackTranslation();

    return (
        <>
            <div className="flex flex-col items-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    {links.map((link) => {
                        const linkClasses = "flex items-center justify-center w-full h-full bg-white border border-black text-black text-xl font-semibold rounded-md hover:shadow-lg transition-all text-center";
                        const wrapperBaseClasses = "w-60 h-60 rounded-md";
                        const wrapperHighlightClass = link.highlighted ? "animated-border-wrapper" : "";
                        const wrapperClass = `${wrapperBaseClasses} ${wrapperHighlightClass}`.trim();

                        return (
                            <div key={link.href} className={wrapperClass}>
                                <Link
                                    href={link.href}
                                    className={linkClasses}
                                    title={t(link.titleKey)}
                                >
                                    <span className="px-4">{t(`${link.titleKey}`)}</span>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default CenteredLinkGrid;