import React, { useState, ReactNode } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

interface CollapsibleSectionProps {
    title?: string;
    children: ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [hoverText, setHoverText] = useState("");

    return (
        <div>
            <div className="flex justify-between items-center cursor-pointer relative" onClick={() => setIsExpanded(!isExpanded)}>
                <div
                    className="relative"
                    onMouseEnter={() => setHoverText(isExpanded ? "Collapse" : "Expand")}
                    onMouseLeave={() => setHoverText("")}
                >
                    {isExpanded ? (
                        <FiChevronDown className="text-xl text-text-primary" />
                    ) : (
                        <FiChevronRight className="text-xl text-text-primary" />
                    )}
                    {hoverText && (
                        <div className="absolute -top-8 left-0 whitespace-nowrap bg-black text-white text-xs py-1 px-2 rounded-md shadow-md z-50">{hoverText}</div>
                    )}
                </div>

                {title ? <h3 className="text-lg text-text-primary font-semibold">{title}</h3> : <div></div>}
            </div>
            {isExpanded && <div>{children}</div>}
        </div>
    );
};

export default CollapsibleSection;

