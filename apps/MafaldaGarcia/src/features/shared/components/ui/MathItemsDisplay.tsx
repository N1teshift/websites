import React from "react";

interface MathItemsDisplayProps {
    mathItems: string[];
    fallbackMessage?: string;
}

/**
 * Displays a list of mathematical strings, rendering them using KaTeX via `parseAndRenderMath`.
 * Shows a fallback message if no math items are provided.
 *
 * @param props The component props.
 * @param props.mathItems An array of strings, where each string can contain LaTeX math expressions enclosed in `$...$`.
 * @param props.fallbackMessage Optional. A message to display if `mathItems` is empty.
 * @returns A React element displaying the rendered math items or a fallback message.
 */
const MathItemsDisplay: React.FC<MathItemsDisplayProps> = ({ mathItems, fallbackMessage }) => {
    return (
        <div className="p-1 bg-gray-100 rounded-md ">
            {mathItems.length > 0 ? (
                mathItems.map((item, index) => (
                    <div key={index} className="text-gray-800">
                        {item}
                    </div>
                ))
            ) : (
                <div className="text-gray-500">{fallbackMessage}</div>
            )}
        </div>
    );
};

export default MathItemsDisplay; 