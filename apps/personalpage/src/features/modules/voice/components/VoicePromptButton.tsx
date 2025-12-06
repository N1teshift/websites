import React, { useState, useEffect } from "react";
import { Button } from "@websites/ui";
import { PromptData } from "@ai/types";
import { useVoiceRecognition } from "../hooks/useVoiceRecognition";
import { generateSettings } from "@ai/core/objectGeneration";
import { ToastNotification } from "@websites/ui";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";

interface VoicePromptButtonProps {
    /** Callback function invoked with the voice prompt and its result after successful processing. */
    onResult: (data: PromptData) => void;
    /** Optional flag to disable the button. */
    disabled?: boolean;
    /** Optional callback function invoked when the processing state (listening or API call) changes. */
    onProcessingStateChange?: (isProcessing: boolean) => void;
}


const VoicePromptButton: React.FC<VoicePromptButtonProps> = ({
    onResult,
    disabled = false,
    onProcessingStateChange
}) => {
    const { t } = useFallbackTranslation();
    const [showVoiceError, setShowVoiceError] = useState(false);

    const { isListening, error: voiceError, startListening, clearError } = useVoiceRecognition(async (transcript: string) => {
        try {
            onProcessingStateChange?.(true); // Notify that processing (API call) has started
            const result = await generateSettings(transcript);
            onResult({ prompt: transcript, result });
        } catch (err: unknown) {
            console.error("Error in generateSettings with voice prompt", err);
            // Optionally notify error state or handle differently
        } finally {
            onProcessingStateChange?.(false); // Notify that processing has finished
        }
    });

    // Effect to show toast notification when voice recognition errors occur
    useEffect(() => {
        if (voiceError) {
            setShowVoiceError(true);
        }
    }, [voiceError]);

    /**
     * Handles closing the voice error toast notification.
     */
    const handleVoiceErrorClose = () => {
        setShowVoiceError(false);
        clearError();
    };

    // Determine button label based on listening state
    const buttonLabel = isListening ? t("listening") : t("voice_prompt");

    return (
        <>
            <Button
                onClick={startListening}
                variant="primary"
                disabled={isListening || disabled}
            >
                {buttonLabel}
            </Button>

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

export default VoicePromptButton;



