import React from "react";
import { ExerciseDocumentData } from "../types";
import ExerciseDetails from "./ExerciseDetails";
import { RenderQuestion } from "./renderers/RenderQuestion";
import { RenderOptions } from "./renderers/RenderOptions";
import { MathObjectSettings } from "@math/types/index";
import MathObjectSettingsListContainer from "../../../math/mathObjectSettings/components/MathObjectSettingsListContainer";
import { CollapsibleSection } from "@websites/ui";
import { convertToMathObjectSettings, convertToMathInput } from "../../../math/mathObjectSettings/utils/mathObjectUtils";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";

interface ExerciseEditorProps {
    selectedExercise: ExerciseDocumentData;
    handleFieldChange: <K extends keyof ExerciseDocumentData>(field: K, value: ExerciseDocumentData[K]) => void;
    showProps?: boolean;
}

/**
 * Component providing an interface for editing various aspects of an exercise,
 * including details, question, options (if applicable), and math object settings.
 * @param {ExerciseEditorProps} props - The component props.
 * @returns {React.ReactElement} The rendered ExerciseEditor component.
 */
const ExerciseEditor: React.FC<ExerciseEditorProps> = ({
    selectedExercise,
    handleFieldChange,
}) => {
    const { t } = useFallbackTranslation();
    
    const mathObjectSettingsList = selectedExercise.inputs.map(convertToMathObjectSettings);

    /**
     * Updates the 'inputs' field of the selected exercise when MathObjectSettings change.
     * @param {MathObjectSettings[]} newSettingsList - The updated list of settings.
     */
    const updateInputs = (newSettingsList: MathObjectSettings[]) => {
        const newInputs = newSettingsList.map(convertToMathInput);
        handleFieldChange("inputs", newInputs);
    };

    // Ensure inputs have a default example if missing for rendering purposes.
    const safeInputs = selectedExercise.inputs.map(input => ({
        example: input.example || "default_example"
    }));

    return (
        <div className="flex flex-col text-black gap-2">
            <ExerciseDetails
                selectedExercise={selectedExercise}
                handleFieldChange={handleFieldChange}
            />
            <RenderQuestion
                question={selectedExercise.question}
                questionInputs={safeInputs}
                onEdit={(updatedQuestion) => handleFieldChange("question", updatedQuestion)}
            />
            {selectedExercise.exerciseType === "test" ? (
                <RenderOptions
                    options={selectedExercise.options}
                    onOptionsChange={(updatedOptions) =>
                        handleFieldChange("options", updatedOptions)
                    }
                    optionsInputs={safeInputs}
                />
            ) : (
                <div style={{ marginTop: "20px" }}>
                    <p>{t("exercise_type_no_options")}</p>
                </div>
            )}
            <CollapsibleSection>
                <MathObjectSettingsListContainer
                    settingsList={mathObjectSettingsList}
                    setSettingsList={updateInputs}
                    showProps={true}
                />
            </CollapsibleSection>
        </div>
    );
};

export default ExerciseEditor;



