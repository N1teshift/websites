import { parseAndRenderMath } from "@components/mathParser";
import React, { useState, useEffect } from "react";
import { useFallbackTranslation } from "@/features/infrastructure/i18n";

/**
 * Substitutes {inputN} placeholders in an array of question lines with corresponding example values.
 * @param {string[]} question - Array of strings representing the question lines.
 * @param {{ example: string }[]} inputs - Array of input objects containing example values.
 * @returns {string[]} Array of question lines with placeholders substituted.
 */
const substituteInputs = (
    question: string[],
    inputs: { example: string }[]
) => {
    return question.map((line) =>
        line.replace(/{input(\d+)}/g, (_, index) => {
            const inputIndex = parseInt(index, 10) - 1;
            const input = inputs[inputIndex];

            if (!input) return `{input${index}}`;

            const coloredExample = input.example;

            return coloredExample;
        })
    );
};


interface RenderQuestionProps {
    question: string[];
    questionInputs: { example: string }[];
    onEdit: (editedText: string[]) => void;
}

/**
 * Renders the question text of an exercise.
 * Allows editing the question in a textarea when clicked.
 * Substitutes placeholders like {input1} with example values for rendering.
 * @param {RenderQuestionProps} props - The component props.
 * @returns {React.ReactElement} The rendered RenderQuestion component.
 */
export const RenderQuestion: React.FC<RenderQuestionProps> = ({
    question,
    questionInputs,
    onEdit
}) => {

    const { t } = useFallbackTranslation();
    const [isEditing, setIsEditing] = useState(false);
    // Initialize state with the joined question prop.
    const [editedText, setEditedText] = useState(question.join("\n"));

    useEffect(() => {
        // Update state if the question prop changes externally.
        setEditedText(question.join("\n"));
    }, [question]);

    /**
     * Handles the submission of the edited question text.
     * Splits the textarea content into an array, trims lines, calls onEdit,
     * and exits editing mode.
     */
    const handleEditSubmit = () => {
        const updatedQuestion = editedText.split("\n").map((line) => line.trim());
        onEdit(updatedQuestion);
        setIsEditing(false);
    };

    // Pre-calculate the substituted question for rendering.
    const substitutedQuestion = substituteInputs(question, questionInputs);

    return (
        <div className="p-2 bg-gray-200 rounded-md">
            <h4 className="font-bold">{t("question")}</h4>
            {isEditing ? (
                <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    onBlur={handleEditSubmit}
                    className="w-full h-[150px] p-2.5 font-mono text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            ) : (
                <div
                    onClick={() => setIsEditing(true)}
                    className="p-2.5 bg-gray-50 border border-gray-200 rounded-md text-lg font-serif cursor-pointer block mb-2.5"
                >
                    {substitutedQuestion.map((line, index) => (
                        <div key={index} className="mb-1.5">
                            {parseAndRenderMath(line)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};



