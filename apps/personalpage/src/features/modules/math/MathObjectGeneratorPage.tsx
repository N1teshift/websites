import { useState, useRef } from "react";
import { Button, LoadingOverlay } from "@websites/ui";
import MathItemsDisplay from "@/features/infrastructure/shared/components/ui/MathItemsDisplay";

import { MathObjectSettings, InterfaceType, DEFAULT_MATH_OBJECT_SETTINGS } from "@math/types/index";
import MathObjectSettingsListContainer from "@math/mathObjectSettings/components/MathObjectSettingsListContainer";
import { generate } from "@/features/modules/math/shared/Orchestrator";
import { convertToMathInput, convertToMathObjectSettings, buildInterfaceMapForInput } from "@math/mathObjectSettings/utils/mathObjectUtils";

import { VoicePromptButton, PromptButton } from "@/features/modules/voice";
import { GeneratedMathObjects } from "@ai/types";

export default function MathObjectGeneratorPage() {
    const [mathObjectSettingsList, setMathObjectSettingsList] = useState<MathObjectSettings[]>([DEFAULT_MATH_OBJECT_SETTINGS]);
    const [mathItems, setMathItems] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState<string>("");
    const [lastPrompt, setLastPrompt] = useState("");
    const presetInterfaceTypesRef = useRef<(interfaceTypes: Record<string, InterfaceType>) => void>(() => { });

    const handlePromptResult = async (data: { prompt: string; result?: GeneratedMathObjects }) => {
        if (!data.result) return;

        try {
            // Update lastPrompt state with the current prompt
            setLastPrompt(data.prompt);

            setIsGenerating(true);
            setLoadingMessage("Processing your request...");

            // Process the math inputs
            const mathInputs = data.result.objects;

            // Build a consolidated interfaceMap using the helper function
            let interfaceMap: Record<string, "simple" | "complex"> = {};
            mathInputs.forEach((input, index) => {
                interfaceMap = { ...interfaceMap, ...buildInterfaceMapForInput(input, index) };
            });

            // Update state with new settings and apply interface types
            const newMathObjectSettingsList = mathInputs.map(convertToMathObjectSettings);
            setMathObjectSettingsList(newMathObjectSettingsList);

            if (presetInterfaceTypesRef.current) {
                presetInterfaceTypesRef.current(interfaceMap);
            }
        } catch (error) {
            console.error("Error processing math objects:", error);
        } finally {
            setIsGenerating(false);
            setLoadingMessage("");
        }
    };

    const generateMathItems = () => {
        try {
            setErrorMessage("");
            const mathInputs = mathObjectSettingsList.map(convertToMathInput);
            const mathItemsArray = generate(mathInputs);
            setMathItems(mathItemsArray.map((input: string) => input));
        } catch (error) {
            console.error(error);
            setErrorMessage("Error: Generation failed - " + (error instanceof Error ? error.message : ''));
        }
    };

    return (
        <div className="w-full flex flex-col items-center gap-2 text-text-primary">
            <LoadingOverlay isVisible={isGenerating} message={loadingMessage} />

            <MathObjectSettingsListContainer
                settingsList={mathObjectSettingsList}
                setSettingsList={setMathObjectSettingsList}
                onInterfaceMapReady={(presetFunc) => {
                    presetInterfaceTypesRef.current = presetFunc;
                }}
            />

            {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}

            <div className="w-full flex flex-row">
                <Button
                    onClick={generateMathItems}
                    variant="success"
                >
                    generate
                </Button>
            </div>

            <MathItemsDisplay mathItems={mathItems} fallbackMessage="" />

            {/* Voice and Text Prompt Buttons */}
            <div className="w-full flex flex-row gap-2 mt-4">
                <VoicePromptButton
                    onResult={handlePromptResult}
                    onProcessingStateChange={(isProcessing) => {
                        setIsGenerating(isProcessing);
                        setLoadingMessage(isProcessing ? "Processing voice input..." : "");
                    }}
                />
                <PromptButton
                    onResult={handlePromptResult}
                    label="ai_prompt"
                />
            </div>

            {/* Display last prompt used */}
            {lastPrompt && (
                <div className="w-full mt-4 p-3 bg-surface-card border border-border-default rounded-lg">
                    <h3 className="font-semibold mb-2">Last Prompt:</h3>
                    <p className="text-sm text-text-secondary">{lastPrompt}</p>
                </div>
            )}
        </div>
    );
}



