import { Dropdown, NumberInput } from "@components/ui";
import {
    exerciseTypeOptions, topicTypeOptions, difficultyTypeOptions, ExerciseType, TopicType,
    DifficultyType, ExerciseDocumentData
} from "../types";

interface ExerciseDetailsProps {
    selectedExercise: {
        exerciseType: ExerciseType;
        points: number;
        topicType: TopicType;
        difficultyType: DifficultyType;
        steps: number;
    };
    /**
     * Callback function to handle changes in exercise fields.
     * @param field - The field name being changed.
     * @param value - The new value for the field.
     */
    handleFieldChange: <K extends keyof ExerciseDocumentData>(field: K, value: ExerciseDocumentData[K]) => void;
}

/**
 * Type guard to check if a string is a valid ExerciseType.
 */
function isExerciseType(value: string): value is ExerciseType {
    return exerciseTypeOptions.includes(value as ExerciseType);
}

/**
 * Type guard to check if a string is a valid TopicType.
 */
function isTopicType(value: string): value is TopicType {
    return topicTypeOptions.includes(value as TopicType);
}

/**
 * Type guard to check if a string is a valid DifficultyType.
 */
function isDifficultyType(value: string): value is DifficultyType {
    return difficultyTypeOptions.includes(value as DifficultyType);
}

/**
 * Component for displaying and editing core details of an exercise,
 * such as type, points, topic, difficulty, and steps.
 * @param {ExerciseDetailsProps} props - The component props.
 * @returns {React.ReactElement} The rendered ExerciseDetails component.
 */
const ExerciseDetails: React.FC<ExerciseDetailsProps> = ({ selectedExercise, handleFieldChange }) => {
    const handleExerciseTypeChange = (value: string) => {
        if (isExerciseType(value)) {
            handleFieldChange("exerciseType", value);
        }
    };

    const handleTopicTypeChange = (value: string) => {
        if (isTopicType(value)) {
            handleFieldChange("topicType", value);
        }
    };

    const handleDifficultyTypeChange = (value: string) => {
        if (isDifficultyType(value)) {
            handleFieldChange("difficultyType", value);
        }
    };

    return (
        <div className="flex gap-2 bg-gray-200 rounded-lg shadow-sm">
            <Dropdown
                label={"type"}
                options={[
                    { label: "undefined", value: "undefined" },
                    ...exerciseTypeOptions.map((option) => ({ label: option, value: option })),
                ]}
                value={selectedExercise?.exerciseType || "undefined"}
                onChange={handleExerciseTypeChange}
            />
            <NumberInput
                label={"points"}
                value={selectedExercise?.points}
                onChange={(value) => handleFieldChange("points", value)}
            />
            <Dropdown
                label={"topic"}
                options={[
                    { label: "undefined_f", value: "undefined" },
                    ...topicTypeOptions.map((option) => ({ label: option, value: option })),
                ]}
                value={selectedExercise?.topicType || "undefined"}
                onChange={handleTopicTypeChange}
            />
            <Dropdown
                label={"difficulty"}
                options={[
                    { label: "undefined", value: "undefined" },
                    ...difficultyTypeOptions.map((option) => ({ label: option, value: option })),
                ]}
                value={selectedExercise?.difficultyType || "undefined"}
                onChange={handleDifficultyTypeChange}
            />
            <NumberInput
                label={"steps"}
                value={selectedExercise?.steps}
                onChange={(value) => handleFieldChange("steps", value)}
            />
        </div>
    );
};

export default ExerciseDetails;



