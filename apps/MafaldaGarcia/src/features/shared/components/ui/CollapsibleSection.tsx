import React, { useState, ReactNode } from "react";

interface CollapsibleSectionProps {
    title?: string; // Optional title
    children: ReactNode;
}

/**
 * A component that displays a section of content which can be collapsed or expanded.
 * Shows an optional title and a toggle arrow.
 *
 * @param props The component props.
 * @param props.title Optional. The title displayed in the section header.
 * @param props.children The content to be displayed within the collapsible section.
 * @returns A React element representing the collapsible section.
 */
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [hoverText, setHoverText] = useState("");

    return (
        <div>
            <div className="flex justify-between items-center cursor-pointer relative" onClick={() => setIsExpanded(!isExpanded)}>
                {/* Always show toggle button */}
                <div
                    className="relative"
                    onMouseEnter={() => setHoverText(isExpanded ? "Collapse" : "Expand")}
                    onMouseLeave={() => setHoverText("")}
                >
                    <span className="text-xl">{isExpanded ? "▲" : "▼"}</span>
                    {hoverText && (
                        <div className="absolute -top-6 right-0 bg-black text-white text-xs py-1 px-2 rounded-md shadow-md">{hoverText}</div>
                    )}
                </div>

                {/* Render title if provided */}
                {title ? <h3 className="text-lg text-black font-semibold">{title}</h3> : <div></div>}
            </div>
            {isExpanded && <div>{children}</div>}
        </div>
    );
};

export default CollapsibleSection;
