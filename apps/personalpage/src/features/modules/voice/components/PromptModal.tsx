import React, { useState, useEffect } from "react";
import { Button } from "@websites/ui";
import { PromptData, GeneratedMathObjects } from "@ai/types";
import { useVoiceRecognition } from "../hooks/useVoiceRecognition";
import { generateSettings } from "@/features/infrastructure/ai/core/objectGeneration";
import ToastNotification from "@/features/infrastructure/shared/components/ui/ToastNotification";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";

interface PromptModalProps {
    onClose: () => void; // Function to call when the modal should be closed.
    initialPrompt?: string; // Optional initial text to prefill the prompt input.
    onResult?: (data: PromptData) => void; // Optional callback function invoked with the prompt and its result upon successful submission.
}


const PromptModal: React.FC<PromptModalProps> = ({ onClose, initialPrompt = "", onResult }) => {
    const { t } = useFallbackTranslation();

    const [prompt, setPrompt] = useState(initialPrompt);
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<GeneratedMathObjects | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showVoiceError, setShowVoiceError] = useState(false);

    const { isListening, error: voiceError, startListening, clearError } = useVoiceRecognition((transcript: string) => {
        setPrompt(transcript); // Update prompt state with voice transcript
    });

    // Effect to update prompt if initialPrompt prop changes
    useEffect(() => {
        setPrompt(initialPrompt);
    }, [initialPrompt]);

    // Effect to show toast notification when voice recognition errors occur
    useEffect(() => {
        if (voiceError) {
            setShowVoiceError(true);
        }
    }, [voiceError]);

    const handleVoiceErrorClose = () => {
        setShowVoiceError(false);
        clearError();
    };

    const handleSend = async () => {
        if (!prompt.trim()) return; // Prevent sending empty prompts
        setError(null);
        setIsLoading(true);
        setResponse(null);
        try {
            const result = await generateSettings(prompt);
            setResponse(result);
            if (onResult) {
                onResult({ prompt, result });
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : t('unknown_error_occurred');
            console.error('Error in prompt processing:', errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setPrompt(""); // Reset prompt text
        setResponse(null); // Clear any previous response
        setError(null); // Clear any previous error
        clearError(); // Clear any voice recognition errors
        onClose(); // Close the modal
    };

    // Render the modal UI
    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-surface-card p-6 rounded-lg shadow-lg w-full max-w-md">
                    <h3 className="text-lg font-bold mb-4">{t('enter_your_prompt')}</h3>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t('type_your_prompt_here')}
                        className="w-full h-32 p-2 border border-border-default rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-brand bg-surface-card text-text-primary"
                        disabled={isLoading}
                    />
                    {response && (
                        <div className="mt-4 p-2 bg-surface-button rounded-md">
                            <strong>{t('response_label')}:</strong>
                            <pre className="whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
                        </div>
                    )}
                    {error && (
                        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}
                    <div className="mt-4 flex gap-2">
                        <Button
                            onClick={handleSend}
                            variant="success"
                            disabled={isLoading || !prompt.trim()}
                        >
                            {isLoading ? t("processing") : t("send")}
                        </Button>
                        <Button
                            onClick={handleCancel}
                            variant="danger"
                            disabled={isLoading}
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            onClick={startListening} // Use the function from the hook
                            variant="primary"
                            disabled={isListening}
                        >
                            {isListening ? t("listening") : t("voice_prompt")}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Voice Recognition Error Toast */}
            {voiceError && (
                <ToastNotification
                    messageKey={voiceError.messageKey}
                    visible={showVoiceError}
                    type="error"
                    duration={6000}
                    onClose={handleVoiceErrorClose}
                />
            )}
        </>
    );
};

export default PromptModal;



